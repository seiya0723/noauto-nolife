---
title: "FastAPIでDjangoのORMを使う"
date: 2025-01-28T15:23:00+09:00
lastmod: 2025-01-28T15:23:00+09:00
draft: false
thumbnail: "images/fastapi.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","fastapi","tips" ]
---

Djangoの処理の一部をFastAPIで分離、FastAPI内でDjangoのORMを使ってDBの読み込みをする。


## 実装方法と手順

- FastAPIでDjangoの設定を読み込み
- Djangoのモデルをimportする
- sync_to_asyncデコレータでラップされた関数内でモデルを使う
- モデルオブジェクトをそのままreturn してはいけない。

### FastAPIでDjangoの設定を読み込み

まず、FastAPIでDjangoの設定を読み込みする。


```
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
```

FastAPIのアプリを manage.py と同じ場所に配置した場合。

このようにsettings.pyを読み込みすることで、Djangoと同じ環境を用意できる。


### Djangoのモデルをimportする

```
from bbs.models import Topic
```

bbs アプリのmodels.py のTopicをimportしている。


### sync_to_asyncデコレータでラップされた関数内でモデルを使う

モデルをimportしたあと、直接このように実行してはいけない。

```
Topic.objects.all()
```

なぜなら、DjangoのORMはデータベースに接続をする同期処理。

IO待機が発生するため、非同期のASGIサーバーで動作するFastAPIで直接実行することはできない。

#### print文は同期処理のはず、なぜ直接実行できるのか？

DjangoのORMとprint文は、いずれも同期処理である。

しかし、DjangoのORMはDBへの接続が必要で、**IO待機が発生する同期処理** 。

一方、print文は、**IO待機が発生しない同期処理**。よって、print文は直接実行できる。

IO待機が発生するDjangoのORMは直接実行できない。

#### sync_to_async デコレータでラップした関数

DjangoのORMなどのIO待機が発生する同期処理を、ASGIサーバー内で動作させるには、sync_to_async デコレータでラップした関数内で動作させる。

```
from asgiref.sync import sync_to_async

@sync_to_async
def get_topics():
    return list(Topic.objects.all().values())
```

これによりIO待機の発生する同期処理も、非同期サーバー内で動作できる。

### モデルオブジェクトをそのままreturn してはいけない。


```
from asgiref.sync import sync_to_async

@sync_to_async
def get_topics():
    return list(Topic.objects.all().values())
```

これでDjangoのORMもASGIサーバー内で動作することができる。

ただし、モデルオブジェクトをそのまま返却してはいけない。

```
from asgiref.sync import sync_to_async

@sync_to_async
def get_topics():
    return Topic.objects.all()
```

こんなことをしてしまうと、

```
django.core.exceptions.SynchronousOnlyOperation: You cannot call this from an async context - use a thread or sync_to_async.
```

スレッドを使うか、sync_to_async を使えというエラーが起こる。

「sync_to_async デコレータ使っているじゃないか」と思うかもしれないが、モデルオブジェクトをそのまま返却した時点で、DjangoのORMが動く。

非同期処理内で、IO待機の発生する同期処理が動作するのだ。これでは`@sync_to_async`でラップした意味がない。

返却する値は、Djangoのモデルオブジェクト以外に変換して、返却をする必要がある。

```
    return list(Topic.objects.all().values())
```
例えば、この場合辞書型のリストとして値が得られる。

DRFのシリアライザを使ってもよいだろう。

## まとめ

全部まとめるとこうなる。

```
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bbs.models import Topic
from asgiref.sync import sync_to_async

@sync_to_async
def get_topics():
    return list(Topic.objects.all().values())
```

あとは、これを起動時にグローバル変数に入れる、リクエストが合った時に呼び出すなどすれば良い。


```
from fastapi import FastAPI

app = FastAPI()

@app.on_event("startup")
async def startup():

    global topics_cache
    topics_cache = await get_topics()
```

もしくは、専用のエンドポイントを用意して、DBにアクセスするなど。

```
# Django側でTopicが書き換わった時、ここにリクエストを送り、データを再読込させる。
@app.get("/refresh/")
async def index():

    global topics_cache
    topics_cache = await get_topics()

    return { "topics": topics_cache }
```

## ソースコード

https://github.com/seiya0723/django-fastapi-orm



