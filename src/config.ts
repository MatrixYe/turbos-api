///
///
///
///
// #程序名称
// APP_NAME="Cetus App"
// #兼容IPV6,请使用localhost
// APP_HOST="localhost"
// # 服务端口，如果不填，默认5010
// APP_PORT=5011
//
// #---------------------接口加密相关----------------------#
// # 是否打开接口加密，生产环境下必须为true
// SERVER_VERIFY=false
// # api key
// SERVER_API_KEY="kpCecz5E6A4fHh2mU3oGesaRGYhHGQhd"
// # 密钥
// SERVER_SECRET_KEY="5X3qszFzQASoP9ApKVMQpOJCCMzu06QFkfs17wMfHw3z9soalVl0yoMVrwhg4whB"
// SERVER_TIMESTAMP_LIMIT=10
//
//
// #---------------------区块网络相关----------------------#
// #目标sui网络，mainnet:主网，devnet:测试网
// NETWORK="mainnet"
//
// # 钱包地址
// WALLET_ADDRESS=""
//
// # 钱包私钥，切勿泄漏
// WALLET_PRIVATE_KEY=""
import { ConfigService } from "@nestjs/config";

const conf = new ConfigService();

export function getAppPort(default_port: number) {
  return conf.get<number>("APP_PORT") || default_port;
}

export function getAppName(): string {
  return conf.get<string>("APP_NAME");
}

export function getServerVerify(): boolean {
  return conf.get<string>("SERVER_VERIFY") == "true";
}

export function getServerSecretKey(): string {
  return conf.get<string>("SERVER_SECRET_KEY");
}

export function getServerTimestampLimit(): number {
  return conf.get<number>("SERVER_TIMESTAMP_LIMIT");
}

export function getWalletPrivateKey(): string {
  return conf.get<string>("WALLET_PRIVATE_KEY");
}

export function getWalletAddress(): string {
  return conf.get<string>("WALLET_ADDRESS");
}

export function getNodeUrl(): string {
  return conf.get<string>("NODE_URL");
}
