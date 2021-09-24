---
title: "DjangoをHeroku+Cloudinaryの環境にデプロイする"
date: 2021-09-24T10:34:37+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Heroku","デプロイ" ]
---

Herokuにはクレジットカードを登録することで、Cloudinaryというアドオンを利用することができる。これがHerokuのストレージとして運用可能。

一部は[DjangoをDEBUG=FalseでHerokuにデプロイする方法](/post/django-deploy-heroku/)と内容が重複しているため、そちらを読んだ人向けに書く。

アップロードするコードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)より流用。

## Cloudinaryの料金体制と制限について





## 流れ

1. Herokuへクレジットカード登録
1. Cloudinaryの設定
1. settings.pyを修正
1. デプロイ


## Herokuへクレジットカード登録

Herokuへカードの登録を済ませると、一ヶ月の無料稼働時間が450時間分追加され、合計1000時間になる。AWSと違って、1年間のみというわけではなく永年無料。






## Cloudinaryの設定

cloudinaryをインストールする

    pip install cloudinary 



## settings.pyを修正

ストレージとしてCloudinaryを使用するので、その設定を書き込む必要がある。







## デプロイ







## 結論

永年無料のHerokuでストレージが使えるので、リージョンにこだわらないのであればAWSよりもこちらのほうが良いだろう。

体感だが、ローカルネットワーク内のサーバーには劣るが、普通のサイトとして見ればそれほど遅くはない。


参照元

- https://github.com/klis87/django-cloudinary-storage
- https://qiita.com/koki276/items/4f78ca421bea059d7b7a
- https://qiita.com/kanaxx/items/b3366025e6715562d8f9


