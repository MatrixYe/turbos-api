import { Injectable } from "@nestjs/common";
import { getNodeUrl } from "../config";
import { SuiClient } from "@mysten/sui.js/client";
import { Network, TurbosSdk } from "turbos-clmm-sdk";

@Injectable()
export class PoolService {

  rpcUrl = getNodeUrl();
  suiClient = new SuiClient({ url: this.rpcUrl });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);

  async getPool(poolId: string) {
    // console.log(`pool: ${pool}`);
    return await this.sdk.pool.getPool(poolId);

  }

}
