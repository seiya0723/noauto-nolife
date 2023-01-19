---
title: "【Django】createメソッドを使用して、新規作成する【バリデーションしない点に注意】"
date: 2023-01-19T09:25:35+09:00
lastmod: 2023-01-19T09:25:35+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

`.create()`を使うことで手軽に新規作成ができる。

```
Model.objects.create()
```

[40分Django](/post/startup-django/)を元に組むとこうなる。

```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic


class IndexView(View):

    def get(self, request, *args, **kwargs):

        # .create()を使うことで.save()を使わなくても新規作成ができる。返り値は新規作成したモデルオブジェクト
        topic   = Topic.objects.create(comment="これはテストです。")
        print(topic)

        # バリデーションまではされない点に注意。
        topic   = Topic.objects.create(comment="")
        print(topic)


        topics  = Topic.objects.all()
        context = { "topics":topics }


        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        posted  = Topic( comment = request.POST["comment"] )
        posted.save()

        return redirect("bbs:index")

index   = IndexView.as_view()
```

バリデーションまではしてくれないので注意。

