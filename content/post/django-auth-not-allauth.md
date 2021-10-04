---
title: "【Django】allauth未使用でユーザー認証機能を実装した簡易掲示板【カスタムユーザーモデルあり】"
date: 2021-10-03T07:00:48+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","allauth","セキュリティ","上級者向け" ]
---

Djangoでは、サードパーティー製ライブラリとしてallauthを使用することで、誰でも簡単にユーザー認証機能を実装させることができる。

だが、allauthで[テンプレートをカスタムしたり](/post/django-allauth-loginpage/)、[ユーザーアカウント新規作成機能を無効化させたり](/post/django-allauth-custom-urls/)、[カスタムユーザーモデルを使ったり](/django-custom-user-model-allauth-bbs/)することはできても、allauthのビューの一部分だけを書き換えたり、無効化したりすることはできない。([allauthのGitHub](https://github.com/pennersr/django-allauth)からビューのコードを持ってこない限り)

そこで、より柔軟な処理を行うことができるよう、本記事ではallauthを使用せずにDjangoにユーザー認証機能を実装させる方法を記す。

ソースコードは、[【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)を使用する。カスタムユーザーモデルを使用することで、汎用性を高める。


## ユーザーIDとパスワードを使用した認証




## メールアドレスとパスワードを使用した認証

https://github.com/akiyoko/django-auth-sample



https://github.com/akiyoko/django-auth-sample/tree/username-and-password-authentication-by-default




## 結論

基本となるオブジェクト指向の概念、カスタムユーザーモデル、allauthの知識があれば、この認証機能を作る事はそれほど難しくはない。

ただ、少なくとも初心者向けとは言い難い。ソースコードを使いまわし出来るレベルであればまだしも。

とは言え、allauthのインストールに必要な容量、セキュリティ上の理由でallauthのアップデートをつづけなければならない問題、比較的自由度の高い認証処理、使用する予定のないallauthの機能などを考えれば、手間こそあれ、実装は妥当だと思われる。




