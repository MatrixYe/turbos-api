import { Injectable } from "@nestjs/common";
import { getNodeUrl } from "../config";
import { SuiClient } from "@mysten/sui.js/client";

// noinspection TypeScriptValidateJSTypes
@Injectable()
export class SuiService {
  client = new SuiClient({ url: getNodeUrl() });

  async allBalances(addr: string) {
    return this.client.getAllBalances({ owner: addr });
  }

  async totalSupply(coinType: string) {
    return await this.client.getTotalSupply({ coinType: coinType });
  }

  async coinMeta(coinType: string) {
    return await this.client.getCoinMetadata({ coinType });
  }


}
