---
title: "【Django+AWS】独自ドメインを割り当てHTTPS通信を実現した状態で、EC2(Ubuntu+Nginx)へデプロイする"
date: 2021-09-10T08:19:27+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","セキュリティ","ec2","nginx" ]
---

既に、[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)の内容を終え、独自ドメインでHTTPS通信が可能な状態である前提で解説する。

一部、[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)と内容が重複しているが、AWS側の設定は一切行わない。書き換えが必要なのは、`settings.py`の`ALLOWED_HOSTS`とNginxの設定ファイル。それぞれ独自ドメイン実装済みの仕様に合わせる。

## settings.py




## Nginxの設定




## 結論




