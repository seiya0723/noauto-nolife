---
title: "【Django】スペース区切りでOR・AND検索を改定する"
date: 2022-04-15T16:42:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","検索" ]
---

以前、紹介した『[Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】](/post/django-or-and-search/)』では少々ビューの見通しが悪い。

また、他の絞り込みなどの機能も考慮した場合、キーワードが無かった場合にリダイレクトをするのはおかしい。

そこで本記事では検索処理の改定を行う。

## views.py

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    from django.db.models import Q
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
            query   = Q()
    
            if "search" in request.GET:
                search      = request.GET["search"]
    
                raw_words   = search.replace("　"," ").split(" ")
                words       = [ w for w in raw_words if w != "" ]
    
                for w in words:
                    query &= Q(comment__contains=w)


            #TODO:ここに追加の絞り込み処理を書く(queryに追加の条件式を加える)
    
            context["topics"]   = Topic.objects.filter(query)
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
                print(form.errors)
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()

[以前の方法](/post/django-or-and-search/)に、リダイレクト処理を除去し、リストの内包表記を加えて、空文字列を除去している。

searchに何か記述されている場合、検索のクエリを追加する。そうでなければ検索のクエリは追加しない。

後続に追加の絞り込み処理(カテゴリ検索、価格帯など)を書けば良いだろう。

## ボツ案

### フォームクラスにスペース区切りのリストを作って返却するメソッドを作る

フォームクラスにスペース区切りのリストを作って返却するメソッドを作る場合、ビューでメソッドを単に呼び出すだけになるので、たしかにシンプルにはなるが、何をやっているのか掴めないので、ボツにした。

    class SearchForm(forms.Form):
    
        search  = forms.CharField()
    
        def search_words(self):
    
            cleaned     = self.clean()
            search      = cleaned.get("search")
            words       = []
    
            if search:
                raw_words   = search.replace("　"," ").split(" ")
                words       = [ w for w in raw_words if w != "" ]
    
            return words
    
バリデーションをした後、`.search_words()`を呼び出してリストを作り、クエリを作る。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm,SearchForm
    
    from django.db.models import Q
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
            query   = Q()
    
            form    = SearchForm(request.GET)
    
            if form.is_valid():
                print("バリデーションOK")
                words   = form.search_words()
    
                for w in words:
                    query &= Q(comment__contains=w)
    
            context["topics"]   = Topic.objects.filter(query)
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
                print(form.errors)
    
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


行数が削減できたが、これではビュー側は何をやっているのかよくわからないかもしれないのでボツにした。トータルで見ると、そこまで行数削減できているわけではない。検索処理を別のビューでも実行するのであれば話は別だが。


### フォームクラスでバリデーション、ビューでスペース区切りのリストを作って返却する

文字列型のバリデーションをしたとしても、それは結局requestボディから抜き取っているのと全く変わらないので、存在確認だけすれば良いと思う。

故に、下記フォームクラスは不要。

    from django import forms
    
    class SearchForm(forms.Form):
    
        search  = forms.CharField()
    
リクエストボディの値は文字列である事はわかりきっているのに、あえてバリデーションをする理由はないのだ。

## 結論

後の絞り込みの機能の実装は下記記事を確認の後実装すると良いだろう。

[JavaScriptでクエリパラメータを書き換え、GETメソッドを送信する【通販サイトなどの絞り込み検索に有効】](/post/javascript-query-change-and-get-method/)

今回の改定によって未入力時にもクエリストリングが変化してしまう(例えば、未入力で検索すると URLの末尾に`?search=`と表示される )ので、上記のようなJSを予め実行してそのようなクエリストリングにしないように仕立てる必要があると思う。

ちなみに、requestオブジェクトはイミュータブル(書き換え不可能)であるため、クエリストリングをDjango側で書き換えする事はできない。リクエストを送信する前にJSで書き換えをする必要があると考えている。



