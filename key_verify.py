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
