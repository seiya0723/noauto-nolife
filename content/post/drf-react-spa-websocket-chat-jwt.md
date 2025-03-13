---
title: "【Sec-Websocket-Protocol】DRF+ReactのSPAでWebsocketのチャットサイトでJWT認証をする"
date: 2025-03-07T10:31:08+09:00
lastmod: 2025-03-07T10:31:08+09:00
draft: false
thumbnail: "images/drf-react.jpg"
categories: [ "フルスタック" ]
tags: [ "drf","React","WebSocket","SPA" ]
---


[DRF+ReactのSPAでWebsocketのチャットサイトをつくる](/post/drf-react-spa-websocket-chat/)  と [DRF+ReactのCRUD簡易掲示板SPAでJWT認証を実装する](/post/drf-react-spa-crud-bbs-jwt/) の続き。

今回は、先にSPAでJWT認証を済ませたうえで、WebSocketを行うようにした。Sec-WebSocket-Protocol を使っている。

トークンの検証が煩雑になるため、WebSocketのメッセージ部にJWTトークンは含ませない設計にした。

WebSocket開通後にトークンチェックはされないため、この仕組みだけみるとセキュリティ的に問題があるが、React側でJWTトークンは一定時間おきに自動更新する設計にしているので、問題はない。

あとは、ページリロード時のログインページのちらつきをどうにかしたいところだ。とりあえずWebSocket開通前のJWTの検証は機能しているので、そのUI関係の配慮はまた後で。

## フロント側のWebSocket+JWT認証

Room.jsxにて。フロント側で、WebSocket接続時にアクセストークンをセットして開通させる。

```
// WebSocketサーバーのURL
// TODO: ここにJWTトークンをセットする
const socket = new WebSocket(`ws://localhost:8000/ws/chat/${id}/`,
    [ localStorage.getItem('access_token') ]
);
```


## サーバーサイドのWebSocket+JWT認証

consumers.py にて。WebSocketの接続時。アクセストークンを取り出して、認可する。

```
class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name          = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name    = 'chat_%s' % self.room_name

        if self.scope["user"].is_authenticated:
            print(self.scope["subprotocols"][0])

            # ここでアクセストークンを与え、aceept をしないと、Firefox以外のブラウザではエラー。
            # TIPS: https://stackoverflow.com/questions/64759832/sent-non-empty-sec-websocket-protocol-header-but-no-response-was-received-dj
            # Sent non-empty 'Sec-WebSocket-Protocol' header but no response was received
            await self.accept(self.scope["subprotocols"][0])

            await self.enter_the_room()
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
                )
        else:
            await self.close(code=4001)  # 認証失敗
```



## 結論

ここまで来ると、同期処理が中心のdjangoで、あえてWebSocketを導入する意味がよくわからなくなってくる。

非同期処理を前提とした、FastAPIのほうがオーバーヘッドが発生しにくいのではないだろうか？

その場合DRFとReactのSPAとの連携方法を考えておかないと、設計がかなり煩雑になるだけで終わる可能性もある。

とりあえず、まずはFastAPIでWebSocketを実装する方法を確立しておくべきかと思われる。

## ソースコード

https://github.com/seiya0723/drf-react-spa-websocket-chatsite-jwt

