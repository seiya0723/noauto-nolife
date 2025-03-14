---
title: "UbuntuへRedisをインストールし、Django上でキャッシュサーバーとして扱う"
date: 2025-03-13T09:54:37+09:00
lastmod: 2025-03-13T09:54:37+09:00
draft: false
thumbnail: "images/redis.jpg"
categories: [ "インフラ" ]
tags: [ "redis","ubuntu","django" ]
---

## UbuntuへRedisをインストール

```
sudo apt install redis 
```

でインストール完了。

```
redis-cli
```

でRedisのCLIを起動する。 SETコマンド、GETコマンドでキーの追加・取得ができる。

```
127.0.0.1:6379> SET mykey "Hello, Redis!"
OK
127.0.0.1:6379> GET mykey
"Hello, Redis!"
127.0.0.1:6379> 
```

削除をしたいときは、DELコマンド

```
127.0.0.1:6379> GET mykey
"Hello, Redis!"
127.0.0.1:6379> DEL mykey
(integer) 1
127.0.0.1:6379> GET mykey
(nil)
127.0.0.1:6379> 
```

動作確認をするには、systemctl コマンド

```
sudo systemctl status redis 
```

動いていればこんな表示になる。
```
● redis-server.service - Advanced key-value store
     Loaded: loaded (/lib/systemd/system/redis-server.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2025-03-13 09:50:21 JST; 12min ago
       Docs: http://redis.io/documentation,
             man:redis-server(1)
   Main PID: 52676 (redis-server)
     Status: "Ready to accept connections"
      Tasks: 5 (limit: 38245)
     Memory: 2.7M
        CPU: 1.375s
     CGroup: /system.slice/redis-server.service
             └─52676 "/usr/bin/redis-server 127.0.0.1:6379" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""

 3月 13 09:50:21 akagi-z370a systemd[1]: Starting Advanced key-value store...
 3月 13 09:50:21 akagi-z370a systemd[1]: Started Advanced key-value store.
```

ちなみに、Redisはポート番号を分けることで、複数起動も可能。


## djangoで動作させるには？

普通にキャッシュをするだけであれば、djangoのデフォルトのRedisバックエンドを使うとよいだろう。

```
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://localhost:6379/1",
    }
}
```

高速キャッシュや非同期対応、クラスタ対応、障害耐性なども設計に含める場合、django-redisを使う。

```
pip install django-redis
```

```
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

このLOCATIONの `redis://127.0.0.1:6379/1` でRedisのDBとして1を指定しているが、指定なしでもOK

`redis://127.0.0.1:6379/` としても動く。別アプリケーションとキャッシュを分けておきたい場合はDBを指定する。


実際にビューなどで使うには以下のようにする。
```
from django.core.cache import cache

# 値をセット（60秒間有効）
cache.set("my_key", "Hello, Redis!", timeout=60)

# 値を取得
value = cache.get("my_key")
print(value)  # Hello, Redis!

# キャッシュ削除
cache.delete("my_key")
```

djangoのローカルメモリキャッシュと違って記録できるデータは

- 数値型
- 文字列型
- リスト型
- セット型

など、大抵のデータは保存できる。Pythonのオブジェクトは保存できないので、JSON文字列などに変換する。

BytesIOに保存したバイナリデータも、Redisに保存することができる。そのため画像や動画のキャッシュなども実現できる。


## djangoでのRedisの活用例

### セッションをRedisで管理する

通常、djangoのセッション情報はDBに保存されるようになっている。

しかし、これではセッション情報がディスクに保存されてしまうため、読み書きが遅い。

代わりにRedisを使えば、セッション情報がメモリに保存されるようになり、高速なセッション管理(ログイン)が実現できる。

更にTTLを指定し、一定時間経てばセッションを自動で破棄する仕組みにすれば、より厳重なセッションの管理もできるようになるだろう。

djangoサーバーが複数台になったとしても、Redisサーバーにセッションを記録しておけば、複数のdjangoサーバーでセッション情報を共有できる。

### DBの書き込みをRedisでバッファリングする

DBの書き込み作業を何度も何度も繰り返すような、チャットサービスなどを作る場合。ディスクへの書き込みがボトルネックになってしまうこともある。

そこで、まずは一旦Redisに書き込みし、Redisの内容を一定時間おきにDBへまとめて書き込む(同期する)ようにすれば、1回の書き込みのレスポンスが高速になる。


### DBの読み込みをキャッシュして、書き込みがあったときだけ読み込みする。

djangoのシグナルを使うことでできる。

djangoのローカルメモリキャッシュでも実現はできるが、プロセス単位でキャッシュした内容は分離されるため、Redisのほうが安全。

以下は、ローカルメモリキャッシュではあるが、DB読み込み後、60秒間保持し、書き込みがあればシグナル発動してDBを再読込してキャッシュしている。

[DjangoでServerSentEvents(SSE)とローカルメモリキャッシュを使い、リアルタイムでDB内の情報を表示する](/post/django-sse-local-caches-realtime/)

これをRedisにすれば良いだけ。

### 動画ファイルのストリーミング配信

例えば、長時間の動画ファイルがあったとする。普通にvideoタグで動画ファイルを読み込みした場合、シークバーを動かして途中から再生はできない。

だから、動画ファイルの分割(チャンク)を作ってRedisにキャッシュしてもらう。ディスクから直接読み込みに行くよりかは事前にキャッシュしたデータの配信のほうがスピーディーに解決できる。

## 補足

ちなみに、Pythonには、Redisへのアクセスを非同期化させる aioredis というライブラリがある。

とても高頻度にRedisへのアクセスを繰り返す場合、IO待機がボトルネックになっている場合は、高速化に貢献できるだろう。



