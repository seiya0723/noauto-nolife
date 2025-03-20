---
title: "DjangoのセッションをRedisで管理する"
date: 2025-03-16T21:15:46+09:00
lastmod: 2025-03-16T21:15:46+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","redis","tips" ]
---


## DjangoのセッションをRedisで管理するメリット

- DB(ディスク)ではなくRedis(RAM)になるので、セッション管理が高速化される
- 複数のアプリでセッション情報を共有できる
- マルチノード構成を使って、負荷分散・可用性を高めることができる
- TTLでセッションの削除を自動化できる。(DBの場合、能動的に削除しない限りセッション情報がそのまま残る)
- Django-Channelsなどの非同期セッションと相性が良い(DBの場合、同期的なORMしかできないためボトルネックが生まれる)


## django-redis のインストール

```
pip install django-redis 
```

## settings.py の設定

```
# Redisをセッションエンジンとして設定
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Redisのキャッシュ設定
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",  # RedisのURL（適宜変更）
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_TIMEOUT": 5,  # 接続タイムアウト（秒）
        }
    }
}

# セッションの有効期限設定
SESSION_COOKIE_AGE = 86400  # 1日（秒）
SESSION_SAVE_EVERY_REQUEST = False  # セッションを毎回保存しない
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # ブラウザを閉じてもセッションを維持
```


まず、
```
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
```
とすることで、djangoのセッション管理をキャッシュで行うようにすることができる。


キャッシュの設定。django内にあるデフォルトのRedisバックエンドではなく、先程インストールしたdjango_redisを使う。

```
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",  # RedisのURL（適宜変更）
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_TIMEOUT": 5,  # 接続タイムアウト（秒）
        }
    }
}
```

Redisが何らかの影響で応答不能になった場合、5秒でタイムアウトする。

この設定をするだけで、セッション情報はすべてRedisで管理されるようになる。

これで高速な認証が実現され、WebSocketの連携時にもボトルネックが発生しない。

## 管理サイトにログインをした後、Redis内に保存されているセッションを取り出すには？

```
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> KEYS *
1) ":1:django.contrib.sessions.cachemmoh6r4amm0gm7fn3l3sovyh48f8o9t8"
127.0.0.1:6379[1]> TYPE ":1:django.contrib.sessions.cachemmoh6r4amm0gm7fn3l3sovyh48f8o9t8"
string
127.0.0.1:6379[1]> GET ":1:django.contrib.sessions.cachemmoh6r4amm0gm7fn3l3sovyh48f8o9t8"
"\x80\x04\x95\xaf\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\r_auth_user_id\x94\x8c\x011\x94\x8c\x12_auth_user_backend\x94\x8c)django.contrib.auth.backends.ModelBackend\x94\x8c\x0f_auth_user_hash\x94\x8c@3b52c847036e247aec08277f3c96801f08729b54fa138dfeaa22c9b99d8e0053\x94u."
```

まず、`SELECT 1`コマンドでRedis DBを指定する。

続いて、`KEYS *`で保存されているすべてのKeyを取り出す。(※本番環境では大量のキーが保存されているため、`KEYS *` では負荷がかかる。`SCAN 0 MATCH * COUNT 100`などのSCANコマンドを使う。)

表示されるキーのデータ型を確認する。

```
TYPE ":1:django.contrib.sessions.cachemmoh6r4amm0gm7fn3l3sovyh48f8o9t8"
```

string型なので、ここは普通にGETコマンドでキーを指定して取得できる。

```
GET ":1:django.contrib.sessions.cachemmoh6r4amm0gm7fn3l3sovyh48f8o9t8"
```

なお、ここで表示されるセッションはBase64でエンコードされている、デコード用のコードは以下。

```
import base64
import pickle

# Redisから取得したデータ（バイナリ）
data = b"\x80\x04\x95\xaf\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\r_auth_user_id\x94\x8c\x011\x94\x8c\x12_auth_user_backend\x94\x8c)django.contrib.auth.backends.ModelBackend\x94\x8c\x0f_auth_user_hash\x94\x8c@3b52c847036e247aec08277f3c96801f08729b54fa138dfeaa22c9b99d8e0053\x94u."

# pickleでデコード
session_data = pickle.loads(data)

# デコードされたセッションデータを表示
print(session_data)
```

インタラクティブシェルで実行するとこうなる。

```
>>> import base64
>>> import pickle
>>> 
>>> # Redisから取得したデータ（バイナリ）
>>> data = b"\x80\x04\x95\xaf\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\r_auth_user_id\x94\x8c\x011\x94\x8c\x12_auth_user_backend\x94\x8c)django.contrib.auth.backends.ModelBackend\x94\x8c\x0f_auth_user_hash\x94\x8c@3b52c847036e247aec08277f3c96801f08729b54fa138dfeaa22c9b99d8e0053\x94u."
>>> 
>>> # pickleでデコード
>>> session_data = pickle.loads(data)
>>> 
>>> # デコードされたセッションデータを表示
>>> print(session_data)
{'_auth_user_id': '1', '_auth_user_backend': 'django.contrib.auth.backends.ModelBackend', '_auth_user_hash': '3b52c847036e247aec08277f3c96801f08729b54fa138dfeaa22c9b99d8e0053'}
```

