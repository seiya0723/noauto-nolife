---
title: "【Django Rest Framework】モデルメソッドはシリアライザメソッドで代用する"
date: 2024-08-12T10:59:58+09:00
lastmod: 2024-08-12T10:59:58+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "drf","django","tips" ]
---


DRFとReactのSPAを作る時、DTLは使えない。

これまでのようにモデルオブジェクトからメソッドを呼び出すことはできない。

そこで、シリアライザにメソッドを用意して代用する。

## モデル

前提として、このようにモデルメソッドを作った時。

```
from django.db import models

class Topic(models.Model):

    comment     = models.CharField(verbose_name="コメント",max_length=2000)


    def comment_lenth(self):
        return len(self.comment)

```

これでは、React側は `comment_lenth` メソッドを呼び出すことはできない。シリアライザにメソッドを追加する。

## シリアライザ

シリアライザで表現するにはこうする。

```
from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):

    comment_lenth = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ("id","comment","comment_lenth")

    def get_comment_lenth(self, obj):
        return len(obj.comment)

```

命名規則として、`serializers.SerializerMethodField()` のフィールド名に `get_` をつけたものをメソッド名にする


## 結論

React側から、jsonデータの中に `comment_lenth` のキーがあるのでそれを呼び出す。

これにより、外部キーの情報も渡すことができる。


### 参考元

https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
