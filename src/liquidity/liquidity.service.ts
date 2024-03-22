import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";

@Injectable()
export class LiquidityService {
  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);

  sender = getWalletAddress();
  privateKey = getWalletPrivateKey();
  keypair = genKeypair(this.privateKey);

  async addLiquidity() {
    const poolId = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
    const slippage = "5";

    const lq = await this.sdk.pool.getFixedLiquidity({
      amountA: undefined,
      amountB: undefined,
      coinTypeA: "",
      coinTypeB: "",
      priceA: undefined,
      priceB: undefined,
    });
    const liquidity = lq.liquidity;


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


  getTokenAmountsFromLiquidity() {
    const [a, b] = this.sdk.pool.getTokenAmountsFromLiquidity({
      currentSqrtPrice: undefined,
      liquidity: undefined,
      lowerSqrtPrice: undefined,
      upperSqrtPrice: undefined,
    });

  }


}
