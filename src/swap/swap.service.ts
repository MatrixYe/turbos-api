import { Injectable } from "@nestjs/common";
import { Network, TurbosSdk } from "turbos-clmm-sdk";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { SuiClient } from "@mysten/sui.js/client";
import { genKeypair } from "../wallet";

@Injectable()
export class SwapService {
  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);
  sender = getWalletAddress();
  privateKey = getWalletPrivateKey();
  keypair = genKeypair(this.privateKey);

  async computeSwapV2() {
    const poolID: string = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
    const coinTypeA: string = "0x2::sui::SUI";
    const coinTypeB: string = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";
    const a2b: boolean = true;
    const amountSpecifiedIsInput: boolean = true;
    const amount: string | number = 1000000000;
    const slippage: string = "5";

    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,//这个地址确认了，就是发送者的钱包地址，干你老母啊！
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      pools: [{
        pool: poolID,
        a2b: a2b,
        amountSpecified: amount,
      }],
    });
    //todo 这里需要批量转化为路径信息
    return swapResults[0];

  }

  async toSwap(poolID: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number, slippage: string) {

    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,//这个地址确认了，就是发送者的钱包地址，干你老母啊！
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      pools: [{
        pool: poolID,
        a2b: a2b,
        amountSpecified: amount,
      }],
    });
    const sr = swapResults[0];

    const nextTickIndex = this.sdk.math.bitsToNumber(sr.tick_current_index.bits);
    const amountA = sr.amount_a;
    const amountB = sr.amount_b;


    const txb = await this.sdk.trade.swap({
      address: this.sender,
      amountA: amountA,
      amountB: amountB,
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      coinTypeA: coinTypeA,
      coinTypeB: coinTypeB,
      routes: [{
        pool: poolID,
        a2b: a2b,
        nextTickIndex: nextTickIndex,
      }],
      slippage: slippage,//滑点，确认了，是百分比形式
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


}
