---
title: "【Django】パスコンバータ(URLに含まれた引数)を使って個別ページを表示させる"
date: 2022-09-20T15:55:29+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

[40分Django](/post/startup-django/)を終えた方向け。

投稿したTopicの[編集や削除](/post/django-models-delete-and-edit/)、[Topicに対してコメントの投稿をする時](/post/django-models-foreignkey/)、予め個別ページを作っておく必要がある。

本記事ではパスコンバータを使って個別ページの作り方を解説する

## パスコンバータの仕組み

Djangoにおいて、urls.pyにて定めた`<型:引数名>`は実行するビューにて呼び出しができるようになっている。

### bbs/urls.py

まず、bbsアプリ内のurls.pyにて、このように書き換える

    
    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),

        #               ↓パスコンバータ    
        path("single/<int:pk>/", views.single, name="single"),
    ]


この`"single/<int:pk>/"`は以下のURLの時、`views.single`が実行される。

    single/1/
    single/5/
    single/1000/

一方で、以下のURLでは404として処理される

    single/
    single/aaaaa/
    single/fd04f122-466e-49ba-a4fb-f73e92c9efc2/

つまり、`single/`に続く値が数値であれば、`views.single`が実行される。

今回はこの数値が、引数pkとしてviews.singleに引き渡される


#### 【補足1】使用できるパスコンバータの型は？

今回の例で、数値型のパスコンバータを使用したが、数値型以外にも以下の型が使える。

|型|意味|
|----|----|
|int|0もしくは正の整数にマッチ|
|str|空ではない文字列にマッチ(/は除く)|
|path|空ではない文字列にマッチ(/を含める)|
|slug|半角英数字、ハイフン(-)、アンダーバー(_)のみで構成された文字列にマッチ|
|uuid|UUID型にマッチ|

使用することが多いのは、主キーとして特定する機会のある、int型とuuid型の2つと思う。

### bbs/views.py

続いて、views.singleを作る。下記のようにする。


    class SingleView(View):
    
        #                     ↓urls.pyから受け取った引数
        def get(self, request, pk, *args, **kwargs):
            context = {}

            # pkを使って個別ページに表示するTopicを特定する    
            context["topic"]    = Topic.objects.filter(id=pk).first()
    
            return render(request,"bbs/single.html", context)
    
    single  = SingleView.as_view()


`urls.py`から与えられたpkは、メソッドの引数に入れておく。

pkは個別ページに表示するTopicを特定する際に利用する。`.filter()`を使って絞り込みを行うことができる。

#### 【補足1】.first()って必要？

`.first()`を使用すると、単一のモデルオブジェクトを返すことができる。

`.first()`を使用しない場合、forループを使用しない限り、モデルフィールドを参照することはできない。

例えば、ビューが以下のようになっていた場合、

    context["topics"]    = Topic.objects.filter(id=pk)

テンプレートはこうなる。

    {% for topic in topics %}
    <div class="border">{{ topic.comment }}</div>
    {% endfor %}

一方、`.first()`を使って、単一のモデルオブジェクトを返す場合

    context["topic"]    = Topic.objects.filter(id=pk).first()

テンプレートはこうなる。

    <div class="border">{{ topic.comment }}</div>

テンプレート上でforループを書く必要が無くなるのだ。


#### 【補足2】もし、pkを書かなかった場合はどうなる？

もし、このように書いた場合、

    def get(self, request, *args, **kwargs):

pkはkwargsに含まれる。

    def get(self, request, *args, **kwargs):

        kwargs["pk"]
    
引数が溢れた時、`*args`及び`**kwargs`が受け取るようになっているためである。

詳細は下記記事を読むと良いだろう。

[DjangoやPythonにおける*argsと**kwargsとは何か](/post/django-args-kwargs/)


### templates/bbs/single.html

後は個別ページを作るだけ。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">

            <h1>ここは個別ページです。</h1>

            {# ループせずにそのまま表示できる。 #}
            <div class="border">
                {{ topic.comment }}
            </div>
        </main>

    </body>
    </html>


## 結論

後は、この個別ページに、削除や編集、リプライの投稿などの処理を追加すると良いだろう。

- [Djangoで投稿したデータに対して編集・削除を行う【urls.pyを使用してビューに数値型の引数を与える】](/post/django-models-delete-and-edit/)
- [Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】【ForeignKey】](/post/django-models-foreignkey/)

