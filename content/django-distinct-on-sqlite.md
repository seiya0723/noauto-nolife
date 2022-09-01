---
title: "【Django】SQLiteでも特定フィールドに対してのdistinctっぽい事(重複除去)を行う【通常はPostgreSQLのみ有効】"
date: 2021-09-10T11:21:51+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","PostgreSQL","SQLite","モデル" ]
---

以下のクエリはPostgreSQLのみ有効。

    Topic.objects.all().distinct("comment")

このように`.disitinct()`に引数としてフィールド名を指定できるのは、PostgreSQLだけ。`.values()`を使う方法もあるが、モデルオブジェクトでなくなる時点で汎用性に乏しい。

そこで、重複するフィールドを除外したいのであれば、こうする。

    topics  = Topic.objects.all().order_by("-dt")

    d_list  = []
    n_list  = []
    for t in topics:
        if t.comment in d_list:
            continue
        d_list.append(t.comment)
        n_list.append(t)

    context["topics"]   = n_list
            
これで重複するコメントを除外して新しいモデルオブジェクトのリストを作ることができた。この方法はDBに依存していないので、SQLiteに限らずどんなDBでも実現できる。`.order_by()`とも両立できるのでとても便利。

ちなみに、リストの内包表記を利用すればもっと短く書くことができる。


