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

## クエリビルダでスペース区切りのキーワード検索をする


    from django.shortcuts import render,redirect
    from django.views import View

    from .models import Category,Product
    
    from django.db.models import Q
    
    class ProductView(View):
    
        def get(self, request, *args, **kwargs):
            
            context = {}


            #クエリを初期化しておく。
            query   = Q()

            if "search" in request.GET:
    
                #(1)キーワードが空欄もしくはスペースのみの場合、ページにリダイレクト
                if request.GET["search"] == "" or request.GET["search"].isspace():
                    return redirect("shopping:index")
    
                #(2)全角スペースを半角スペースに変換、スペース区切りでリストにする。
                words   = request.GET["search"].replace("　"," ").split(" ")
    
                #(3)クエリを追加する
                for word in words:

                    #空欄の場合は次のループへ
                    if word == "":
                        continue

                    #TIPS:AND検索の場合は&を、OR検索の場合は|を使用する。
                    query &= Q(name__contains=word)
    

            #(4)作ったクエリを実行(検索のパラメータがない場合、絞り込みは発動しない。)
            context["data"] = Product.objects.filter(query)
    
            return render(request,"shopping/index.html",context)
    

    index   = ProductView.as_view()


まず(1)。キーワードが空欄もしくはスペースのみの場合、リダイレクトさせる。この処理は無くても検索上は問題ないが、同じ検索結果でURLが違うという状況に至るためにやっておく。

続いて、(2)。全角スペースを半角スペースとして扱い、半角スペースで区切り、リスト化させる。

(3)ではリスト化した上でループ処理。Qを使用してクエリを作る。OR検索がしたい場合は下記に書き換え。
    
    query |= Q(name__contains=word)
    
もっとも、スペース込みの検索は基本的にAND検索なので、今回は&を使用した。

最後に(4)で作ったクエリを実行する。.filter()メソッドでOK


### 【補足1】更に詳細な検索を行いたい場合はこうする

フォームを使ってバリデーションを行う。

    from django.shortcuts import render,redirect
    from django.views import View

    from .models import Category,Product

    #商品のカテゴリ検索用フォーム(Productモデルを使ったフォーム)
    from .forms import ProductCategoryForm

    
    from django.db.models import Q
    
    class ProductView(View):
    
        def get(self, request, *args, **kwargs):
            
            context = {}


            #クエリを初期化しておく。
            query   = Q()


            #カテゴリ検索も同時に行う場合、事前にバリデーションを通す
            form    = ProductCategoryForm(request.GET)

            if form.is_valid():
                cleaned = form.clean()
                
                #バリデーションした結果をクエリに追加させる
                query &= Q(category=cleaned["category"])


            if "search" in request.GET:
    
                #(1)キーワードが空欄もしくはスペースのみの場合、ページにリダイレクト
                if request.GET["search"] == "" or request.GET["search"].isspace():
                    return redirect("shopping:index")
    
                #(2)全角スペースを半角スペースに変換、スペース区切りでリストにする。
                words   = request.GET["search"].replace("　"," ").split(" ")
    
                #(3)クエリを追加する
                for word in words:

                    #空欄の場合は次のループへ
                    if word == "":
                        continue

                    #TIPS:AND検索の場合は&を、OR検索の場合は|を使用する。
                    query &= Q(name__contains=word)



            #(4)作ったクエリを実行(検索のパラメータがない場合、絞り込みは発動しない。)
            context["data"] = Product.objects.filter(query)
    
            return render(request,"shopping/index.html",context)
    
    index   = ProductView.as_view()


これで、カテゴリ検索と商品名の検索を同時に行う事ができる。

指定したカテゴリであり、なおかつスペース区切りで指定した文字列を含む商品名を検索する事ができる。


## 結論

ちなみに、実行されるクエリを確認したいのであれば

    print(Product.objects.filter(query).query)

このように`.query`を末尾に追加して、print文で表示される。詳しくは下記を参照。

[【Django】実行されるクエリを確認する【.query】](/post/django-models-query/)


## 参考文献

- https://docs.djangoproject.com/en/3.1/ref/models/querysets/#query-related-tools
- https://docs.djangoproject.com/en/3.1/topics/db/queries/#complex-lookups-with-q


