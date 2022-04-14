---
title: "【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合に有効】"
date: 2022-04-14T16:33:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け" ]
---


例えば、簡易掲示板にて、特定の禁止ワードを含んだ投稿を拒否したい場合。

承認制にして、管理者が文面を確認した上で公開を許す方法もあるが、それでは人件費がかかる。

なるべく保存する前に禁止ワードを含んでいるかどうかをチェックする仕組みにしたい。

そういう時は、validatorsに独自の関数を割り当てれば良い。

コードは[40分Django](/post/startup-django/)から流用して作る

## models.py







## 結論

バリデーションは基本、型の確認や文字列の長さなどまでしか判定できないと思っていたが、今回の件で何でもできる事がわかった。

今回は特定の単語を含んでいるかどうかという判定のため、例えば『バカ』と『バカンス』を両方禁止してしまう問題がある。

そのため、形態素解析ツールを使用すると良いだろう。

MecabやJumanなどがここで有効に機能すると思われる。ただ、誤判定もあるため、手放しで実装を推奨されるものでもない。

もし、不適切な単語を含む投稿をしてバリデーションNGになった場合は、DjangoMesseageFrameworkを使ってユーザーに注意喚起も合わせて行う。

[DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する](/post/django-message-framework/)

参照: https://docs.djangoproject.com/en/4.0/ref/validators/


