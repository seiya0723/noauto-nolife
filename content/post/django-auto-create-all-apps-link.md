---
title: "【Django】各アプリのトップページとアプリ名をまとめてレンダリングする【apps.pyとurls.pyを操作】"
date: 2023-12-07T10:32:45+09:00
lastmod: 2023-12-07T10:32:45+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","作業効率化" ]
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

各アプリの名前を取り出すため、apps.pyを呼び出す。

apps.pyの`name` と urls.pyの`app_name`の一致を利用して、reverse。

リンクと名前の辞書型を、リストにアペンド。URLとアプリ名をレンダリングする。


```
from django.shortcuts import render
from django.views import View

from django.apps import apps
from django.urls import reverse

class IndexView(View):
    def get(self, request, *args, **kwargs):

        context = {}

        # 全てのアプリのapps.pyを呼び出す。
        apps_configs    = apps.get_app_configs()

        links   = []
        for apps_config in apps_configs:
            # name="index"があることを前提として実行しているので、念の為にtry文で実行する。
            try:
                dic             = {}

                # TIPS: ここで reverse_lazy() だと、try文が終わった後に例外(存在しないURL名)が発動してしまう。
                dic["url"]      = reverse(f"{apps_config.name}:index")
                dic["name"]     = apps_config.verbose_name

                links.append(dic)
            except:
                continue

        context["links"]    = links

        return render(request, "home/index.html", context)

index   = IndexView.as_view()
```

重要なのは、URL逆引きのセオリーである`reverse_lazy`ではなく、`reverse`を使うこと。

`reverse_lazy`だと、その逆引き(解決)が実行されるのはtry文を抜けた後。

存在しないURL名を指定してしまったとき、try文の外で例外が発生してしまう。

故に、今回は`reverse`を使用した。


### apps.pyとurls.py

冒頭の前提を守ったコードがこちら。

例えば、homeアプリであれば、apps.pyはこちら。

```
from django.apps import AppConfig


class HomeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'home'

    verbose_name = "エントランス"
```

続いて、urls.pyはこうなる。

```
from django.urls import path
from . import views

app_name    = "home"
urlpatterns = [
    path("", views.index, name="index"),
]
```




### 動かすとこうなる。

homeアプリの名前とリンクが表示されている。

<div class="img-center"><img src="/images/Screenshot from 2023-12-09 10-29-06.png" alt=""></div>

出雲はサーバーの名前、FinanceManagerは別のアプリ。


## 結論

プライベート用のWEBアプリをいくらか作ることがあるので作った。

社内ポータルサイト作る際にも有効かと思われる。



