import { Injectable } from "@nestjs/common";
import { getWalletAddress, getWalletPrivateKey } from "../config";
import { genKeypair } from "../wallet";

@Injectable()
export class ToolsService {


  verifyAddress(): (any | string | boolean)[] {
    let privateKey = getWalletPrivateKey();
    const walletAddress = getWalletAddress();

    let keypair = genKeypair(privateKey);
    let address = keypair.toSuiAddress();
    // let secretKey = keypair.getSecretKey();
    return [address, walletAddress, address == walletAddress];
  }
}
