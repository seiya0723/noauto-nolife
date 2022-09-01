---
title: "【Django】実行されるクエリ(SQL)を確認する【.query】"
date: 2021-09-02T13:20:50+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","モデル","tips" ]
---


備忘録として。複雑なORMになった時、クエリを確認する時は、末尾に`.query`属性を使う。print文で出力できる。

    print(Topic.objects.all().query)

    #出力結果
    SELECT "topic"."id", "topic"."comment" FROM "topic"

表示はされるものの、SQLが最適化されているわけではない点に注意。あくまでも挙動がおかしいときの確認用として。

## 【補足】生のSQLを実行する

出力した生のSQLを少しいじって実行させることもできる。SQLの末尾を示す`;`は不要。

    Topic.objects.raw("SELECT * FROM topic")

SQLインジェクションには十分注意する。`.raw()`を使うのは最終手段と考えたほうが良いだろう。

