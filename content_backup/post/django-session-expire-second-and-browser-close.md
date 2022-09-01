---
title: "【Django】セッションの有効期限をセット、もしくはブラウザを閉じた時にセッションを無効化【settings.py】"
date: 2022-05-01T20:09:59+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","セキュリティ","tips" ]
---


セキュリティを担保したいサイトであれば、ブラウザが閉じてもセッションが残るデフォルトのDjango設定を疎ましく思うだろう。

そういう時は、settings.pyからセッションの有効期限の設定もしくは、ブラウザの終了を検知して無効化する設定を施せばよい。


## セッションに有効期限をセットする【単位:秒】

例えば60秒後にセッションを切って、再ログインを要求させる場合はこうする。

    SESSION_COOKIE_AGE  = 60

デフォルトでは2週間になっている。

## ブラウザの終了を検知してセッションを切る

    SESSION_EXPIRE_AT_BROWSER_CLOSE = True


