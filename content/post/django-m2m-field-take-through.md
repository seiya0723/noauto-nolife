---
title: "DjangoでManyToManyFieldを使い、中間テーブルのモデルを取得する【多対多のthrough】"
date: 2023-09-20T16:37:06+09:00
lastmod: 2023-09-20T16:37:06+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","多対多" ]
---


例えば、こういうモデル構造の場合、
```
from django.db import models

class Person(models.Model):

    name            = models.CharField(max_length=128)

    def __str__(self):
        return self.name

class Group(models.Model):

    name            = models.CharField(max_length=128)
    members         = models.ManyToManyField(Person, through='Membership')

    def __str__(self):
        return self.name

class Membership(models.Model):

    person          = models.ForeignKey(Person, on_delete=models.CASCADE)
    group           = models.ForeignKey(Group, on_delete=models.CASCADE)
    date_joined     = models.DateField()
    invite_reason   = models.CharField(max_length=64)

```


通常、Groupモデルの、membersフィールドで呼び出せるのは、紐付いているPersonモデルのオブジェクトである。

中間テーブルのモデルであるMembershipではない。


もし、membersフィールドからMembershipモデルのオブジェクトを取り出したい場合は、


```
group       = Group.objects.all().first()
memberships = group.membership_set.all()
```

とする。through で指定した内容の小文字に`_set`がつく。


テンプレートから呼び出すには

```
<h2>グループの招待者と招待理由の一覧。</h2>
{% for group in groups %}
{% for menbership in group.membership_set.all %}
<div>{{ membership.person.name }} : {{ membership.invite_reason }}</div>
{% endfor %}
{% endfor %}
```

こうすれば良い。



## 関連記事

[【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】](/post/django-m2m-search-and-add/)


