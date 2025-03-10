---
title: "DRF+ReactのSPAでWebsocketのチャットサイトでJWT認証をする"
date: 2025-03-07T10:31:08+09:00
lastmod: 2025-03-07T10:31:08+09:00
draft: false
thumbnail: "images/drf-react.jpg"
categories: [ "フルスタック" ]
tags: [ "追記予定","drf","React","WebSocket","SPA" ]
---


[DRF+ReactのSPAでWebsocketのチャットサイトをつくる](/post/drf-react-spa-websocket-chat/)  と [DRF+ReactのCRUD簡易掲示板SPAでJWT認証を実装する](/post/drf-react-spa-crud-bbs-jwt/) の続き。

今回は、先にSPAでJWT認証を済ませたうえで、WebSocketを行うようにした。

トークンの検証が煩雑になるため、WebSocketのメッセージ部にJWTトークンは含ませない設計にした。

WebSocket開通後にトークンチェックはされないため、この仕組みだけみるとセキュリティ的に問題があるが、React側でJWTトークンは一定時間おきに自動更新する設計にしているので、問題はない。

あとは、ページリロード時のログインページのちらつきをどうにかしたいところだ。とりあえずWebSocket開通前のJWTの検証は機能しているので、そのUI関係の配慮はまた後で。



## 結論

ここまで来ると、同期処理が中心のdjangoで、あえてWebSocketを導入する意味がよくわからなくなってくる。

非同期処理を前提とした、FastAPIのほうがオーバーヘッドが発生しにくいのではないだろうか？

その場合DRFとReactのSPAとの連携方法を考えておかないと、設計がかなり煩雑になるだけで終わる可能性もある。

とりあえず、まずはFastAPIでWebSocketを実装する方法を確立しておくべきかと思われる。

## ソースコード

https://github.com/seiya0723/drf-react-spa-websocket-chatsite-jwt

