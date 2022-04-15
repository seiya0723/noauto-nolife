---
title: "【Django】スペース区切りでOR・AND検索を改定する【forms.py】"
date: 2022-04-15T16:42:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","検索" ]
---


以前、紹介した『[Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】](/post/django-or-and-search/)』では少々ビューの見通しが悪い。

また、他の絞り込みなどの機能も考慮した場合、キーワードが無かった場合にリダイレクトをするのはおかしい。

そこで本記事では検索処理の改定を行う。


## forms.py

    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]
    
    
    class SearchForm(forms.Form):
    
        search  = forms.CharField()
    

重要なのは、検索時のフォームクラスとして、モデルを使用したフォームクラスにしないこと。

もし、`SearchForm`を作る時、`Topic`を使って下記のようにした場合、

    class SearchForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]

送信時の`name`属性は`comment`でなければバリデーションはOKにならないし、モデルに記述した`comment`の`max_length`を引き継いでいるので、`max_length`以上の検索キーワードを指定する事はできない。

そのため、あえてモデルを使用しないフォームクラスを作った。フィールドも`search`と検索にふさわしい`name`属性が指定できるようにした。


## views.py

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
                cleaned     = form.clean()
    
                raw_words   = cleaned["search"].replace("　"," ").split(" ")
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

バリデーションOKになった場合(searchに何か記述されている場合)、検索のクエリを追加する。そうでなければ検索のクエリは追加しない。

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



    

