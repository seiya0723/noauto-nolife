---
title: "【Django】requestオブジェクトからクライアントのUAやIPアドレス、CSRFCookieなどをチェック、テンプレート上に表示する。"
date: 2021-12-11T07:26:40+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け" ]
---


すぐ忘れるので備忘録として。

テンプレートにユーザーのIPアドレス等を表示させたい場合、下記DTLを任意のテンプレートに書き込む。

    {{ request.META }}

これでリクエストに関連するデータが全て表示される。必要なデータを選び、例えば`REMOTE_ADDR`であれば

    {{ request.META.REMOTE_ADDR }}

とすれば良い。

    



