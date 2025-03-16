---
title: "FastAPIでWebSocketを実現する"
date: 2025-03-16T09:09:44+09:00
lastmod: 2025-03-16T09:09:44+09:00
draft: false
thumbnail: "images/fastapi.jpg"
categories: [ "サーバーサイド" ]
tags: [ "FastAPI","WebSocket","Python" ]
---


[djangoでもWebSocketは実現できる](/post/django-websocket-chatsite/)が、依然djangoの一部は同期動作(DB操作とMIDDLEWARE)。

よって、どうしてもボトルネックが発生する。

そこでWebSocketは、djangoではなく、非同期処理を前提として作られたFastAPIに委ねることで、より高速なWebSocketを実現させる。

本記事では、FastAPIを使ってのWebSocketを実現させる。

ただし、セキュリティは考慮しないものとする。

## FastAPIのWebSocketコード

[FastAPI公式](https://fastapi.tiangolo.com/ja/advanced/websockets/)より流用

```
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()

# TIPS: 接続中の WebSocket クライアントを管理
connected_clients = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    print("Client connected")

    try:
        while True:
            # TIPS: メッセージを受取
            data = await websocket.receive_text()
            print(f"Received: {data}")

            # TIPS: 受け取ったメッセージを全クライアントにブロードキャスト
            for client in connected_clients:
                await client.send_text(f"Server received: {data}")
    
    except WebSocketDisconnect:
        # TIPS: 切断する
        print("Client disconnected")
        connected_clients.remove(websocket)
```


とてもシンプルに実装することができる。

## FastAPIのWebSocketコードの質問


### なぜwhileループしているのか？

[django-channelの方](/post/django-websocket-chatsite/)はwhileループはなく、クラス内のメソッドが呼び出されるイベント駆動仕様になっている。

今回FastAPIでwhileループをして、メッセージを受け取っているのは、FastAPIにイベント駆動のしくみが用意されていないから。

### whileループのポーリングをしているようでは遅いのでは？リソースが浪費されるのでは？


```
    while True:
        data = await websocket.receive_text()
```

この、`receive_text()`でブロッキング(待機)が発生するようになっている。

`input()`で入力待機状態になっているのと同じ。だから、ぐるぐるとwhileループが実行されるわけではない。リソースが浪費されることはない。

### 連続でメッセージを送った時、取りこぼしてしまうのでは？

```
    while True:
        data = await websocket.receive_text()

        # 何らかの処理
```

このwhileループ内で待機状態になっているが、待機状態になる前にメッセージを送った場合、取りこぼしが発生するのではないか？と思うかもしれない。

しかし、待機状態になる前に送られたメッセージは、全て未処理のメッセージとして、キューにセットされるようになっている。

これはWebSocketのプロトコルの仕組み上、WebSocketのバッファに保持されるようになっているため、普通に .receive_text() を実行するだけでバッファから取り出しできる。

FastAPIにはメッセージのバッファ機能はないため、このWebSocketプロトコルのバッファを使う。

ちなみにdjango-channelsでは channel-layer でキューを管理しており、メッセージのバッファはWebSocketのプロトコルに依存していない。


### WebSocketプロトコルのバッファがオーバーフローした場合どうなる？

FastAPIのWebSocketは、WebSocketプロトコルのバッファ機能を使ってメッセージを処理している。

そのバッファよりも大量のメッセージが送られた場合、つまりバッファオーバーフローした場合、メッセージは取りこぼされ処理できなくなってしまう。

そこで、FastAPIは別途Redisを用意しておく必要がある。

### WebSocketプロトコルのバッファは、どれぐらいの性能なのか？

FastAPIで使用されているWebSocketのプロトコルでのバッファは、OSのTCP受信バッファサイズに依存する。

そのサイズは、**数百KBから数MB程度しかない。** つまり、FastAPIでWebSocketを実現した時、画像の送信をある程度頻繁に送るだけで、簡単にバッファオーバーフローする。

実際にTCP受信バッファサイズを確認するには

```
sysctl -a | grep net.core.rmem_max
```

ここで確認できる。私の環境下(Ubuntu22.04 RAM 32GB)の場合

```
net.core.rmem_max = 212992
```

と表示された。つまり、212KBしか保存されないということ。iPhoneで撮った画像を送るだけで、バッファオーバーフローする。


## Django-Channels VS FastAPIのWebSocket

以上をまとめて、どちらが有利か不利かをまとめる

- 処理速度 : すべて非同期処理の FastAPI が速い
- スケーラブル : Redisの設定が簡単な Django-Channels のほうがスケーラブル
- コードのわかりやすさ: イベント駆動の Django-Channels のほうがわかりやすい
- 認証機能 : 最初から認証用のMIDDLEWAREも用意している Django-Channels のほうが簡単に実装できる

よって、小規模で処理速度を最優先する場合、FastAPIは有効。

ある程度の速度は犠牲にしてでも、スケーラブルな設計にするには Django-Channels が有効。

FastAPIは全体的にかなり複雑な設計になりそうだ。とはいえ、Djangoの調整だけでは速度が足りない場合、FastAPIの使用も考慮したほうが良いかと思われる。

## この設計でどれぐらいのトラフィックであれば、稼働できるか調べる

このバッファオーバーフローのリスクを最小限にするためにも、どれぐらいの負荷がかかったらサーバーが機能しなくなるのか、事前に調べておく必要があると思われる。

具体的には、大容量の画像を生成し、それを非同期でFastAPIに送信する。

どれぐらいのファイルサイズで、どのぐらいの量を送れば、メッセージのロスが出るのか。

スケーラブルな設計にしておくのは大前提として、何が問題でシステムが機能不全になっているのかを、はっきりとした根拠で証明する必要がある。


## 参考文献

https://fastapi.tiangolo.com/ja/advanced/websockets/

