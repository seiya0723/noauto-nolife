---
title: "Django-channelsのAsyncWebsocketConsumerのscopeの内容【JWT認証+Sec-Websocket-Protocol】"
date: 2025-01-18T17:32:48+09:00
lastmod: 2025-01-18T17:32:48+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "tips","WebSocket","Django","DRF" ]
---

AsyncWebsocketConsumer の scope の内容は以下の通り。

ただし、JWT認証をしており、Sec-Websocket-Protocol を使用している。

```
{ 
    'type': 'websocket',
    'path': '/ws/chat/1/',
    'raw_path': b'/ws/chat/1/',
    'root_path': '',
    'headers': [
        (b'host', b'localhost:8000'),
        (b'user-agent', b'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0'),
        (b'accept', b'*/*'),
        (b'accept-language', b'ja,en-US;q=0.7,en;q=0.3'),
        (b'accept-encoding', b'gzip, deflate, br, zstd'),
        (b'sec-websocket-version', b'13'),
        (b'origin', b'http://localhost:3000'),
        (b'sec-websocket-protocol', b'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM3MTg4NDg5LCJpYXQiOjE3MzcxODgzNDUsImp0aSI6IjI0OWRlMTUzMjY0YTQ4ZDE5YWVkZDJiODlhNTgwY2M5IiwidXNlcl9pZCI6MX0.hzS0uwx4LhPlM6wFJiIUpEkjVjkGpV87psw5MD1leyk'),
        (b'sec-websocket-extensions', b'permessage-deflate'),
        (b'sec-websocket-key', b'Q257WDS+ETm8KNLmj6cQiQ=='),
        (b'dnt', b'1'),
        (b'sec-gpc', b'1'),
        (b'connection', b'keep-alive, Upgrade'),
        (b'cookie', b'csrftoken=8ShA2y6HDOr794MF0TdrSnbEv76KCY0Y; _ga_HDX0LW64ZT=GS1.1.1737184513.53.1.1737184805.0.0.0;'),
        (b'sec-fetch-dest', b'empty'),
        (b'sec-fetch-mode', b'websocket'),
        (b'sec-fetch-site', b'same-site'),
        (b'pragma', b'no-cache'),
        (b'cache-control', b'no-cache'),
        (b'upgrade', b'websocket')
        ],
    'query_string': b'',
    'client': ['127.0.0.1', 35492],
    'server': ['127.0.0.1', 8000],
    'subprotocols': ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM3MTg4NDg5LCJpYXQiOjE3MzcxODgzNDUsImp0aSI6IjI0OWRlMTUzMjY0YTQ4ZDE5YWVkZDJiODlhNTgwY2M5IiwidXNlcl9pZCI6MX0.hzS0uwx4LhPlM6wFJiIUpEkjVjkGpV87psw5MD1leyk'],
    'asgi': {'version': '3.0'},
    'user': <User: asahina>,
    'path_remaining': '',
    'url_route': {'args': (), 'kwargs': {'room_name': '1'}}
}
```

ユーザーエージェントやCookieのデータも含まれる。

今回、ミドルウェアなどで操作しているため、状況によって得られる内容は異なる。

## どうやって確認する？

普通に、connectメソッドで、print文を実行すれば良い。

```
async def connect(self):
    print(self.scope)
```

