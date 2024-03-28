// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols

import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { BN, Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs/operators";

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
    return await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
  }

  protected bitToSqrt(num: number) {
    const tickindex = this.sdk.math.bitsToNumber(num);
    return this.sdk.math.tickIndexToSqrtPriceX64(tickindex);
  }

  // 移除流动性
  async removeLiquidity(poolId: string, nftId: string, posId: string, slippage: string) {
    // 获取仓位信息
    const position = await this.sdk.nft.getPositionFieldsByPositionId(posId);
    // 获取池子信息
    const pool = await this.sdk.pool.getPool(poolId);
    // 计算a,b代币数量by 仓位流动性
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      liquidity: new BN(position.liquidity),
      currentSqrtPrice: new BN(pool.sqrt_price),
      lowerSqrtPrice: this.bitToSqrt(position.tick_lower_index.fields.bits),
      upperSqrtPrice: this.bitToSqrt(position.tick_upper_index.fields.bits),
    });

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

    return await this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
  }

  // 减少流动性
  async decreaseLiquidity(poolId: string, nftId: string, liquidity: string, slippage: string) {
    const position = await this.sdk.nft.getPositionFields(nftId);
    const pool = await this.sdk.pool.getPool(poolId);

    // 计算a,b代币数量by 仓位流动性
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      liquidity: new BN(liquidity),
      currentSqrtPrice: new BN(pool.sqrt_price),
      lowerSqrtPrice: this.bitToSqrt(position.tick_lower_index.fields.bits),
      upperSqrtPrice: this.bitToSqrt(position.tick_upper_index.fields.bits),
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

  private calLpTokenAmount(tick_current_index: number, tick_lower_index: number, tick_upper_index: number, decimalsA: number, decimalsB: number): CalLpTokenAmountBase {
    if ((tick_current_index - tick_lower_index) <= 0) {
      //当前价不在区间，区间位于右，币种A
      return {
        amountA: 1,
        amountB: 0,
        compositionA: 1,
        compositionB: 0,
        place: 1,
      };
    }
    if ((tick_current_index - tick_upper_index) > 0) {
      //当前价不在区间，区间位于左侧，币种B
      return {
        amountA: 0,
        amountB: 1,
        compositionA: 0,
        compositionB: 1,
        place: -1,

      };
    }
    const span = tick_upper_index - tick_lower_index;
    const b = (tick_current_index - tick_lower_index) / span;
    const a = (tick_upper_index - tick_current_index) / span;
    const price_current = this.sdk.math.tickIndexToPrice(tick_current_index, decimalsA, decimalsB).toNumber();
    const amountA = 1;
    const amountB = amountA * price_current / (a / b);
    return {
      amountA: amountA,
      amountB: amountB,
      compositionA: a,
      compositionB: b,
      place: 0,
    };
  }

  //预估流动性添加代币数量
  calLpTokenAmountByPrice(price_current: string, price_lower: string, price_upper: string, decimalsA: number, decimalsB: number): CalLpTokenAmountResult {
    const tick_current_index = this.sdk.math.priceToTickIndex(price_current, decimalsA, decimalsB);
    const tick_lower_index = this.sdk.math.priceToTickIndex(price_lower, decimalsA, decimalsB);
    const tick_upper_index = this.sdk.math.priceToTickIndex(price_upper, decimalsA, decimalsB);
    const amountBase = this.calLpTokenAmount(tick_current_index, tick_lower_index, tick_upper_index, decimalsA, decimalsB);
    return {
      amountA: amountBase.amountA,
      amountB: amountBase.amountB,
      compositionA: amountBase.compositionA,
      compositionB: amountBase.compositionB,
      place: amountBase.place,
      price_current: price_current,
      price_lower: price_lower,
      price_upper: price_upper,
      tick_current_index: tick_current_index,
      tick_lower_index: tick_lower_index,
      tick_upper_index: tick_upper_index,
    };

  }

  calLpTokenAmountByTicks(tick_current_index: number, tick_lower_index: number, tick_upper_index: number, decimalsA: number, decimalsB: number): CalLpTokenAmountResult {
    const amountBase = this.calLpTokenAmount(tick_current_index, tick_lower_index, tick_upper_index, decimalsA, decimalsB);
    return {
      amountA: amountBase.amountA,
      amountB: amountBase.amountB,
      compositionA: amountBase.compositionA,
      compositionB: amountBase.compositionB,
      place: amountBase.place,
      price_current: this.sdk.math.tickIndexToPrice(tick_current_index, decimalsA, decimalsB).toString(),
      price_lower: this.sdk.math.tickIndexToPrice(tick_lower_index, decimalsA, decimalsB).toString(),
      price_upper: this.sdk.math.tickIndexToPrice(tick_upper_index, decimalsA, decimalsB).toString(),
      tick_current_index: tick_current_index,
      tick_lower_index: tick_lower_index,
      tick_upper_index: tick_upper_index,
    };
  }

}

