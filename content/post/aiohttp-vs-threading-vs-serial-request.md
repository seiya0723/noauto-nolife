---
title: "非同期リクエスト vs マルチスレッドリクエスト vs 直列リクエスト"
date: 2025-01-26T10:20:08+09:00
lastmod: 2025-01-26T10:20:08+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","tips","FastAPI" ]
---

[先の記事](/post/threading-vs-processing-vs-asyncio/)でI/Oバウンドの処理は、非同期処理が最適であるとわかった。

本記事では、それがはっきりとわかるコードを用意した。

非同期で大量のリクエストを送信し、レスポンスを受け取る。その処理時間を計測する。

比較のため、マルチスレッド、直列動作のコードも用意した。

## 使用ライブラリ

```
pip install aiohttp requests fastapi uvicorn 
```

```
aiohappyeyeballs==2.4.4
aiohttp==3.11.11
aiosignal==1.3.2
annotated-types==0.7.0
anyio==4.8.0
async-timeout==5.0.1
attrs==25.1.0
certifi==2024.12.14
charset-normalizer==3.4.1
click==8.1.8
exceptiongroup==1.2.2
fastapi==0.115.7
frozenlist==1.5.0
h11==0.14.0
idna==3.10
multidict==6.1.0
propcache==0.2.1
pydantic==2.10.6
pydantic_core==2.27.2
requests==2.32.3
sniffio==1.3.1
starlette==0.45.3
typing_extensions==4.12.2
urllib3==2.3.0
uvicorn==0.34.0
yarl==1.18.3
```

非同期リクエストには、aiohttp を使う。通常の requests では非同期リクエストにはならない。

あとは、FastAPIに fastapi と uvicorn を使う。


## リクエストを捌くFastAPIの準備

```
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/test/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/aaa/")
def read_root():
    return {"message": "Hello, World!"}
```

これが大量のリクエストを捌くFastAPI。

「[FastAPIでHelloworldとインストール](/post/fastapi-helloworld/)」の通り、main.py で作り、uvicornでサーバーを起動。

```
uvicorn main:app --reload
```

続いて、リクエストを送るコードを作る。

## 非同期、マルチスレッド、直列のコード

いずれもセッションを維持し、ローカルホストのFastAPIに対してリクエストを送っている。



```

# ========非同期リクエスト============================
import aiohttp
import asyncio
import time

async def fetch_url(session, url):
    async with session.get(url) as response:
        data = await response.text()
        return len(data)

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        return await asyncio.gather(*tasks)

if __name__ == "__main__":
    start = time.time()

    urls = [
        "http://127.0.0.1:8000/",
        "http://127.0.0.1:8000/test/",
        "http://127.0.0.1:8000/aaa/",
    ] * 200
    results = asyncio.run(fetch_all(urls))

    print("非同期処理結果:", results)
    print("非同期処理時間:", time.time() - start)



# ======マルチスレッドリクエスト======================
import requests
from concurrent.futures import ThreadPoolExecutor
import time

def fetch_url(session, url):
    with session.get(url) as response:
        data = response.text
        return len(data)

def fetch_all(urls):
    with requests.Session() as session:
        with ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(lambda url: fetch_url(session, url), urls))
    return results

if __name__ == "__main__":
    start = time.time()

    urls = [
        "http://127.0.0.1:8000/",
        "http://127.0.0.1:8000/test/",
        "http://127.0.0.1:8000/aaa/",
    ] * 200
    results = fetch_all(urls)

    print("マルチスレッド処理結果:", results)
    print("マルチスレッド処理時間:", time.time() - start)


# ==========直列リクエスト==============================
import requests
import time

start = time.time()
urls = [
    "http://127.0.0.1:8000/",
    "http://127.0.0.1:8000/test/",
    "http://127.0.0.1:8000/aaa/",
] * 200

session = requests.Session()
results = []

for url in urls:
    with session.get(url) as response:
        results.append( len(response.text) )

print("直列処理結果:", results)
print("直列処理時間:", time.time() - start)
```


それぞれ、600リクエストを送信している。


## 動かすとこうなる

処理結果の部分は、とても長いので省略した。違いは一目瞭然。

```
非同期処理結果: [27, 27, 27, 27, 27, ... ]
非同期処理時間: 0.4732174873352051
マルチスレッド処理結果: [27, 27, 27, 27, 27, ... ]
マルチスレッド処理時間: 5.743919134140015
直列処理結果: [27, 27, 27, 27, 27, ... ]
直列処理時間: 28.331538677215576
```

非同期処理が一番高速。

リクエストの送信は、I/Oバウンドの処理のため、非同期処理にすることで、その待機時間を効率的に次の処理に回すことができる。

並列処理ができるマルチスレッドも良いが、それでもI/O待機時間が効率的に使われているとは言えない。

## 非同期リクエストが一番高速であれば、ウェブスクレイピングも非同期でも良いのでは？

実際にやってみた。自分のサイト( https://noauto-nolife.com/ ) に対して。

しばらくアクセスが拒否された。当然である。

非同期リクエストは、あくまでもAPIのリクエスト、ローカルでのテスト用途にとどめておいたほうが無難。

## 結論

もし、APIサーバーの性能をフルに活用したい場合、直列ではなく、マルチスレッドでもなく、非同期にする。

ただ実践で問題になるのはリクエストを送ったあとの処理。

特に何もしていない場合、pythonでは大抵が同期動作になっている。

同期動作にI/Oバウンドで時間がかかる場合、それは直列的に動作することになる。

リクエストが終わったあと、どのような処理をするか、しっかり確認をするべき。状況に応じて、非同期化する、マルチプロセスにするなどが必要。

## 参考文献

- https://qiita.com/shimoch/items/4ad55030f6b065e59fa2
- https://apidog.com/jp/blog/python-aiohttpt/


## ソースコード

https://github.com/seiya0723/fastapi-async-request
