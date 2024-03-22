import { Injectable } from "@nestjs/common";
import { getNodeUrl } from "../config";
import { SuiClient } from "@mysten/sui.js/client";
import { Network, TurbosSdk } from "turbos-clmm-sdk";

@Injectable()
export class PoolService {

  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);


  async getPool(poolId: string) {
    return await this.sdk.pool.getPool(poolId);
  }


}
