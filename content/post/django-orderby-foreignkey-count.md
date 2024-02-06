---
title: "【Django】使用頻度の高いカテゴリをプルダウンメニューの上部に表示させる【.annotate(count=Count(\"topic\")).order_by(\"-count\")】"
date: 2024-02-04T16:57:59+09:00
lastmod: 2024-02-04T16:57:59+09:00
draft: false
thumbnail: "images/Screenshot from 2024-02-04 17-27-23.png"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


コードは『[Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】【ForeignKey】](/post/django-models-foreignkey/)』の https://github.com/seiya0723/startup_bbs_foreignkey から引用。


モデルが
```
class Category(models.Model):

    name    = models.CharField(verbose_name="カテゴリ名",max_length=20)

    def __str__(self):
        return self.name


class Topic(models.Model):

    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def __str__(self):
        return self.comment
```

こうだったとする。


ビューでTopicが多い順に並び替えるには、


```
from django.db.models import Count

context = {}

#context["categories"]   = Category.objects.all()
context["categories"]   = Category.objects.annotate(count=Count("topic")).order_by("-count")
```

後はテンプレートでレンダリングする。

```
<select name="category">
    {% for category in categories %}
    <option value="{{ category.id }}">{{ category.name }} : ({{ category.count }}件)</option>
    {% endfor %}
</select>
```

これで紐付いている件数もカウントして表示することができる。

<div class="img-center"><img src="/images/Screenshot from 2024-02-04 17-27-23.png" alt=""></div>


## 紐づくデータの合計値で並び替えしたい場合は？

例えば、家計簿を作っており、カテゴリに紐づく品目の合計金額が大きい順に並び替えたいとき。

Sumを使うことで金額の合計を計算し、その順にプルダウンメニューを作ることで対応できる。

以下のモデルのとき

```
class Category(models.Model):

    name    = models.CharField(verbose_name="カテゴリ名",max_length=20)

    def __str__(self):
        return self.name


class Balance(models.Model):

    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
    name        = models.CharField(verbose_name="品名",max_length=100)
    
    price       = models.IntegerField(verbose_name="価格")

    def __str__(self):
        return self.name
```

こうすれば良い。

```
from django.db.models import Sum

context                 = {}
context["categories"]   = Category.objects.annotate(sum=Sum("balance__price")).order_by("sum")
```

紐づくモデルは小文字、`__`で紐づくモデルのフィールド名を指定できる。

これでカテゴリを合計金額が大きい順に並び替えることができる。


## 関連記事

- [【Django】sorted関数とoperatorでモデルのフィールド、メソッドを指定してソーティング・並び替えをする【ランキングの実装に有効】](/post/django-attr-method-sort/)
- [【Django】年、月、日単位でデータをファイリングする時はTruncを使用する【月ごとの売上、個数などの出力に有効】](/post/django-models-trunc/)
