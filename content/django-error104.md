---
title: "【Django】ConnectionResetError: [Errno 104] Connection reset by peerの対策と再現"
date: 2021-06-09T11:41:25+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","ネットワーク" ]
---


Djangoでレスポンスを待たずに別のリクエストを送ると発生するエラー。実際にはどうすることもできない。


## 再現

`views.py`にtime.sleep(100)と指定。







https://stackoverflow.com/questions/20568216/python-handling-socket-error-errno-104-connection-reset-by-peer
