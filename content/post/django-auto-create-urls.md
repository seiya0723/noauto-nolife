---
title: "【Django】views.pyからurls.pyを自動的に作る【コマンド1発で生成】"
date: 2023-12-09T18:01:14+09:00
lastmod: 2023-12-09T18:01:14+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","作業効率化" ]
---

views.pyからurls.pyを作る。

URL引数(パスコンバーター)にも対応させる。

これまでと同様、コードは追記する形式ではあるが、実行は自己責任で。

- [【Django】models.pyとforms.pyからviews.pyを自動的に作る【コマンド1発で生成】](/post/django-auto-create-views/)
- [【Django】models.pyからforms.py及びadmin.pyを自動的に作る【コマンド1発で生成】](/post/django-auto-create-models-forms-admin/)



## 注意

- Viewを継承したビュークラスで、`.as_view()` をviews.py内で実行している場合に限る
- LoginRequiredMixinなどを多重継承していても対応できる
- `**kwargs`などに含まれる引数までは対応していない
- ビュー関数には対応していない
- TemplateViewなど汎用ビュークラスを継承している場合にも対応していない。
- ビューとは関係のない関数がviews.py内に作られている場合、その引数がURL引数に含まれる。

## ソースコード


```
import glob, re, sys

## 引数の指定がある場合: 特定のアプリのviews.pyに対して実行する。
## 引数の指定が無い場合: プロジェクトの全アプリのviews.pyに対して実行する。

if len(sys.argv) > 1:
    views_paths     = glob.glob(f"./{sys.argv[1]}/views.py")
else:
    views_paths     = glob.glob("./*/views.py")


urls_paths          = [ views_path.replace("views", "urls") for views_path in views_paths ]

# views.pyを順次読み込み
for views_path,urls_path in zip(views_paths,urls_paths):

    # アプリ名を取得しておく。
    app_name        = views_path.replace("./","").replace("/views.py","")


    #====views.pyの冒頭===========================
    urls_code       = [ "\n# == This code was created by https://noauto-nolife.com/post/django-auto-create-urls/ == #\n"]

    urls_code.append(f'from django.urls import path')
    urls_code.append(f'from . import views')
    urls_code.append(f'')
    urls_code.append(f'app_name    = "{app_name}"')


    #====views.pyの冒頭===========================



    #====urls.pyの本体===========================

    urls_code.append(f'urlpatterns = [')

    # IndexViewはトップページにセット。
    urls_code.append(f'    path("", views.index, name="index"),')

    # views.pyから .as_view() 化した変数を取り出す。この方法では、URL引数まで対応していない。
    """
    with open(views_path, "r") as mf:

        views_code      = mf.read()
        views_names     = re.findall(r'(\w+)\s*=.*\.as_view\(\)', views_code)

        for views_name in views_names:
            # indexは除外
            if views_name != "index":
                urls_code.append(f'    path("{views_name}/", views.{views_name}, name="{views_name}"),')
    """

    # URL引数への対応

    with open(views_path, "r") as mf:

        # models.pyをリストで読みこみ
        views_codes     = mf.readlines()
        name_and_attrs  = []

        # [ { "name": "index", "attrs": [ "pk","aaa","bbb" ] }, ]

        dic     = {}
        attrs   = []

        for views_code in views_codes:

            # as_view() を取得する
            views_name  = re.search(r'(\w+)\s*=.*\.as_view\(\)', views_code)

            if views_name:
                #print(views_name.group(1))

                dic["name"]     = views_name.group(1)

                # 重複する引数は除去する。(一度辞書型に変換し、再びリストに戻す。順番を維持した状態で重複を除外できる。)
                dic["attrs"]    = list(dict.fromkeys(attrs))

                name_and_attrs.append(dic)

                dic     = {}
                attrs   = []


            # ビュークラスのメソッドを取得する(メソッドからURL引数を取得する。)
            method_attr  = re.search(r'\s*def \w.*\((\w.*)\):', views_code)

            if method_attr:
                #print( method_attr.group(1) )

                # URL引数を取得
                attr    = method_attr.group(1).replace(" ","").replace("self","").replace("request","").replace("*args","").replace("**kwargs","").replace(","," ")
                attr    = attr.strip()
                attr    = re.sub("\s+"," ", attr)
                attr    = [ a for a in attr.split(" ") if a != "" ]

                attrs += attr


    # pathの追加(URL引数の型はintに限定。)
    for name_and_attr in name_and_attrs:
        name    = name_and_attr["name"]
        url     = name + "/"

        # indexはすでに記録されているので除外
        if name == "index":
            continue

        for a in name_and_attr["attrs"]:
            url += f"<int:{a}>/"

        urls_code.append(f'    path("{url}", views.{name}, name="{name}"),')


    urls_code.append(f']')

    #====urls.pyの本体===========================

    for code in urls_code:
        print(code)


    #====対応するurls.pyへ保存===================

    # 書き込みするコード
    with open(urls_path, "a") as ff:
        for code in urls_code:
            ff.write(code + "\n")

    #====対応するurls.pyへ保存===================

```

## 動かすとこうなる


accounts finance home アプリにそれぞれ実行させてみた。

```

# == This code was created by https://noauto-nolife.com/post/django-auto-create-urls/ == #

from django.urls import path
from . import views

app_name    = "accounts"
urlpatterns = [
    path("", views.index, name="index"),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("password_change/", views.password_change, name="password_change"),
    path("password_change_done/", views.password_change_done, name="password_change_done"),
    path("password_reset/", views.password_reset, name="password_reset"),
    path("password_reset_done/", views.password_reset_done, name="password_reset_done"),
    path("password_reset_confirm/", views.password_reset_confirm, name="password_reset_confirm"),
    path("password_reset_complete/", views.password_reset_complete, name="password_reset_complete"),
]

# == This code was created by https://noauto-nolife.com/post/django-auto-create-urls/ == #

from django.urls import path
from . import views

app_name    = "finance"
urlpatterns = [
    path("", views.index, name="index"),
    path("category/", views.category, name="category"),
    path("category_update/<int:pk>/", views.category_update, name="category_update"),
    path("category_delete/<int:pk>/", views.category_delete, name="category_delete"),
    path("balance_update/<int:pk>/", views.balance_update, name="balance_update"),
    path("balance_delete/<int:pk>/", views.balance_delete, name="balance_delete"),
    path("memo_category/", views.memo_category, name="memo_category"),
    path("memo_category_update/<int:pk>/", views.memo_category_update, name="memo_category_update"),
    path("memo_category_delete/<int:pk>/", views.memo_category_delete, name="memo_category_delete"),
    path("memo/", views.memo, name="memo"),
    path("memo_update/<int:pk>/", views.memo_update, name="memo_update"),
    path("memo_delete/<int:pk>/", views.memo_delete, name="memo_delete"),
]

# == This code was created by https://noauto-nolife.com/post/django-auto-create-urls/ == #

from django.urls import path
from . import views

app_name    = "home"
urlpatterns = [
    path("", views.index, name="index"),
]
```

きちんとビューを書いていれば、ほぼほぼ実用に耐えられるレベルである。

前作同様、引数指定で単一のアプリのみurls.pyを作れる。


## 結論

URL引数まで考慮して作っているので、大抵のURLパターンには対応できると思う。

これまでの自動生成ツールに比べると、とても使い物になると思っている。

ビューが長いとurls.pyでさえ書くのに時間がかかってしまう。この自動化ツールもしっかり活用していきたいところだ。



