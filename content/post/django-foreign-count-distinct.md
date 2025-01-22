---
title: "Djangoで複数の外部キーに対応したフィールドの個数をカウントする【annotate(Count)+DISTINCT】"
date: 2021-07-31T16:30:47+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---

[【Django】外部キーに対応したデータの個数をカウントして表示【リプライ・コメント数の表示に有効】【annotate+Count】](/post/django-foreign-count/)から

annotateで外部キーで繋がっているコメント数をカウントしてフィールドを追加するには下記のようにすれば良い。

    from django.db.models import Count
    Video.objects.annotate( num_comments=Count("videocomment") ).all().order_by("-dt")

Countの第一引数に外部キーで繋がっているモデルクラスの小文字を文字列型で指定する。

しかし、マイリスト数、良いねの数など複数の外部キーで繋がっている数をカウントしてフィールドを追加する場合、下記では失敗する。

    from django.db.models import Count
    Video.objects.annotate( num_comments    = Count("videocomment"),
                            num_mylists     = Count("mylist")
                            ).all().order_by("-dt")

カウントが重複されてしまうため、マイリスト等の値がおかしくなる。

そこで、第二引数にdistinct=Trueをセットする。これで重複は除外した上でカウントされ、正しい数値が表示される。

    from django.db.models import Count
    Video.objects.annotate( num_comments    = Count("videocomment", distinct=True),
                            num_mylists     = Count("mylist", distinct=True)
                            ).all().order_by("-dt")


## 結論

これで、検索時にコンテンツに繋がっているデータをカウントして表示させることが容易になった。

もっとも、カスタムテンプレートタグを使えばできなくもないが。


## 参照元

https://stackoverflow.com/questions/13145254/django-annotate-count-with-a-distinct-field

https://docs.djangoproject.com/en/3.2/topics/db/aggregation/#combining-multiple-aggregations
