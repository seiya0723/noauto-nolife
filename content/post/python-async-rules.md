---
title: "Python非同期プログラミングのルール"
date: 2025-01-29T09:53:19+09:00
lastmod: 2025-01-29T09:53:19+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "tips","Python" ]
---

非同期プログラミングには守るべきルールがある。

同期プログラミングと同じように作るとエラーが出るため、ルール・作法をここにまとめる。

## 非同期処理のルール一覧

- I/Oバウンドな同期処理は非同期処理にする
- 非同期関数を定義するには、async def
- 非同期関数を実行するには、await
- 同期関数から非同期関数を実行するには、 asyncio.run() 
- 非同期関数をまとめて実行するには、 asyncio.gather()
- 同期関数を非同期化させるには、@sync_to_async 
- 非同期的に待機するには、asyncio.sleep()
- HTTPリクエストを非同期化させるには、aiohttp
- ファイル操作を非同期化させるには、aiofiles 
- DjangoORMで得られたモデルオブジェクトをそのままreturnしてはいけない


## I/Oバウンドな同期処理は非同期処理にする

「I/Oバウンドな同期処理」というのは、I/O待機が発生する、

- ネットワークへのリクエスト
- データベースアクセス
- ファイルの読み書き
- USBデバイスの操作

などである。これらは、入出力操作に束縛され、動作完了まで待機される。

結果、このI/Oバウンドな処理を同期的に行っていると、処理速度が遅くなる。

非同期処理の概念に関しては下記も参考に。

参照: [非同期処理(async、await)とマルチスレッド(threading)とマルチプロセス(multiprocessing)の違い](/post/threading-vs-processing-vs-asyncio/)

Pythonのほとんどの処理は同期処理である。print文も同期処理だ。

ただし、同期処理の中にも、I/Oバウンドなものと、そうでないものがある。

非同期処理をするべきは、先に挙げた「I/Oバウンドな同期処理」であり、そうでないものは非同期処理による高速化は限られる。

print文は「I/Oバウンドではない同期処理」であり、print文を非同期化しても高速化はそれほど期待できない。


## 非同期関数を定義するには、async def

非同期関数を定義するには、通常のdef 関数に async をつける。

```
async def fetch_data():
    return "Hello, Async!"
```


## 非同期関数を実行するには、await

```
async def fetch_data():
    return "Hello, Async!"


async def run():
    message = await fetch_data()
    print(message)
```

このようにawait を使って非同期関数を実行する。await を使うことで、非同期関数終了まで待機できる。

ちなみに、await を使わずに実行することはできない。

```
async def fetch_data():
    return "Hello, Async!"

async def run():
    message = fetch_data()
    print(message)
```

このように、同期関数の実行のように書いても実行されない。

これは非同期関数のコルーチンオブジェクトが返されるだけである。


## 同期関数から非同期関数を実行するには、 asyncio.run() 

```
import asyncio

async def async_function():
    await asyncio.sleep(1)
    return "Async Done"

def sync_function():
    result = asyncio.run(async_function())
    print(result)

sync_function()
```

asyncio.run() を使い、非同期関数を引数に入れることで同期関数内でも実行できる。

これは、Pythonファイルが同期的に動作していれば、グローバルスコープでも同じ。

```
import asyncio

async def async_function():
    await asyncio.sleep(1)
    return "Async Done"


result = asyncio.run(async_function())
print(result)
```

このように呼び出しできる。

FastAPIは非同期的に動作しているため、FastAPIのグローバルスコープでこの asyncio.run() は使ってはいけない(エラーになる)

非同期処理の中、もしくはイベントループ( asyncio.run() )が既に実行中の場合、エラーになってしまう。

```
import asyncio

async def async_function():
    await asyncio.sleep(1)
    return "Async Done"


result = asyncio.run(async_function())
print(result)

# これはエラー。
result = asyncio.run(async_function())
print(result)
```


## 非同期関数をまとめて実行するには、 asyncio.gather()

非同期処理をまとめて実行することができる。これが非同期並行処理である。

```
import asyncio

async def task1():
    await asyncio.sleep(1)
    return "Task 1 Done"

async def task2():
    await asyncio.sleep(2)
    return "Task 2 Done"

async def main():

    results = await asyncio.gather(task1(), task2())
    print(results)

asyncio.run(main())
```

このように、main関数では2つの非同期関数をまとめて実行することができる。 

リスト型に非同期関数のコルーチンオブジェクトをappendして、後でまとめて実行する方法も有効。

```
import asyncio

async def task1():
    await asyncio.sleep(1)
    return "Task 1 Done"


async def main():

    tasks = [ task1() for i in range(10) ]

    results = await asyncio.gather(*tasks)
    print(results)
```

このリストの内包表記で、10個分のtask1のコルーチンオブジェクトを含んだリストを作る。

.gather() を使ってまとめて実行している。

`*tasks` とすることでリストを展開して、引数に与えることができる。 Djangoの*args, **kwargs と同じアンパッキングの概念である。


## 同期関数を非同期化させるには、@sync_to_async 

同期関数があり、とにかく非同期化させたい場合は、 `@sync_to_async` デコレータでラップすれば良い。

```
from asgiref.sync import sync_to_async

@sync_to_async
def sync_function():
    return "Sync to Async"


async def main():
    result = await sync_function()
    print(result)

asyncio.run(main())
```

なお、デコレータを使わなくても同期関数の非同期化はできる。

```
from asgiref.sync import sync_to_async

def sync_function():
    return "Sync to Async"

async_function = sync_to_async(sync_function)

async def main():
    result = await async_function()
    print(result)

asyncio.run(main())
```

これで、非同期関数と同じように呼び出せるが、内部的には同期動作になってしまうため、直列的に動作する点に注意。

## 非同期的に待機するには、asyncio.sleep()

非同期関数内で、time.sleep() をしてしまうと、ブロッキングが発生してしまう。

これでは、他の非同期処理にタスクが回らない。

非同期関数内では、 asyncio.sleep() を使う。

```
import asyncio

async def wait():
    print("Waiting...")
    await asyncio.sleep(2)
    print("Done")

asyncio.run(wait())
```

## HTTPリクエストを非同期化させるには、aiohttp

HTTPリクエストを送信できる、requests ライブラリは同期動作である。

つまり、ブロッキングが発生し、I/O待機時に他の非同期処理にタスクが回らない。

そこで、aiohttp ライブラリを使う。

```
pip install aiohttp
```

```
import aiohttp
import asyncio

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

asyncio.run(fetch("https://example.com"))
```

ただし、非同期的にリクエストを送るということは、同期リクエストよりも高速にリクエストを送るということ。

並列処理のマルチスレッドよりも非常に高速なため、同一のリモートホストに対して非同期リクエストを送ってBANされないように。

参照: [非同期リクエスト vs マルチスレッドリクエスト vs 直列リクエスト](/post/aiohttp-vs-threading-vs-serial-request/)


## ファイル操作を非同期化させるには、aiofiles 

ファイル操作も同期動作である。

そのため、非同期関数内で実行すると、ブロッキングが発生。他の非同期処理にタスクが回らない。

そこで、非同期でファイルの操作をするライブラリ、aiofiles を使う。

```
pip install aiofiles
```

```
import aiofiles
import asyncio

async def write_file():
    async with aiofiles.open("example.txt", "w") as f:
        await f.write("Hello, aiofiles!")

asyncio.run(write_file())
```

## DjangoORMで得られたモデルオブジェクトをそのままreturnしてはいけない

DjangoのORMは同期動作。

そのため、非同期関数からモデルオブジェクトをそのままreturn すると、エラーが出る。

```
async def load_topics():
    # モデルオブジェクトをそのまま返しているのでエラー。
    # SynchronousOnlyOperation: You cannot call this from an async context - use a thread or sync_to_async.
    return Topic.objects.all()

async def main():
    topics = await load_topics()
    print(topics)
```

内部的に同期処理が行われるので、そのまま返すのではなく、シリアライズするか配列に変換して返す。

```
async def load_topics():
    # モデルオブジェクトをそのまま返しているのでエラー。
    return list(Topic.objects.all().values())

async def main():
    topics = await load_topics()
    print(topics)
```


