---
title: "【Django】kwargsを使ってビューを使いまわす【urls.py+views.py】"
date: 2021-09-02T19:20:58+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","ビュー" ]
---

`kwargs`を使うことで似たような処理のビューを使いまわしできる。これによりビューのコード行数を大幅に削減可能。

## 状況


例えば、私のブログのように、記事一覧や記事本文を表示する左側のメインエリア、カテゴリやタグなどを表示するサイドエリア、2つのエリアがあったとする。

つまり、カテゴリやタグなどの情報は常に表示し、URLによってメインエリアの情報を切り替えたい場合、urls.pyはどうなるだろうか？

すぐに思いつくのがこんな感じ。

    from django.urls import path
    from . import views
    
    app_name    = "tube"
    urlpatterns = [ 
        path('news/', views.news, name="news"),
        path('news/<uuid:news_pk>/', views.news_single, name="news_single"),
    ]


記事一覧表示時と記事本文表示時でビューを分割している。一応これでも実現はできるが、サイドエリアのモデルオブジェクトを作成する処理が重複してしまう。

そこで、記事一覧表示時と記事本文表示時を一緒のビューに割り当てる。

    from django.urls import path
    from . import views
    
    app_name    = "tube"
    urlpatterns = [ 
        path('news/', views.news, name="news"),
        path('news/<uuid:news_pk>/', views.news, name="news_single"),
    ]

キーワード引数を指定したURIと指定していないURIが同じビューになっていると、正常に動いてくれないのではないかと思われがちだが、`kwargs`を使えば正常に動いてくれる。


## キーワード引数がある場合と無い場合の両立するビューの作成

キーワード引数がある場合と無い場合で同じビューを呼び出している時、以下のようにgetメソッドにキーワード引数を指定してしまうと、無い場合でエラーが発生する。

    class NewsView(View):
    
        def get(self, request, news_pk, *args, **kwargs):
            
            #==中略===

            return render(request,"tube/news.html",context)

    news    = NewsView.as_view()

そこで、キーワード引数をあえて書かず、`kwargs`に格納するように仕立てる。これである場合と無い場合の両立が可能になる。

    class NewsView(View):
    
        def get(self, request, *args, **kwargs):

            #==サイドエリアのモデルオブジェクト作成==

            if "news_pk" in kwargs:
                print(kwargs["news_pk"])
                #==記事本文表示時の処理==

                return render(request,"tube/news.html",context)

            #==記事一覧表示時の処理==

            return render(request,"tube/news.html",context)

    news    = NewsView.as_view()

型は既に`urls.py`でチェックされて変換されているので、他にバリデーションを行いたい場合はシリアライザクラスでもフォームクラスでも使うと良いだろう。

記事本文表示時はページネーションなどの処理は不要なので、アーリーリターンさせることで、ネストを深くさせないようにしている。

## 結論

ページネーションや検索に関してはこれまで同様クエリストリングで処理をしたほうが良いかも知れない。カスタムテンプレートタグを使用して、ページ以外のパラメータを保持してリンクを作ることができる。


