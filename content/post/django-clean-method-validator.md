---
title: "【Django】モデルクラスのcleanメソッドでバリデーションをする"
date: 2024-06-04T21:34:55+09:00
lastmod: 2024-06-04T21:34:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django" ]
---

下記記事は、フィールドにvalidatorsオプションを

[【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】](/post/django-models-origin-validators/)


下記記事は、フォームクラスにcleanメソッドを実装した。

[【Django】ManyToManyFieldにはフィールドオプションvalidatorsは効果なしなので、フォームクラスに追加のバリデーションを【多対多は特殊】](/post/django-m2m-add-validators/)

本記事では、モデルクラスにcleanメソッドを実装させる。

```
from django.core.exceptions import ValidationError

class Topic(models.Model):
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def clean(self):
        super().clean()

        # 100文字未満の短文は拒否
        if len(self.comment) < 100:
            raise ValidationError("この投稿は短すぎます。")
```

モデルを元にしたフォームクラスの場合、モデルのcleanメソッドを引き継ぐ。


## 【補足】モデル自身を呼び出すこともできる。

例えば、過去に投稿した内容と全く同じ内容は受け付けないようにしたい場合。

このようにcleanメソッドから、Topic モデル自身を呼び出すこともできる。

```
from django.db import models
from django.core.exceptions import ValidationError

class Topic(models.Model):

    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def clean(self):
        super().clean()
        exist   = Topic.objects.filter(comment=self.comment).exists()

        if exist:
            raise ValidationError("全く同じ内容が投稿されています。")

```

もっともこの例の重複禁止の場合、uniqueを与えることでも対応できる。下記のほうがよりシンプルである。

```
from django.db import models

class Topic(models.Model):

    comment     = models.CharField(verbose_name="コメント",max_length=2000, unique=True)
```
