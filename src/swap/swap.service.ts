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

  async computeSwapV2(poolID: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number) {

    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      pools: [{
        pool: poolID,
        a2b: a2b,
        amountSpecified: amount,
      }],
    });
    return swapResults[0];

  }

  async toSwap(poolID: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number, slippage: string) {
    //     const poolID: string = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
    //     const coinTypeA: string = "0x2::sui::SUI";
    //     const coinTypeB: string = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";
    //     const a2b: boolean = true;
    //     const amountSpecifiedIsInput: boolean = true;
    //     const amount: string | number = 100000000;
    //     const slippage: string = "5";
    console.log(`poolID ${poolID}`);
    console.log(`coinTypeA ${coinTypeA}`);
    console.log(`coinTypeB ${coinTypeB}`);
    console.log(`a2b ${a2b}`);
    console.log(`amountSpecifiedIsInput ${amountSpecifiedIsInput}`);
    console.log(`amount ${amount}`);
    console.log(`slippage ${slippage}`);
    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,
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
