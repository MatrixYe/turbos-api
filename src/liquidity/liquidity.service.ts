// noinspection SpellCheckingInspection

import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs/operators";

@Injectable()
export class LiquidityService {
  constructor(private httpService: HttpService) {
  }

  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);

  sender = getWalletAddress();
  privateKey = getWalletPrivateKey();
  keypair = genKeypair(this.privateKey);

  async addLiquidity() {
    const poolId = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
    const slippage = "5";
    this.sdk;
    // 添加流动性
    this.sdk.pool.getFixedLiquidity({
      amountA: undefined,
      amountB: undefined,
      coinTypeA: "",
      coinTypeB: "",
      priceA: undefined,
      priceB: undefined,
    });
    await this.sdk.pool.addLiquidity({
      address: this.sender,
      amountA: undefined,
      amountB: undefined,
      pool: poolId,
      slippage: slippage,
      tickLower: 0,
      tickUpper: 0,
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


  getTokenAmountsFromLiquidity() {
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      currentSqrtPrice: undefined,
      liquidity: undefined,
      lowerSqrtPrice: undefined,
      upperSqrtPrice: undefined,
    });
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

  async getPositionByID(nftID: string, posID: string) {
    if (nftID != null && nftID != "") {
      return await this.sdk.nft.getPositionFields(nftID);
    }
    if (posID != null && posID != "") {
      return await this.sdk.nft.getPositionFieldsByPositionId(posID);
    }
    return null;
  }
}

