---
title: "Djangoで主キーのリスト型を作り、合致するレコードを検索する【values_list + filter】"
date: 2021-07-31T16:36:00+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


例えば、複数のレコードのIDを検索して削除したい場合、下記のように記述する。

    result    = Topic.objects.filter(id__in=[1,2,3])
    print(result)

    #idが1,2,3のデータが表示される。


これがリスト型のIDを使用したIN句である。

ちなみに、検索結果からIDのリストを作るには、下記のようにする。


    result  = list(Topic.objects.all().values_list("id",flat=True))
    print(result)

    #[1, 2, 3, 4, 5, 6, 7, 8]

idだけカラムを指定し、flat=Trueとすることで数値型のリストを作ることができる。


## 参照元

https://docs.djangoproject.com/en/3.2/ref/models/querysets/#in

https://docs.djangoproject.com/en/3.2/ref/models/querysets/#values-list


