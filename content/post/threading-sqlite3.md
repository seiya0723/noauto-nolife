---
title: "SQliteはマルチスレッド・マルチプロセスに対応していない"
date: 2024-12-25T14:18:47+09:00
lastmod: 2024-12-25T14:18:47+09:00
draft: false
thumbnail: "images/sqlite.jpg"
categories: [ "インフラ " ]
tags: [ "データベース","tips","アンチパターン","django" ]
---


SQliteはマルチスレッド・マルチプロセスに対応していない。

同時に大量のクエリをさばくことはできない。

## 実際にやってみる

djangoで実際にやってみる。ベースは、[40分django](/post/startup-django/)

```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic
from .forms import TopicForm

import threading

def writing(data):
    form    = TopicForm(data)
    if form.is_valid():
        form.save()

class IndexView(View):

    def get(self, request, *args, **kwargs):
        print(Topic.objects.all().count())

        context = {}
        context["topics"]   = Topic.objects.all()


        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):


        threads = []

        copied  = request.POST.copy()
        for i in range(1000):
            thread = threading.Thread(target=writing, args=(copied,))
            threads.append(thread)
            thread.start()

        # 全てのスレッドが終了するまで待機
        for thread in threads:
            thread.join()

        return redirect("bbs:index")

index   = IndexView.as_view()
```

1回目は正常に1000個分のスレッドを処理しきれるかもしれないが、2回目、3回目と実行していくと、

```
django.db.utils.OperationalError: database is locked
    raise dj_exc_value.with_traceback(traceback) from exc_value
  File "/home/User/.local/lib/python3.10/site-packages/django/db/backends/utils.py", line 105, in _execute
    return self.cursor.execute(sql, params)
  File "/home/User/.local/lib/python3.10/site-packages/django/db/backends/sqlite3/base.py", line 329, in execute
    return super().execute(query, params)
django.db.utils.OperationalError: database is locked
```

このようにロックが発生する。確認をすると、1000件のうち600件ほどしか書き込みできていない。

## 何故か？

表題の通り、通常のSQliteはマルチスレッド・マルチプロセスに対応していないから。

ソース: https://www.sqlite.org/threadsafe.html

マルチスレッドモードもあるが、それは別のデータベースに対して行う場合であり、今回のように同一のデータベースに対して2つ以上のスレッドで読み書きを行うことは安全ではない。

## 対策

SQliteは並列で書き込み処理をすることはできない。

これは、マルチスレッドだけの話ではなく、数百人~数千人が同時にアプリの利用(DB読み書き)をした場合も同様。

もし安全に並列で処理をしたい場合は、

- マルチスレッド・マルチプロセスをやめて、直列で書き込み処理を行う
- PostgreSQLやMySQLなどのマルチスレッド・マルチプロセスの動作を前提としたRDMSを使う
- 更に高速化させるには、Redisなどのキャッシュサーバーを使い、DBの負荷軽減・ボトルネックにならないようにする。

SQLiteを使っている限りは、先のようにマルチスレッドで書き込みをするのではなく、直列で書き込みをする。

```
    def post(self, request, *args, **kwargs):

        for i in range(1000):
            form    = TopicForm(request.POST)
            if form.is_valid():
                form.save()

        return redirect("bbs:index")
```

数百人や数千人の利用が想定される本番環境もSQliteを使わない。PostgreSQLやMySQLを活用する。

また、DB読み込みが高頻度で行われる場合は、Redisなどのキャッシュの活用もする。


