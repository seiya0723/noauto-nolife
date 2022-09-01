---
title: "Djangoで数値のカンマ区切りを実装させる"
date: 2020-10-24T16:48:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


在庫とかお金とか扱うウェブアプリだとカンマ区切りは必須。

JSに任せてもいいけど、結局正規表現になる上にユーザーに負担を強いるのはどうかと。

ということでDjango側でカンマ区切りを簡単に実装させる。


## settings.pyの追記

INSTALLED_APPSに以下を追加。

    'django.contrib.humanize',

下記をINSTALLED_APPSの上に追加。これで3桁区切りになる。

    NUMBER_GROUPING = 3


## 3桁区切りで表示させたいテンプレートの追記

htmlの冒頭に下記を追加する。

    {% load humanize %}

順番は静的ファイルの読み込みをする`{% load static %}`の次で良い。

続いて、カンマ区切りにしたい変数に下記フィルタを追加する。

    {{ content.price|intcomma }}

`{{ content.price }}`は価格を表示する変数。それに`intcomma`フィルタを追加して`settings.py`で指定した通りに分割してカンマ区切りにする。


## 結論

django.contrib.humanizeは他にもページを見やすくするフィルタが用意されている。

例えば、Twitterで表示される何分前であったかを表示する、`naturaltime`と何日前かを表示する`naturalday`。

お金関係の処理でよく見る10百万円等の表示は、`intword`で表示できる。

詳しくは[公式ドキュメント](https://docs.djangoproject.com/ja/3.1/ref/contrib/humanize/)を参考に





