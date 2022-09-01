---
title: "【Django】settings.pyをローカル開発用とHerokuとAWS、UbuntuサーバーデプロイとGitHubプッシュ全て両立させる方法"
date: 2021-09-29T13:29:29+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","heroku","aws","ec2","Ubuntu","セキュリティ","デプロイ" ]
---

ソースコード内にはクラウドのDBのパスワードや、ストレージ、Sendgrid、Stripe等のAPIキーが書かれてある。

そのソースコードをGitHubにプッシュしようものなら、一瞬にしてそのAPIやパスワードなどを悪用されてしまう。

だからこそ、それぞれAPIキーやパスワードをgitのバージョン管理外にするよう、gitignoreにそれぞれのファイルを指定する必要があるが、これがとてもめんどくさい。

そこで、本記事ではなるべく流出問題などを考慮し、settings.pyの書き換えを行う。










