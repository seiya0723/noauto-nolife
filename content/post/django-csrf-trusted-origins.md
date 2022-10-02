---
title: "【Django】Django4.0以上はsettings.pyにて、CSRF_TRUSTED_ORIGINSにオリジンを指定しないとPOSTリクエスト時に403Forbiddenになる"
date: 2022-10-01T14:42:43+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","AWS","EC2" ]
---


## 背景

下記記事に倣って、EC2に独自ドメインを指定して、デプロイを完了させた。

[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)

その後、POSTメソッドのリクエストを送信する際、どう頑張ってもCSRF検証に失敗したというエラーが出てしまう。


    CSRF Failed: Referer checking failed - https://*********************.com does not match any trusted origins.


これはなぜか。どう対策をすれば良いのかをまとめてみた。

## 原因


### 【事前知識】オリジンとは

まず、オリジンというものを理解する必要がある。知っているという方は次の項へ

オリジンとは、httpもしくはhttpsなどのプロトコル、noauto-nolife.comなどのドメイン、8000などのポート番号までの組み合わせのことを言う。

例えば、以下のURLの場合
    
    https://noauto-nolife.com/post/ec2-origin-domain-https/

オリジンはこうなる。(ウェルノウンポート(HTTPSの場合は443番)を使用している場合はポート番号は省略可)

    https://noauto-nolife.com

このURLであれば

    http://127.0.0.1:8000/single/1

オリジンはこう。

    http://127.0.0.1:8000


### 【原因の解説】ElasticIPによってインスタンスに割り当てられたIPアドレスと、独自ドメインの違いにある

まず、下記記事の仕組みをご覧いただきたい。

[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)

このインスタンスにはElasticIPによって割り当てられたIPアドレスで動作している

一方で、クライアント側からは独自ドメインでアクセスしている。Route53によって独自ドメインはロードバランサのIPアドレスに逆引きされ、ロードバランサはインスタンスにリクエストを与えている。

すると、クライアント側から見ると独自ドメイン。インスタンス側から見るとElasticIPによって割り当てられたIPアドレスで動作している。

この場合、クライアントがPOSTリクエストを送信する時、リクエストのヘッダーには独自ドメインが指定されている。

一方で、インスタンス側はElasticIPしか割り当てられていないので、リクエストヘッダーに書かれた独自ドメインを自分の物と認識する事ができない。

結果的にDjangoはよそのサイトからPOSTリクエストが送信されたとみなし、CSRFトークンが一致していたとしても、これをCSRF攻撃と誤認。403Forbiddenになってしまう。


## 解決策

settings.pyにて、`CSRF_TRUSTED_ORIGINS`を追加する。

    ALLOWED_HOSTS           = [ "noauto-nolife.com" ]

    CSRF_TRUSTED_ORIGINS    = [ "https://noauto-nolife.com" ]

`ALLOWED_HOSTS`は独自ドメイン(ホスト名)のみを記述し、`CSRF_TRUSTED_ORIGINS`はhttpsからドメイン名、ポート番号(今回は443なので記述の必要はない)もセットしたオリジンを追加しておく。

これでCSRF問題は改善される。


## 結論

Django4.0からの仕様変更であり、それ以前のバージョンであれば、この問題は発生しない点に注意。

つまり、4.0からはドメイン単位ではなく、より厳しいオリジン単位で判定する。

だから旧バージョンのDjangoでは、プロトコルやポート番号が正規のものではない場合、CSRF攻撃が成立してしまう問題があると思われる。

- 参照元1: https://stackoverflow.com/questions/38841109/csrf-validation-does-not-work-on-django-using-https
- 参照元2: https://docs.djangoproject.com/en/4.0/ref/settings/#csrf-trusted-origins


