// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols

import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { BN, Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs/operators";


export function estimateLiquidityForCoinA(sqrtPriceX: BN, sqrtPriceY: BN, coinAmount: BN) {
  const lowerSqrtPriceX64 = BN.min(sqrtPriceX, sqrtPriceY);
  const upperSqrtPriceX64 = BN.max(sqrtPriceX, sqrtPriceY);
  const num = fromX64_BN(coinAmount.mul(upperSqrtPriceX64).mul(lowerSqrtPriceX64));
  const dem = upperSqrtPriceX64.sub(lowerSqrtPriceX64);
  return num.div(dem);
}

export enum MathErrorCode {
  IntegerDowncastOverflow = `IntegerDowncastOverflow`,
  MulOverflow = `MultiplicationOverflow`,
  MulDivOverflow = `MulDivOverflow`,
  MulShiftRightOverflow = `MulShiftRightOverflow`,
  MulShiftLeftOverflow = `MulShiftLeftOverflow`,
  DivideByZero = `DivideByZero`,
  UnsignedIntegerOverflow = `UnsignedIntegerOverflow`,
  InvalidCoinAmount = `InvalidCoinAmount`,
  InvalidLiquidityAmount = `InvalidLiquidityAmount`,
  InvalidReserveAmount = `InvalidReserveAmount`,
  InvalidSqrtPrice = `InvalidSqrtPrice`,
  NotSupportedThisCoin = `NotSupportedThisCoin`,
  InvalidTwoTickIndex = `InvalidTwoTickIndex`,
}

export class ClmmpoolsError extends Error {
  override message: string;

  errorCode?: MathErrorCode;

  constructor(message: string, errorCode?: MathErrorCode) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
  }

  static isClmmpoolsErrorCode(e: any, code: MathErrorCode): boolean {
    return e instanceof ClmmpoolsError && e.errorCode === code;
  }
}


export interface CalLpTokenAmountBase {
  amountA: number;
  amountB: number;
  compositionA: number;
  compositionB: number;
  place: number;
}

export interface CalLpTokenAmountResult extends CalLpTokenAmountBase {
  tick_current_index: number;
  tick_lower_index: number;
  tick_upper_index: number;
  price_current: string;
  price_lower: string;
  price_upper: string;
}

function fromX64_BN(num: BN): BN {
  return num.div(new BN(2).pow(new BN(64)));
}

function estimateLiquidityForCoinB(sqrtPriceX: BN, sqrtPriceY: BN, coinAmount: BN) {
  const lowerSqrtPriceX64 = BN.min(sqrtPriceX, sqrtPriceY);
  const upperSqrtPriceX64 = BN.max(sqrtPriceX, sqrtPriceY);
  const delta = upperSqrtPriceX64.sub(lowerSqrtPriceX64);
  return coinAmount.shln(64).div(delta);
}

function getPriceFunction(coinType: string): Promise<string | number | undefined> {
  const url = "https://api.turbos.finance/price";
  const params = { coinType: coinType };
  const httpServer = new HttpService();
  return httpServer.get(url, { params }).pipe(map(response => response.data["price"])).toPromise();
}

@Injectable()
export class LiquidityService {
  constructor(private httpService: HttpService) {
  }

  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);

  sender = getWalletAddress();
  privateKey = getWalletPrivateKey();
  keypair = genKeypair(this.privateKey);

  private mappingNFT(results) {
    const hasNextPage = results.hasNextPage;
    const nextCursor = results.nextCursor;
    const data = results.data;
    const nfts = data.map(item => ({
      "objectId": item.data.objectId,
      "owner": item.data.owner["AddressOwner"],
      "img_url": item.data.content["fields"]["img_url"],
      "name": item.data.content["fields"]["name"],
      "pool_id": item.data.content["fields"]["pool_id"],
      "position_id": item.data.content["fields"]["position_id"],
    }));
    return {
      "hasNextPage": hasNextPage,
      "nextCursor": nextCursor,
      "nfts": nfts,
    };
  }

  protected bitToSqrtPriceBN(num: number): BN {
    const tickindex = this.sdk.math.bitsToNumber(num);
    return this.sdk.math.tickIndexToSqrtPriceX64(tickindex);
  }

  protected bitToPrice(num: number, decimalsA: number, decimalsB: number): string {
    const tickindex = this.sdk.math.bitsToNumber(num);
    return this.sdk.math.tickIndexToPrice(tickindex, decimalsA, decimalsB).toString();


  }

  protected bitToTickIndex(num: number): number {
    return this.sdk.math.bitsToNumber(num);
  }

  protected tickIndexToPrice(tickIndex, decimalsA: number, decimalsB: number) {
    return this.sdk.math.tickIndexToPrice(tickIndex, decimalsA, decimalsB);
  }

  protected bitToAny(num: number, decimalsA: number, decimalsB: number): [number, BN, string] {
    const tickIndex = this.sdk.math.bitsToNumber(num);
    const sqrtPriceX64 = this.sdk.math.tickIndexToSqrtPriceX64(tickIndex);
    const price = this.sdk.math.tickIndexToPrice(tickIndex, decimalsA, decimalsB).toString();
    return [tickIndex, sqrtPriceX64, price];
  }

  async getPositionIDsByOwner(owner: string, cursor?: string) {
    const results = await this.sdk.provider.getOwnedObjects(
      {
        owner: owner,
        /**
         * An optional paging cursor. If provided, the query will start from the next item after the specified
         * cursor. Default to start from the first item if not specified.
         */
        cursor: cursor,
        /** Max number of items returned per page, default to [QUERY_MAX_RESULT_LIMIT] if not specified. */
        filter: { Package: "0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1" },
        options: {
          showContent: true,
          showOwner: true,
        },
      },
    );
    return this.mappingNFT(results);
  }


  // 获取用户仓位2-备用
  async getPositionIDsByOwner2(owner: string) {

    const url = "https://api.shinami.com/node/v1/sui_mainnet_bb70bc6a7d6d04694c4c719f0b6f27aa";
    // 请求负载
    const requestData = {
      "jsonrpc": "2.0",
      "id": "24",
      "method": "suix_getOwnedObjects",
      "params": [
        owner,
        {
          "filter": {
            "Package": "0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1",
          },
          "options": {
            "showContent": true,
            "showOwner": true,
          },
        },
        null,
        null,
      ],
    };
    const headers = {
      "Content-Type": "application/json",
    };
    const resp = await this.httpService.post(url, requestData, { headers }).pipe(map(response => response.data)).toPromise();
    // return results;
    return this.mappingNFT(resp["result"]);
  }


  async getSimplePositionById(nftId: string, posId: string, decimalsA: number, decimalsB: number, currentSqrtPrice: string) {
    const pos = await this.getPositionByID(nftId, posId);
    const [lower_tickIndex, lower_sqrtPriceX64, lower_price] = this.bitToAny(pos.tick_lower_index.fields.bits, decimalsA, decimalsB);
    const [upper_tickIndex, upper_sqrtPriceX64, upper_price] = this.bitToAny(pos.tick_upper_index.fields.bits, decimalsA, decimalsB);
    let amountA, amountB;
    let scaledAmountA, scaledAmountB;
    let current_tick_index;
    let current_price;
    if (currentSqrtPrice) {
      const sqrtP = new BN(currentSqrtPrice);
      current_tick_index = this.sdk.math.sqrtPriceX64ToTickIndex(sqrtP);
      current_price = this.sdk.math.sqrtPriceX64ToPrice(sqrtP, decimalsA, decimalsB).toString();
      const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
        currentSqrtPrice: sqrtP,
        liquidity: new BN(pos.liquidity),
        lowerSqrtPrice: lower_sqrtPriceX64,
        upperSqrtPrice: upper_sqrtPriceX64,
      });
      amountA = a.toString();
      amountB = b.toString();
      scaledAmountA = this.sdk.math.scaleDown(amountA, decimalsA);
      scaledAmountB = this.sdk.math.scaleDown(amountB, decimalsB);
    }

    return {
      "nftId": nftId,
      "posId": pos.id.id,
      "liquidity": pos.liquidity,
      "tick_lower_index": lower_tickIndex,
      "tick_upper_index": upper_tickIndex,
      "current_tick_index": current_tick_index,
      "price_lower": lower_price,
      "price_upper": upper_price,
      "current_price": current_price,
      "sqrt_price_lower": lower_sqrtPriceX64.toString(),
      "sqrt_price_upper": upper_sqrtPriceX64.toString(),
      "currentSqrtPrice": currentSqrtPrice,
      "amountA": amountA,
      "amountB": amountB,
      "scaledAmountA": scaledAmountA,
      "scaledAmountB": scaledAmountB,
    };
  }

  // 获取仓位详情
  async getPositionByID(nftId: string, posId: string) {
    if (nftId != null && nftId != "") {
      return await this.sdk.nft.getPositionFields(nftId);
    }
    if (posId != null && posId != "") {
      return await this.sdk.nft.getPositionFieldsByPositionId(posId);
    }
    return null;
  }

  // 计算代币数量by liquidity
  getTokenAmountsFromLiquidity(liquidity: string, tick_lower_index_bits: number, tick_upper_index_bits: number, currentSqrtPrice: string) {

    const tick_lower_index = this.sdk.math.bitsToNumber(tick_lower_index_bits);
    const tick_upper_index = this.sdk.math.bitsToNumber(tick_upper_index_bits);
    const lowerSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(tick_lower_index);
    const upperSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(tick_upper_index);
    const [amountA, amountB] = this.sdk.pool.getTokenAmountsFromLiquidity({
      ceil: true,
      currentSqrtPrice: new BN(currentSqrtPrice),
      liquidity: new BN(liquidity),
      lowerSqrtPrice: lowerSqrtPrice,
      upperSqrtPrice: upperSqrtPrice,
    });
    return [amountA.toString(), amountB.toString(), tick_lower_index, tick_upper_index];
  }


  // 移除流动性
  async removeLiquidity(poolId: string, nftId: string, posId: string, slippage: string) {
    // 获取仓位信息
    const position = await this.sdk.nft.getPositionFieldsByPositionId(posId);


    // 获取未领取的奖励
    const feesAndRewards = await this.sdk.nft.getUnclaimedFeesAndRewards({
      poolId: poolId,
      position: position,
      getPrice: getPriceFunction,
    });
    // 计算手续费收益
    const collectAmountA = feesAndRewards.fields.feeOwedA;
    const collectAmountB = feesAndRewards.fields.feeOwedB;
    // 计算rewards收益
    const rewards = feesAndRewards.fields.collectRewards;
    // 获取池子信息
    const pool = await this.sdk.pool.getPool(poolId);
    // 计算a,b代币数量by 仓位流动性
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      liquidity: new BN(position.liquidity),
      currentSqrtPrice: new BN(pool.sqrt_price),
      lowerSqrtPrice: this.bitToSqrtPriceBN(position.tick_lower_index.fields.bits),
      upperSqrtPrice: this.bitToSqrtPriceBN(position.tick_upper_index.fields.bits),
    });
    const txb = await this.sdk.pool.removeLiquidity({
      address: this.sender,
      amountA: a.toString(),
      amountB: b.toString(),
      collectAmountA: collectAmountA,
      collectAmountB: collectAmountB,
      decreaseLiquidity: position.liquidity,
      nft: nftId,
      pool: poolId,
      rewardAmounts: rewards,
      slippage: slippage,
    });

    const result = await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
    return {
      "input": {
        "address": this.sender,
        "amountA": a.toString(),
        "amountB": b.toString(),
        "poolId": poolId,
        "slippage": slippage,
        "collectAmountA": collectAmountA,
        "collectAmountB": collectAmountB,
        "decreaseLiquidity": position.liquidity,
        "nftId": nftId,
        "rewards": rewards,
      },
      "output": result,
    };
  }

  // 减少流动性
  async decreaseLiquidity(poolId: string, nftId: string, liquidity: string, slippage: string) {
    const position = await this.sdk.nft.getPositionFields(nftId);
    const pool = await this.sdk.pool.getPool(poolId);

    // 计算a,b代币数量by 仓位流动性
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      liquidity: new BN(liquidity),
      currentSqrtPrice: new BN(pool.sqrt_price),
      lowerSqrtPrice: this.bitToSqrtPriceBN(position.tick_lower_index.fields.bits),
      upperSqrtPrice: this.bitToSqrtPriceBN(position.tick_upper_index.fields.bits),
    });


    const txb = await this.sdk.pool.decreaseLiquidity({
      address: this.sender,
      amountA: a.toString(),
      amountB: b.toString(),
      decreaseLiquidity: liquidity,
      nft: nftId,
      pool: poolId,
      slippage: slippage,
    });

    return await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
  }

  // 增加流动性
  async increaseLiquidity(poolId: string, nftId: string, amountA: string, amountB: string, slippage: string) {
    const txb = await this.sdk.pool.increaseLiquidity({
      address: this.sender,
      amountA: amountA,
      amountB: amountB,
      nft: nftId,
      pool: poolId,
      slippage: slippage,
    });

    return await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });

  }


  async getUnclaimedFeesAndRewards(poolId: string, posId: string) {
// 构建options对象
//     const poolId = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
//     const posId = "0x445ec084c88d3fc1be8510856dac89d15d59f879c76009a826be3ccae32aad71";

    const pos = await this.sdk.nft.getPositionFieldsByPositionId(posId);

    const options = {
      poolId: poolId,
      position: pos,
      getPrice: getPriceFunction,
    };

    return await this.sdk.nft.getUnclaimedFeesAndRewards(options);

  }

  estLiquidity(
    lowerTick: number,
    upperTick: number,
    coinAmount: BN,
    iscoinA: boolean,
    roundUp: boolean,
    slippage: number,
    curSqrtPrice: BN,
  ): BN {
    const currentTick = this.sdk.math.sqrtPriceX64ToTickIndex(curSqrtPrice);
    const lowerSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(lowerTick);
    const upperSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(upperTick);
    let liquidity: BN;
    if (currentTick < lowerTick) {
      if (!iscoinA) {
        throw new ClmmpoolsError("lower tick cannot calculate liquidity by coinB", MathErrorCode.NotSupportedThisCoin);
      }
      liquidity = estimateLiquidityForCoinA(lowerSqrtPrice, upperSqrtPrice, coinAmount);
    } else if (currentTick > upperTick) {
      if (iscoinA) {
        throw new ClmmpoolsError("upper tick cannot calculate liquidity by coinA", MathErrorCode.NotSupportedThisCoin);
      }
      liquidity = estimateLiquidityForCoinB(upperSqrtPrice, lowerSqrtPrice, coinAmount);
    } else if (iscoinA) {
      liquidity = estimateLiquidityForCoinA(curSqrtPrice, upperSqrtPrice, coinAmount);
    } else {
      liquidity = estimateLiquidityForCoinB(curSqrtPrice, lowerSqrtPrice, coinAmount);
    }
    return liquidity;
  }

  estTokenAmount(lowerTick: number,
                 upperTick: number,
                 coinAmount: string,
                 iscoinA: boolean,
                 slippage: string,
                 curSqrtPrice: string) {

    const liquidity = this.estLiquidity(lowerTick, upperTick, new BN(coinAmount), iscoinA, true, Number(slippage), new BN(curSqrtPrice));
    const lowerSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(lowerTick);
    const upperSqrtPrice = this.sdk.math.tickIndexToSqrtPriceX64(upperTick);
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      currentSqrtPrice: new BN(curSqrtPrice),
      liquidity: liquidity,
      lowerSqrtPrice: lowerSqrtPrice,
      upperSqrtPrice: upperSqrtPrice,
    });
    return [a.toString(), b.toString()];
  }

  async addLiquidity(poolId: string, amountA: number | string, amountB: number | string, tickLower: number, tickUpper: number, slippage: string) {
    /***
     *
     */
    const txb = await this.sdk.pool.addLiquidity({
      address: this.sender,
      amountA: amountA,
      amountB: amountB,
      pool: poolId,
      slippage: slippage,
      tickLower: tickLower,
      tickUpper: tickUpper,
    });
    const result = await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
    return {
      "input": {
        "address": this.sender,
        "amountA": amountA,
        "amountB": amountB,
        "poolId": poolId,
        "slippage": slippage,
        "tickLower": tickLower,
        "tickUpper": tickUpper,
      },
      "output": result,
    };
  }

  // 流动性开仓2
  async addLiquidity2(poolId: string, tickLower: number, tickUpper: number, slippage: string, coinAmount: string, isCoinA: boolean) {
    const pool = await this.sdk.pool.getPool(poolId);
    const curSqrtPrice = pool.sqrt_price;
    //   计算流动性量
    const [amountA, amountB] = this.estTokenAmount(tickLower, tickUpper, coinAmount, isCoinA, slippage, curSqrtPrice);
    // console.log(`amountA ${amountA}`);
    // console.log(`amountB ${amountB}`);
    const txb = await this.sdk.pool.addLiquidity({
      address: this.sender,
      amountA: amountA,
      amountB: amountB,
      pool: poolId,
      slippage: slippage,
      tickLower: tickLower,
      tickUpper: tickUpper,
    });
    const result = await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
    return {
      "input": {
        "address": this.sender,
        "amountA": amountA,
        "amountB": amountB,
        "poolId": poolId,
        "slippage": slippage,
        "tickLower": tickLower,
        "tickUpper": tickUpper,
        "curSqrtPrice": curSqrtPrice,
      },
      "output": result,
    };
  }

  getTokenAmountByTicks(lowerTick: number,
                        upperTick: number,
                        coinAmount: string,
                        iscoinA: boolean,
                        slippage: string,
                        curSqrtPrice: string,
                        decimalsA: number,
                        decimalsB: number,
  ) {
    const [a, b] = this.estTokenAmount(lowerTick, upperTick, coinAmount, iscoinA, slippage, curSqrtPrice);
    const scaleA = this.sdk.math.scaleDown(a, decimalsA);
    const scaleB = this.sdk.math.scaleDown(b, decimalsB);
    return {
      "amountA": a.toString(),
      "amountB": b.toString(),
      "scaleAmountA": scaleA,
      "scaleAmountB": scaleB,
    };
  }
}

