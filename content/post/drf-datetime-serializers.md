---
title: "DateTimeFieldで、フォーマットを指定したserializers.pyを作る"
date: 2024-12-23T13:03:03+09:00
lastmod: 2024-12-23T13:03:03+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","drf","serializers.py","react" ]
---



DateTimeFieldを含むモデルで、シリアライザをこう作ると

```
from rest_framework import serializers
from .models import Category,Todo

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model   = Category
        fields  = ("id", "created_at", "name", "color")

class TodoSerializer(serializers.ModelSerializer):
    category    = CategorySerializer()

    class Meta:
        model   = Todo
        fields  = ("id", "category", "created_at", "content", "deadline", "is_done")
```

このようにタイムゾーン表記になってしまう。

```
作成日: 2024-12-25T12:00:00+09:00
締切: 2024-12-25T12:00:00+09:00
```

年月日表記に修正をするには、serializers.pyでフォーマットを指定する。

```
from rest_framework import serializers
from .models import Category,Todo

class CategorySerializer(serializers.ModelSerializer):
    created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H:%M:%S")

    class Meta:
        model   = Category
        fields  = ("id", "created_at", "name", "color")

class TodoSerializer(serializers.ModelSerializer):

    created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H:%M:%S")
    deadline    = serializers.DateTimeField(format="%Y年%m月%d日 %H:%M:%S")
    category    = CategorySerializer()


    class Meta:
        model   = Todo
        fields  = ("id", "category", "created_at", "content", "deadline", "is_done")
```

```
作成日: 2024年12月25日 12:00:00
締切: 2024年12月25日 12:00:00
```


