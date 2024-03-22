import { Injectable } from "@nestjs/common";
import { getNodeUrl, getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";
import { BN, Network, TurbosSdk } from "turbos-clmm-sdk";
import { SuiClient } from "@mysten/sui.js/client";

@Injectable()
export class ToolsService {
  suiClient = new SuiClient({ url: getNodeUrl() });
  sdk = new TurbosSdk(Network.mainnet, this.suiClient);
  sender = getWalletAddress();
  privateKey = getWalletPrivateKey();
  keypair = genKeypair(this.privateKey);

  verifyAddress(): (any | string | boolean)[] {
    let privateKey = getWalletPrivateKey();
    const walletAddress = getWalletAddress();
    let keypair = genKeypair(privateKey);
    let address = keypair.toSuiAddress();
    return [address, walletAddress, address == walletAddress];
  }

  sqrtPriceX64ToPrice(sp: string, decimalsA: number, decimalsB: number) {
    const sqrtPriceX64 = new BN(sp);
    return this.sdk.math.sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA, decimalsB);
  }

  priceToSqrtPriceX64(price: string, decimalsA: number, decimalsB: number) {
    const result = this.sdk.math.priceToSqrtPriceX64(price, decimalsA, decimalsB);
    return result.toString();
  }

  priceToTickIndex(price: string, decimalsA: number, decimalsB: number) {
    return this.sdk.math.priceToTickIndex(price, decimalsA, decimalsB);
  }

  sqrtPriceX64ToTickIndex(sp: string) {
    const sqrtPriceX64 = new BN(sp);
    return this.sdk.math.sqrtPriceX64ToTickIndex(sqrtPriceX64);
  }

  bitsToNumber(bits: number | string) {
    return this.sdk.math.bitsToNumber(bits);
  }

  tickIndexToPrice(tickIndex: number, decimalsA: number, decimalsB: number) {
    const price = this.sdk.math.tickIndexToPrice(tickIndex, decimalsA, decimalsB);
    return price.toString();
  }

  tickIndexToSqrtPriceX64(tickIndex: number) {
    const sqrtPriceX64 = this.sdk.math.tickIndexToSqrtPriceX64(tickIndex);
    return sqrtPriceX64.toString();
  }


}
