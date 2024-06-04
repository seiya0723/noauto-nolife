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



