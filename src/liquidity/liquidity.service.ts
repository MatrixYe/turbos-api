// noinspection SpellCheckingInspection

import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { BN, Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs/operators";

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

  // 获取仓位详情
  async getPositionByID(nftID: string, posID: string) {
    if (nftID != null && nftID != "") {
      return await this.sdk.nft.getPositionFields(nftID);
    }
    if (posID != null && posID != "") {
      return await this.sdk.nft.getPositionFieldsByPositionId(posID);
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


  async addLiquidity() {
    const poolId = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
    const coinTypeA = "0x2::sui::SUI";
    const coinTypeB = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";
    const slippage = "2";
    // 添加流动性
    const calLiquidity = await this.sdk.pool.getFixedLiquidity({
      amountA: 10000000000,
      amountB: 10000000,
      coinTypeA: coinTypeA,
      coinTypeB: coinTypeB,
      priceA: undefined,
      priceB: undefined,
    });

    await this.sdk.pool.addLiquidity({
      address: "",
      amountA: undefined,
      amountB: undefined,
      pool: "",
      slippage: undefined,
      tickLower: 0,
      tickUpper: 0,
    });

    this.sdk.pool.getTokenAmountsFromLiquidity({
      currentSqrtPrice: undefined,
      lowerSqrtPrice: undefined,
      upperSqrtPrice: undefined,
      liquidity: undefined,
    });


  }

  // 移除流动性
  async removeLiquidity() {
    await this.sdk.pool.removeLiquidity({
      address: "",
      amountA: undefined,
      amountB: undefined,
      collectAmountA: undefined,
      collectAmountB: undefined,
      decreaseLiquidity: undefined,
      nft: "",
      pool: "",
      rewardAmounts: [],
      slippage: undefined,
    });
  }

  // 增加流动性
  async increaseLiquidity() {
    await this.sdk.pool.increaseLiquidity({
      address: "",
      amountA: undefined,
      amountB: undefined,
      nft: "",
      pool: "",
      slippage: undefined,
    });
  }

  // 减少流动性
  async decreaseLiquidity() {
    await this.sdk.pool.decreaseLiquidity({
      address: "",
      amountA: undefined,
      amountB: undefined,
      decreaseLiquidity: undefined,
      nft: "",
      pool: "",
      slippage: undefined,
    });
  }


  async getUnclaimedFeesAndRewards(poolID: string, posID: string) {
// 构建options对象
//     const poolID = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
//     const posID = "0x445ec084c88d3fc1be8510856dac89d15d59f879c76009a826be3ccae32aad71";

    const pos = await this.sdk.nft.getPositionFieldsByPositionId(posID);

    const options = {
      poolId: poolID,
      position: pos,
      getPrice: getPriceFunction,
    };

    return await this.sdk.nft.getUnclaimedFeesAndRewards(options);

  }
}

