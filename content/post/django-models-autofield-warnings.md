---
title: "Djangoでマイグレーションした時、『Auto-created primary key used when not defining a primary key type』と警告される場合の対策"
date: 2021-07-31T20:15:18+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

マイグレーションした時、下記のようなエラーが出る。

<div class="img-center"><img src="/images/Screenshot from 2021-07-31 20-14-34.png" alt="オートフィールドの警告"></div>

これは主キーを定義せず、自動的に作っているからである。

対策は下記を`settings.py`に追加するだけ。

    DEFAULT_AUTO_FIELD='django.db.models.AutoField'


## 結論

主キーをUUIDにしている場合、発生しない警告文である。

Django-allauth等のDjango用のライブラリを使っている場合も、ライブラリの中にモデルが埋まっており、対策をしない限り、このような警告文が出る。

## 参照元

https://stackoverflow.com/questions/66971594/auto-create-primary-key-used-when-not-defining-a-primary-key-type-warning-in-dja


