---
title: "【Django】Cookieをサーバーサイドで操作する"
date: 2022-01-03T16:32:07+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","Cookie" ]
---

カジュアルなウェブアプリではDBにデータを保存させるよりもCookieに直接保存する場合が多いだろう。

簡易掲示板における名前など、一度入力したデータを再度入力させる場合も、クライアントにとっては使い勝手が悪いので、Cookieをセットして表示させたほうが良い。

サンプルとなるコードはいつもの[40分Django](/post/startup-django)。

## views.pyにてCookieをセット、参照する

testというキー名、値はHelloでCookieをセットする。

ただし、参照はともかく、Cookieのセットはレスポンスオブジェクトに対して行わなければならない。故に、下記のようになる。


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            #キーを指定して値が含まれていれば表示される。
            print( request.COOKIES.get("test") ) 
        
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            #renderの結果をそのまま返さない
            #return render(request,"bbs/index.html",context)

            #レスポンスオブジェクトを作り、その上で.set_cookie()を使い、Cookieを生成する。
            response    = render(request,"bbs/index.html",context)
            response.set_cookie("test","Hello")

            return response
    
    index   = BbsView.as_view()


render()でレスポンスオブジェクトが作られる。それを左辺で受け取り、メソッドを実行してCookieをセットする。この`.set_cookie()`メソッドにはCookieの有効期限とSecure属性をセットできる。

    #dtはdatetime型(※日時型。日付型ではない)。任意の有効期限を指定する。
    response.set_cookie("test", "Hello", expires=dt, secure=True )


## テンプレートにてCookieを確認する

request.COOKIESに保存されているので、後はキーを指定するだけ。先ほどのtestであればこうする。

    {{ request.COOKIES.test }}

値を元に分岐させることもできる。


## 結論

またまた、StackOverflowからの受け売りである。

参照元:https://stackoverflow.com/questions/1622793/django-cookies-how-can-i-set-them

公式にも書かれている。

参照元:https://docs.djangoproject.com/en/4.0/ref/request-response/

