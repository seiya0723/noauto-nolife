---
title: "DjangoをHeroku+Cloudinaryの環境にデプロイする"
date: 2021-09-22T17:34:37+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Heroku","デプロイ" ]
---

Herokuにはクレジットカードを登録することで、Cloudinaryというアドオンを利用することができる。これがHerokuのストレージとして運用可能。

一部は[DjangoをDEBUG=FalseでHerokuにデプロイする方法](/post/django-deploy-heroku/)と内容が重複しているため、そちらを読んだ人向けに書く。

アップロードするコードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)より流用。

## 流れ

1. Herokuへクレジットカード登録
1. Cloudinaryの設定
1. settings.pyを修正
1. デプロイ


## Herokuへクレジットカード登録

Herokuへカードの登録を済ませると、一ヶ月の無料稼働時間が450時間分追加され、合計1000時間になる。AWSと違って、1年間のみというわけではなく永年無料。






## Cloudinaryの設定

## settings.pyを修正

ストレージとしてCloudinaryを使用するので、







## デプロイ





