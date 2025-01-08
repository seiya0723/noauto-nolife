---
title: "DRFでModelViewSetの動的ルーティング(URL内引数)を作る"
date: 2025-01-08T11:39:59+09:00
lastmod: 2025-01-08T11:39:59+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "drf","tips" ]
---


例えば、ModelViewSetが以下のような場合

```
from rest_framework import viewsets

from .models import Category,Topic,Reply
from .serializers import CategorySerializer,TopicSerializer,ReplySerializer

class CategoryView(viewsets.ModelViewSet):
    serializer_class    = CategorySerializer
    queryset            = Category.objects.all()


class TopicView(viewsets.ModelViewSet):
    serializer_class    = TopicSerializer
    queryset            = Topic.objects.all()


class ReplyView(viewsets.ModelViewSet):
    serializer_class    = ReplySerializer
    queryset            = Reply.objects.all()
```

ルーティングは、このように DefaultRouter を使うと良い。

```
from django.contrib import admin
from django.urls import path,include

from rest_framework import routers
from bbs import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topic")
router.register(r"categories", views.CategoryView, "category")
router.register(r"replies", views.ReplyView, "reply")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

だが、これではTopicに紐付いていないReplyまで取得できてしまう。

そこで、

```
HTTP GET /api/replies/ 
```
でReplyを取得するのではなく、

```
HTTP GET /api/topics/1/replies/ 
```

このように動的ルーティング(URL引数を含めた状態)でリプライを取得するように仕立てる。


## views.py 

- `.get_queryset()` を書き換える方法
- `.list()`を書き換える方法

この2パターンがある。

### `.get_queryset()` を書き換える方法


この`.get_queryset()` は全てのメソッドで最初に実行される。

```
class ReplyView(viewsets.ModelViewSet):
    serializer_class    = ReplySerializer

    def get_queryset(self):
        return Reply.objects.filter(topic=self.kwargs.get('topic_id'))
```

例えば、.destroy() で、指定したidのReplyを削除するが、その前に`.get_queryset()`に絞り込んだ上で、指定したidで更に絞り込みをする。

つまり、

1. 全てのメソッドで、まずは `.get_queryset()` が発動する
2. それぞれのメソッドで、1で取得したクエリから更に絞り込みなどをして、処理をする

ということだ。

そのため、`.get_queryset()` のオーバーライドをする時、.filter() の指定には十分注意する。知らぬ間に他のメソッドに影響を与えてしまう可能性があるからだ。

#### 【補足1】実用的な使い方


実用的な使い方として、アクティブなtopicだけCRUD操作するというものがある。

```
class ReplyView(viewsets.ModelViewSet):
    serializer_class    = ReplySerializer

    def get_queryset(self):
        return Reply.objects.filter(topic__is_active=True)
```

こうすれば、凍結状態のTopicに紐づくReplyをCRUDすることはできなくなる。

#### 【補足2】queryset と get_querysetの違い

ViewSetには queryset という属性がある。ここでもModelの操作を指定できる

どちらも、ViewSetのメソッド全てに影響を与える。

ただ、queryset は静的なものであり、requestやselfオブジェクトを元に動的にクエリを実行することはできない。

一方、`.get_queryset()` は動的であり、requestやselfオブジェクトを元に動的にクエリを実行できる。


### `.list()`を書き換える方法

listメソッドをオーバーライドする方法

```
class ReplyView(viewsets.ModelViewSet):
    serializer_class    = ReplySerializer
    queryset            = Reply.objects.all()

    def list(self, request, *args, **kwargs):
        queryset    = Reply.objects.filter(topic=kwargs.get("topic_id"))
        serializer  = self.get_serializer(queryset, many=True)

        return Response(serializer.data)
```

もし、Replyを表示のみする場合は、このオーバーライドで問題はない。

それ以外のメソッドはそのままである。

## urls.py

ではルーティングはどうするか。get_queryset を使う場合

DefaultRouterは使えない。

```
# これは動かない
from rest_framework import routers
from chat import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topics")
router.register(r"topics/<int:topic_id>/replies/", views.ReplyView, "replies")
```

そこで、urlpatternsに直接追加する。

```
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from bbs import views

# DefaultRouterは基本のルーティングしか追加できない。
router = DefaultRouter()
router.register(r"topics", views.TopicView, "topics")

# 動的URLはurlpatterns へ追加する
urlpatterns = [
    path("api/", include(router.urls)),
    path("api/topics/<int:topic_id>/replies/", views.ReplyView.as_view({"get": "list"}), name="replies"),
]
```

### 【補足3】getメソッドだけ受け付けるルーティング

```
path("api/topics/<int:topic_id>/replies/", views.ReplyView.as_view({"get": "list"}), name="replies"),
```

このように、.as_view() に辞書型の引数を入れることで、指定したメソッドだけ受け付けるようになり、それ以外は受け付けなくなる(MethodNotAllowed)

```
views.ReplyView.as_view({"get": "list"})
```

もし、getとpostのみ扱いたい場合、こうする

```
views.ReplyView.as_view({"get": "list", "post": "create"})
```

全てのメソッドを受け付ける場合、

```
views.ReplyView.as_view()
```

でよい。

## 結論

DefaultRouter() を使えば、簡単にRestfulなルーティングができる。

```
from django.contrib import admin
from django.urls import path,include

from rest_framework import routers
from bbs import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topic")
router.register(r"categories", views.CategoryView, "category")
router.register(r"replies", views.ReplyView, "reply")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

だが、動的URLを作るには、urlpatterns に直接入れる必要がある。

```
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from bbs import views

# DefaultRouterは基本のルーティングしか追加できない。
router = DefaultRouter()
router.register(r"topics", views.TopicView, "topics")

# 動的URLはurlpatterns へ追加する
urlpatterns = [
    path("api/", include(router.urls)),
    path("api/topics/<int:topic_id>/replies/", views.ReplyView.as_view({"get": "list"}), name="replies"),
]
```


それができなければ、URLにパラメータを入れるしかない。

とはいえ、パラメータを入れる方法はバリデーションをしなければならず、密結合でもある。

主キーを指定して取り出すのが目的であれば、本記事の方法のほうが良いだろう。


