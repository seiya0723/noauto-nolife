---
title: "【Django】各アプリのトップページとアプリ名をまとめてレンダリングする【apps.pyとurls.pyを操作】"
date: 2023-12-07T10:32:45+09:00
lastmod: 2023-12-07T10:32:45+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---


1つのDjangoプロジェクトに複数のアプリを作り、各アプリのリンクをまとめて表示する。

新しいアプリが追加されるたび、そのリンクをテンプレートにて手動で追記しているようではとても手間だ。整合性も取れなくなるだろう。

だから、全てのアプリのトップページのリンクと、アプリ名をまとめて生成。contextに入れ、レンダリングする。

そういう処理を作る。

## 前提

このコードを実装する前に、以下前提を守る必要がある。

- 各アプリのurls.pyの`app_name`に、apps.pyの`name`と同じ値を与えておく。
- 各アプリのurls.pyにて、トップページのnameには`index`を指定しておく。
- 各アプリのapps.pyに`verbose_name`を指定している。


## 構造

下記図のように`home`アプリから、全てのアプリに遷移できるようにする。

<div class="img-center"><img src="/images/Screenshot from 2023-12-05 16-07-30.png" alt=""></div>

homeアプリは、各アプリのURLを自動的に取れるようにしておくのが今回の目的。

## views.py

各アプリのリンクを取り出すため、urls.pyを呼び出す。

各アプリの名前を取り出すため、apps.pyを呼び出す。

apps.pyの`name` と urls.pyの`app_name`の一致を確認し、リストにアペンド。URLとアプリ名をレンダリングする。


```
from django.shortcuts import render
from django.views import View

from django.apps import apps
from config import urls

from django.urls import reverse

class IndexView(View):
    def get(self, request, *args, **kwargs):

        context = {}

        # 全てのアプリのurls.pyを呼び出す。
        patterns        = urls.urlpatterns

        # 全てのアプリのapps.pyを呼び出す。
        apps_configs    = apps.get_app_configs()

        links   = []

        # urls.pyのapp_name と apps.pyのnameの一致を確認する。
        for pattern in patterns:
            for apps_config in apps_configs:

                # app_nameの指定がない場合はNoneになるので問題はない。
                if pattern.app_name == apps_config.name:

                    # name="index"があることを前提として実行しているので、念の為にtry文で実行する。
                    try:
                        dic             = {}
                        dic["url"]      = reverse(f"{apps_config.name}:index")
                        dic["name"]     = apps_config.verbose_name

                        links.append(dic)

                        #print(apps_config.name)
                        #print(apps_config.verbose_name)

                        break
                    except:
                        continue

        context["links"]    = links

        return render(request, "home/index.html", context)

index   = IndexView.as_view()
```




