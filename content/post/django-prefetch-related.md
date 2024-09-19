---
title: "【Django】逆参照で効率的にDBにアクセスする【`.prefetch_related()` 】"
date: 2024-09-19T10:56:02+09:00
lastmod: 2024-09-19T10:56:02+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


例えばこのモデルのとき。

```
from django.db import models

class Category(models.Model):
    name = models.CharField(verbose_name="名前",max_length=20)
    
class Topic(models.Model):
    comment = models.CharField(verbose_name="コメント",max_length=2000)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
```

普通に逆参照を使うと、クエリが再実行されるためDBに負担がかかる

```
categories = Category.objects.all() 

for category in categories 

    # ここでDB読み込み
    print( category.topic_set.all() )
```

そこで、`.prefetch_related()` を使って 逆参照するデータを前もってキャッシュしておく。

```
categories = Category.objects.prefetch_related("topic_set").all() 

for category in categories 
    # キャッシュから読み込みをするので、DBに負担がかからない
    print( category.topic_set.all() )
```

## 結論

DBに負担がかかっている場合は、`.prefetch_related()`を試す。


