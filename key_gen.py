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
