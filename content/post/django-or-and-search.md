---
title: "Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】"
date: 2020-11-11T17:56:10+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---

普通、検索エンジンで検索する時、こう検索するであろう。

    Django UUIDFields 使い方

Djangoのモデルオブジェクトで検索しようとすると、こうなる。

    Model.objects.filter(title__contains="Django UUIDFields 使い方")

これでは検索結果が出てこない。検索時にスペースも文字列の1つとして考えるからだ(『Django UUIDFields 使い方』を含むタイトルを表示)

そこで、スペース区切りのキーワード検索をするときは、Qクラスを使用する。

## 結論

結論から言うと、コード(`views.py`)はこうなる。

    from django.shortcuts import render,redirect
    from django.views import View
    from .models import Category,Product
    
    from django.db.models import Q
    
    class ProductView(View):
    
        def get(self, request, *args, **kwargs):
            
            if "search" in request.GET:
    
                #(1)キーワードが空欄もしくはスペースのみの場合、ページにリダイレクト
                if request.GET["search"] == "" or request.GET["search"].isspace():
                    return redirect("shopping:index")
    
                #(2)キーワードをリスト化させる(複数指定の場合に対応させるため)
                search      = request.GET["search"].replace("　"," ")
                search_list = search.split(" ")
    
                #(3)クエリを作る
                query       = Q()
                for word in search_list:

                    #空欄の場合は次のループへ
                    if word == "":
                        continue

                    #TIPS:AND検索の場合は&を、OR検索の場合は|を使用する。
                    query &= Q(name__contains=word)
    
                #(4)作ったクエリを実行
                data    = Product.objects.filter(query)
            else:
                data    = Product.objects.all()
    
            context = { "data":data }
    
            return render(request,"shopping/index.html",context)
    
        def post(self, request, *args, **kwargs):
            
            return redirect("shopping:index")
       
    index   = ProductView.as_view()


まず(1)。キーワードが空欄もしくはスペースのみの場合、リダイレクトさせる。この処理は無くても検索上は問題ないが、同じ検索結果でURLが違うという状況に至るため、

続いて、(2)。全角スペースを半角スペースとして扱い、半角スペースで区切り、リスト化させる。

(3)ではリスト化した上でループ処理。Qを使用してクエリを作る。OR検索がしたい場合は下記に書き換え。
    
    query |= Q(name__contains=word)
    
もっとも、スペース込みの検索は基本的にAND検索なので、今回は&を使用した。

最後に(4)で作ったクエリを実行する。.filter()メソッドでOK

## 参考文献

https://docs.djangoproject.com/en/3.1/ref/models/querysets/#query-related-tools

https://docs.djangoproject.com/en/3.1/topics/db/queries/#complex-lookups-with-q

## ソースコード

https://github.com/seiya0723/simple_ecsite
