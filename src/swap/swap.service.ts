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

  async computeSwap() {
    const swapResult = await this.sdk.trade.computeSwapResultV2({
      address: "",//这个地址确认了，是发送者的钱包地址
      amountSpecifiedIsInput: false,
      pools: [],
    });
  }

  async swap() {
    //todo 这里返回的是一个数组，里面的元素可能为路径，代币转移的路径
    const swapResult = await this.sdk.trade.computeSwapResultV2({
      address: "",//这个地址确认了，是发送者的钱包地址
      amountSpecifiedIsInput: false,
      pools: [],
    });
    //todo 这里需要批量转化为路径信息
    const nextTickIndex = this.sdk.math.bitsToNumber(swapResult[0].tick_current_index.bits);

    const txb = await this.sdk.trade.swap({
      address: "",
      amountA: undefined,
      amountB: undefined,
      amountSpecifiedIsInput: false,
      coinTypeA: "",
      coinTypeB: "",
      routes: [],//路由信息，从上面的results中转化而来
      slippage: "",//滑点，确认了，是百分比形式
    });

    return await this.sdk.provider.signAndExecuteTransactionBlock({
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
