
# 配置文件示例
- 文件名: `.env`
- 路径:项目根目录
```dotenv
#---------------------服务相关----------------------#
#程序名称
APP_NAME="Turbos API"
#兼容IPV6,请使用localhost
APP_HOST="localhost"
# 服务端口，如果不填，默认5010
APP_PORT=5010

#---------------------接口加密相关----------------------#
# 是否打开接口加密，生产环境下必须为true
SERVER_VERIFY=true
# api key
SERVER_API_KEY="your api key"
# 密钥
SERVER_SECRET_KEY="your sercert key"
# 签名有效时间，单位s,默认10秒内有效
SERVER_TIMESTAMP_LIMIT=10


#---------------------区块网络相关----------------------#
#目标sui网络，mainnet:主网，devnet:测试网
NETWORK="mainnet"

# 钱包地址
WALLET_ADDRESS="0xabcd...abcd"

# 钱包私钥，切勿泄漏
WALLET_PRIVATE_KEY="this is your wallet private key"


```