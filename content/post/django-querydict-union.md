---
title: "【Django】検索結果(QuerySet)を結合する【.union()】"
date: 2024-01-29T13:03:33+09:00
lastmod: 2024-01-29T13:03:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

クエリビルダでまとめて検索ができない状況下で、検索処理を複数回に分けて実行し、得られたQuerySetを1つにまとめたいとき。

`.union()` もしくは`|`が使える。

```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic

class IndexView(View):

    def get(self, request, *args, **kwargs):

        topics  = Topic.objects.all()
        context = { "topics":topics }


        # 重複は自動的に除外される
        topics  = topics.union( Topic.objects.all() )
        print(topics)


        first   = Topic.objects.filter(id=1)
        second  = Topic.objects.filter(id=2)
        third   = Topic.objects.filter(id=3)

        # パイプを使用して連結しても良い。
        topics  = first | second | third


        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        posted  = Topic( comment = request.POST["comment"] )
        posted.save()

        return redirect("bbs:index")

index   = IndexView.as_view()
```



