# 接口加密

> 为保障接口访问安全，所有接口的请求头中必须携带签名，签名由服务端生成，客户端需要在本地签名。无效的签名或者签名过期将被服务器拒绝。

## 1. 生成签名
运行脚本 `python key_gen.py`生成私钥，私钥保存在服务端.env文件中，客户端每次请求都需要使用私钥对时间戳进行签名后才能获取接口访问权限
```python
# -*- coding: utf-8 -*-#
# -------------------------------------------------------------------------------
# Name:         a 
# Author:       yepeng
# Date:         2021/10/22 2:44 下午
# Description: 本示例用于快速生成api key 和api secret key
# -------------------------------------------------------------------------------
import random
import string


def generate_random_string(length):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))


api_key = generate_random_string(32)
secret_key = generate_random_string(64)

print("API Key:", api_key)
print("API Secret Key:", secret_key)

```


## 2. 客户端签名
```python
"""
演示 客户端签名操作
"""

import hashlib
import hmac
import time

import requests

# 1、设置API密钥和密钥
# api key
SERVER_API_KEY = "your-api-key"
# 密钥
SERVER_SECRET_KEY = "your-secret-key"

# 2、设置当前时间戳
timestamp = str(int(time.time()))


# 客户端生成签名函数
def generate_signature(ak: str, sk: str, ts: str):
    """

    :param ak: api key
    :param sk: api secret key
    :param ts: timestamp
    :return: signature_hex
    """
    message = f'{ak} {ts}'
    sig = hmac.new(sk.encode(), message.encode(), hashlib.sha256).digest()
    signature_hex = sig.hex()

    print(f"api_key:{SERVER_API_KEY}")
    print(f"api_secret_key:{SERVER_SECRET_KEY}")
    print(f"timestamp:{timestamp}")
    print(f"signature_base64:{signature_hex}")

    return signature_hex


# 3、生成签名
signature = generate_signature(SERVER_API_KEY, SERVER_SECRET_KEY, timestamp)

# 4、发起请求，签名信息放在请求头中
url = 'http://127.0.0.1:5010/'
headers = {
    'X-ApiKey': SERVER_API_KEY,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
}
response = requests.get(url, headers=headers)

# 打印结果
print(response.text)

```