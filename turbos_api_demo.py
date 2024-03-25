# -*- coding: utf-8 -*-#
# -------------------------------------------------------------------------------
# Name:         a 
# Author:       yepeng
# Date:         2021/10/22 2:44 下午
# Description: 本示例用于演示D-Quant 系统：turbos-api的客户端
# -------------------------------------------------------------------------------
import hashlib
import hmac
import json
import time
from functools import wraps

import requests as r
from requests import Response

"""
客户端基本配置
BASE_URL:服务端URL
SERVER_API_KEY：标识APIKEY
SERVER_SECRET_KEY：签名私钥，必须与服务端同一，否则无法通过接口验证
"""
BASE_URL = "http://127.0.0.1:5010"
SERVER_API_KEY = "server_api_key"
SERVER_SECRET_KEY = "server_secret_key"


# 装饰器:签名并填装至header
def add_custom_header(ak, sk):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            ts = str(int(time.time()))
            message = f'{ak} {ts}'
            sig = hmac.new(sk.encode(), message.encode(), hashlib.sha256).digest()
            signature_hex = sig.hex()
            custom_header = {
                'X-ApiKey': SERVER_API_KEY,
                'X-Timestamp': ts,
                'X-Signature': signature_hex,
            }
            if 'headers' in kwargs:
                kwargs['headers'].update(custom_header)
            else:
                kwargs['headers'] = custom_header
            return func(*args, **kwargs)

        return wrapper

    return decorator


@add_custom_header(SERVER_API_KEY, SERVER_SECRET_KEY)
def make_request(method: str, url: str, *args, **kwargs) -> Response:
    return r.request(method=method, url=url, *args, **kwargs)


## ****************************************demo:地址验证********************************************##
def verify_address():
    url = f"{BASE_URL}/tools/verifyAddress"
    resp = make_request('get', url)
    print(f"{resp.status_code = }")
    print(json.dumps(resp.json(), indent=4))


## ****************************************demo:核心swap********************************************##
def to_swap():
    """
    示例:使用1 sui 换取对应的usdc，注意代币精度
    usdc精度为6 sui精度为9
    :return:
    """
    url = f"{BASE_URL}/swap/to"
    data = {
        "poolID": "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78",
        "coinTypeA": "0x2::sui::SUI",
        "coinTypeB": "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
        "a2b": True,
        "amountSpecifiedIsInput": True,
        "amount": 1000000000,
        "slippage": "5",
    }
    resp: Response = make_request("post", url=url, json=data)
    print(resp.status_code)
    print(resp.json())


def computeSwapV2():
    """
    示例:估算交易的结果，但不发起交易
    :return:
    """
    url = f"{BASE_URL}/swap/computeSwapV2"
    data = {
        "poolID": "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78",
        "coinTypeA": "0x2::sui::SUI",
        "coinTypeB": "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
        "a2b": True,
        "amountSpecifiedIsInput": True,
        "amount": 1000000000,
    }
    resp: Response = make_request("post", url=url, json=data)
    print(resp.status_code)
    print(resp.json())


if __name__ == '__main__':
    verify_address()
    # computeSwapV2()
    # to_swap()
