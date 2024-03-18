// signature.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import * as crypto from "crypto";
import { getServerSecretKey, getServerTimestampLimit, getServerVerify } from "./config";

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor() {
  }

  private serverVerify: boolean = getServerVerify();
  private secretKey = getServerSecretKey();
  private apiTimestampLimit = getServerTimestampLimit();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const timestamp = request.headers["x-timestamp"];
    const signature = request.headers["x-signature"];
    const apikey = request.headers["x-apikey"];
    // 签名允许
    if (!this.serverVerify) {
      // console.log(`SERVER_VERIFY ${this.serverVerify}---> pass`);
      return true;
    }
    // 确保时间戳和签名都在请求头中
    if (!apikey || !timestamp || !signature) {
      throw new UnauthorizedException("ApiKey、Timestamp or signature missing");
    }
    // 时间戳判断
    const currentTimestampSeconds: number = Math.floor(new Date().getTime() / 1000);
    if (currentTimestampSeconds - timestamp > this.apiTimestampLimit) {
      throw new UnauthorizedException(`The timestamp exceeds the limit(${this.apiTimestampLimit})`);
    }

    // 服务端生成签名
    const expectedSignature = this.genSignature(apikey, timestamp);
    // 验证签名
    if (!(expectedSignature == signature)) {
      throw new UnauthorizedException("Invalid signature");
    }
    return true;
  }

  private genSignature(apiKey: string, timestamp: string): string {
    const message = `${apiKey} ${timestamp}`;
    const hmac = crypto.createHmac("sha256", this.secretKey);
    hmac.update(message);
    return hmac.digest("hex");
  }
}
