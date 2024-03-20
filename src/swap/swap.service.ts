import { Injectable } from "@nestjs/common";
import { Network, TurbosSdk } from "turbos-clmm-sdk";
import { getNodeUrl, getWalletPrivateKey } from "../config";
import { SuiClient } from "@mysten/sui.js/client";
import { genKeypair } from "../wallet";

@Injectable()
export class SwapService {
  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);
  keypair = genKeypair(getWalletPrivateKey());

  async swap() {
    const swapResult = await this.sdk.trade.computeSwapResultV2({
      address: "",
      amountSpecifiedIsInput: false,
      pools: []
    });
    const nextTickIndex = this.sdk.math.bitsToNumber(swapResult[0].tick_current_index.bits)

    const txb = await this.sdk.trade.swap({
      address: "",
      amountA: undefined,
      amountB: undefined,
      amountSpecifiedIsInput: false,
      coinTypeA: "",
      coinTypeB: "",
      routes: [],
      slippage: "",
    });

    this.sdk.provider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: this.keypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
    // this.sdk.provider.signAndExecuteTransactionBlock()

  }

  async test() {
    let privateKey = getWalletPrivateKey();
    console.log(`private key: ${privateKey}`);
    let keypair = genKeypair(privateKey);
    let publicKey = keypair.getPublicKey();
    let secretKey = keypair.getSecretKey();
    let address = keypair.toSuiAddress();
    return [publicKey, secretKey, address];
  }

}
