<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

turbos 接口服务

## 安装

```bash
$ npm install
```

## 签名私钥生成器

请使用[key_gen](./key_gen.py)生成apikey 和secret key,并使用[key_verify](./key_verify.py)验证签名是否正确

## 配置文件示例

请在项目根路径下创建一个.env文件，文件模版如下:

```.dotenv
#---------------------服务相关----------------------#
#程序名称
APP_NAME="Turbos API"
#兼容IPV6,请使用localhost
APP_HOST="localhost"
# 服务端口，如果不填，默认5010
APP_PORT=5010

#---------------------接口加密相关----------------------#
# 是否打开接口加密，生产环境下必须为true
SERVER_VERIFY=false
# api key,(替换)
SERVER_API_KEY="server_api_key"
# 密钥，(替换)
SERVER_SECRET_KEY="server_secret_key"
SERVER_TIMESTAMP_LIMIT=10


#---------------------区块网络相关----------------------#
#目标sui网络，mainnet:主网，devnet:测试网
NETWORK="mainnet"

# 网络节点(替换)
NODE_URL="https://example.nodeurl.com"

# 钱包地址(替换)
WALLET_ADDRESS="0x........."

# 钱包私钥，切勿泄漏（替换）
WALLET_PRIVATE_KEY="your-key........."


```

## 编译&运行

```bash
# build
$ npm run build
# production mode
$ npm run start:prod
```

## 示例代码

[客户端请求示例python版本](..%2F..%2FPython%2Fdquant-client-demo%2Fturbos_api_demo.py)


