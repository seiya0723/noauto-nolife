---
title: "Django Rest FrameworkのViewの書き方【APIViewと汎用APIView、ModelViewSetの違い】"
date: 2024-05-01T13:10:52+09:00
lastmod: 2024-05-01T13:10:52+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","react","Restful" ]
---


Django Rest Framework (以下、DRF)のビューの書き方をまとめる。

下記記事で紹介した素のDjangoのビューと同様、DRFでも継承するビューによって大きく書き方が全く違う。

【関連記事】 : [【Django】ビュー関数とビュークラスの違い、一覧と使い方](/post/django-view-def-and-class/)

本記事では、状況に応じて、適切なビューがコーディングできるようビューの書き方をまとめる。


## 前提


### モデル

```
from django.db import models

class Topic(models.Model):

    comment     = models.CharField(verbose_name="コメント",max_length=2000)
```

### シリアライザ

```
from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ("id","comment")
```



## 主なビューの書き方

主なビューの書き方は3つ

- `rest_framework.views.APIView` を継承する書き方
- `rest_framework.generics.CreateAPIView` など汎用APIViewを継承する書き方
- `rest_framework.viewsets.ModelViewSet` などを継承する書き方

`rest_framework.views.APIView` は django.views.View と等価とみて良いだろう。

`rest_framework.generics.CreateAPIView` など汎用APIViewは、 素のDjangoのListViewやDetailViewに相当する。

`rest_framework.viewsets.ModelViewSet` などは、ListViewやDetailView、CreateViewなどをひとまとめにしたViewと考えると理解が早い。


## rest_framework.views.APIView を継承する書き方

もっとも詳細な書き方ができるのは、APIViewを継承する書き方。

検索やページネーション、ビューの処理の途中で何らかの処理を加えたい場合は、このAPIViewを継承する方法が妥当。

```
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TopicSerializer
from .models import Topic

class TopicView(APIView):
    def get(self, request, *args, **kwargs):
        queryset    = Topic.objects.all()

        if "pk" in kwargs:
            topic       = get_object_or_404(queryset, pk=kwargs["pk"])
            serializer  = TopicSerializer(topic)
        else:
            serializer  = TopicSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer  = TopicSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, pk=None, *args, **kwargs):
        topic       = Topic.objects.get(pk=pk)
        serializer  = TopicSerializer(topic, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        topic       = Topic.objects.get(pk=pk)
        topic.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
```

### ルーティング

通常のDjangoのViewと同様、`.as_view()` を実行した返り値を呼び出す。

```
from django.contrib import admin
from django.urls import path,include

from bbs import views

urlpatterns = [ 
    path('admin/', admin.site.urls),
    path('api/topics/', views.TopicView.as_view()),
    path('api/topics/<pk>/', views.TopicView.as_view()),
]

```



## rest_framework.generics.CreateAPIView など汎用APIViewを継承する書き方

```
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TopicSerializer

class TopicCreateView(CreateAPIView):
    serializer_class = TopicSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

作成の機能だけが必要な場合は、CreateAPIViewを使うことで簡単に実現できる。

だが、後に機能追加が想定される場合、最初からCreateAPIViewを使うと、コードが煩雑になる。

この汎用APIViewは素のDjangoの汎用Viewと同様、リファクタリング用に使うべきと思われる。

### ルーティング

通常のDjangoのViewと同様、`.as_view()` を実行した返り値を呼び出す。

```
from django.contrib import admin
from django.urls import path,include

from bbs import views

urlpatterns = [ 
    path('admin/', admin.site.urls),
    path('api/topics/', views.TopicCreateView.as_view()),
]
```


## rest_framework.viewsets.ModelViewSet などを継承する書き方

```
from django.shortcuts import render
from rest_framework import viewsets
from .serializers import TopicSerializer
from .models import Topic

class TopicView(viewsets.ModelViewSet):
    serializer_class    = TopicSerializer
    queryset            = Topic.objects.all()
```

とてもシンプルに書くことができる。

これだけで、CRUDが実現される。

### ルーティング

ModelViewSetの場合、APIViewと違ってルーティングの書き方も異なる

```
from django.contrib import admin
from django.urls import path,include


from rest_framework import routers
from bbs import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topic")

urlpatterns = [ 
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

この1行のURL設定で

- GET api/topics/: トピック一覧を取得するためのエンドポイント
- POST api/topics/: 新しいトピックを作成するためのエンドポイント
- GET api/topics/{id}/: 特定のトピックの詳細情報を取得するためのエンドポイント
- PUT api/topics/{id}/: 特定のトピックを更新するためのエンドポイント
- PATCH api/topics/{id}/: 特定のトピックの一部を更新するためのエンドポイント
- DELETE api/topics/{id}/: 特定のトピックを削除するためのエンドポイント

この6個分のURL設定に対応している。laravelのRestfulのような書き方だ。

## 結論

[【Restful】Django+Reactビギナーが40分で掲示板アプリ(SPA)を作る方法【axios】](/post/startup-django-react/)ではModelViewSetを使ってビューを作った。

このModelViewSetはモデルを元に作ったシリアライザを指定するだけでCRUDを実現してくれる。

しかし、より詳細な機能を実装させたい場合は、viewsets.ModelViewSet ではなく、 views.APIView を継承して作ったほうが確実だ。

