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

  async computeSwapV2(poolId: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number) {

    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      pools: [{
        pool: poolId,
        a2b: a2b,
        amountSpecified: amount,
      }],
    });
    return swapResults[0];

  }

  async toSwap(poolId: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number, slippage: string) {

    const swapResults = await this.sdk.trade.computeSwapResultV2({
      address: this.sender,
      amountSpecifiedIsInput: amountSpecifiedIsInput,
      pools: [{
        pool: poolId,
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
        pool: poolId,
        a2b: a2b,
        nextTickIndex: nextTickIndex,
      }],
      slippage: slippage,//滑点，百分比形式
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
