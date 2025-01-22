---
title: "FastAPIでHelloworldとインストール"
date: 2025-01-22T09:19:55+09:00
lastmod: 2025-01-22T09:19:55+09:00
draft: false
thumbnail: "images/fastapi.jpg"
categories: [ "サーバーサイド" ]
tags: [ "FastAPI" ]
---


## FastAPI とは？

FastAPIは、高性能なウェブアプリケーションフレームワークで、Python3.8以上で動く。APIサーバーをつくることができる。

非同期(ASGI)をネイティブにサポートしているため、1スレッドで複数のリクエストを捌くことができる。

FastAPIでは非同期対応により、I/O待機時間を減らし、CPUリソースをフル活用できる。


## インストール

```
pip install fastapi uvicorn 
```

## main.py をつくる

```
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
```

## サーバーを起動する

```
uvicorn main:app --reload
```

http://127.0.0.1:8000/ にアクセスすると、JSONが返却される。ポート番号を変更するには


```
uvicorn main:app --reload --port 8080
```

```
uvicorn [Pythonファイル名]:[FastAPIインスタンス名] --reload
```

--reload でFastAPIアプリケーション起動とファイル編集時のリロードをする、 --portでポート番号の変更をする。


## その他機能


FastAPIには、作成したアプリのAPIドキュメントが自動的に作られる。テストもできる。

http://127.0.0.1:8000/docs

APIリクエストのテストをする場合は、こちらから。

<div class="img-center"><img src="/images/Screenshot from 2025-01-22 09-36-58.png" alt=""></div>

http://127.0.0.1:8000/redoc

<div class="img-center"><img src="/images/Screenshot from 2025-01-22 09-38-26.png" alt=""></div>

用意されている全てのAPIを一覧にできる。

