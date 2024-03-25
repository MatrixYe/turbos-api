import { Injectable } from "@nestjs/common";
import { getNodeUrl } from "../config";
import { SuiClient } from "@mysten/sui.js/client";
import { BN, Network, TurbosSdk } from "turbos-clmm-sdk";

@Injectable()
export class PoolService {

  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);


  async getPool(poolId: string) {
    return await this.sdk.pool.getPool(poolId);
  }

  async getSimplePool(poolId: string, decimalsA: number, decimalsB: number) {
    const pool = await this.sdk.pool.getPool(poolId);
    return {
      "poolId": pool.id.id,
      "coin_a": pool.coin_a,
      "coin_b": pool.coin_b,
      "fee": pool.fee,
      "liquidity": pool.liquidity,
      "current_sqrt_price": pool.sqrt_price,
      "current_price": this.sdk.math.sqrtPriceX64ToPrice(new BN(pool.sqrt_price), decimalsA, decimalsB),
      "current_tick_index": this.sdk.math.bitsToNumber(pool.tick_current_index.fields.bits),
      "coinTypeA": pool.types[0],
      "coinTypeB": pool.types[1],
      "tick_spacing": pool.tick_spacing,
      "unlocked": pool.unlocked,
    };
  }
}
