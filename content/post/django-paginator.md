---
title: "Djangoでページネーションを実装する方法【django.core.paginator】"
date: 2020-11-11T17:57:49+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "django","tips","初心者向け" ]
---


殆どのプロジェクトで実装必須になるページネーション。

Djangoではdjango.core.paginatorが用意されているので比較的簡単に実装できる。しかし、単にページネーションを実装しただけでは他のURLパラメーターが保持されないので、例えば検索とページネーションを両立させることはできない。

本記事では他のURLパラメーターを保持した状態でページネーションを実装する術を解説する。

## 流れ

1. views.pyを書き換える
1. カスタムテンプレートタグを追加、インストールさせる
1. テンプレートの修正


## views.pyを書き換える

まず、クエリを実行した後に得られるデータを、django.core.paginatorでページネーション化させる。

    from django.shortcuts import render,redirect
    from django.views import View
    from .models import Category,Product
    
    from django.db.models import Q
    
    from django.core.paginator import Paginator 
    
    class ProductView(View):
    
        def get(self, request, *args, **kwargs):
        
            search_word = ""
    
            if "search" in request.GET:
    
                if request.GET["search"] == "" or request.GET["search"].isspace():
                    return redirect("shopping:index")
    
                search      = request.GET["search"].replace("　"," ")
                search_list = search.split(" ")
    
                query       = Q() 
                for word in search_list:
                    query &= Q(name__contains=word)
    
                #.order_byメソッドで並び替えしないと、paginatorでWARNINGが出る。
                data        = Product.objects.filter(query).order_by("id")
                search_word = search
            else:
                data    = Product.objects.all().order_by("id")
    
    
            #===========ここからページネーション処理================
            paginator   = Paginator(data,4)
    
            if "page" in request.GET:
                data    = paginator.get_page(request.GET["page"])
            else:
                data    = paginator.get_page(1)
    
    
            context = { "data":data }
    
            return render(request,"shopping/index.html",context)
    
        def post(self, request, *args, **kwargs):
                
            return redirect("shopping:index")
       
    index   = ProductView.as_view()


ページネーションをする時は`.order_by()`を明示的に指定してソーティングしていないとWARNINGが出る点に注意。

`Paginator(data,4)`はクエリによって検索されたデータ(`data`)を4個区切りでページネーションにするオブジェクトを返す。つまり1ページにつき4つのレコードが表示される。

続いて、`paginator.get_page()`で指定されたページを表示させる。もし、`request.GET["page"]`の値が数値ではない場合は最初のページを表示させ、マイナス値もしくは最後のページよりも大きい場合は最後のページを返す。だからバリデーションも不要。

他にも似たようなものに、`.page()`メソッドがあるがこちらは不適切な値を入力すると例外処理が発生する。処理時間とコードが長くなるため非推奨。

## カスタムテンプレートタグを追加、インストールさせる

今回は単にページネーションを実装するのではなく、検索のパラメーターも維持した状態でページ移動も行わなければならない。公式にはURLパラメータを両立させるための機能は用意されていない。故に、テンプレートタグを新たに作り、インストールさせ実装する。

まず、アプリのディレクトリ内に`templatetags`ディレクトリを作る。スペルミスに注意。

    mkdir ./shopping/templatetags/

続いて、`templatetags`に`param_change.py`を作る。中身は下記。

    from django import template
    
    register = template.Library()
    
    @register.simple_tag()
    def url_replace(request, field, value):
        dict_           = request.GET.copy()
        dict_[field]    = value
        return dict_.urlencode()
    

それから、`settings.py`の`INSTALLED_APPS`に上記のカスタムテンプレートを指定する。

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'shopping.apps.ShoppingConfig',
        'shopping.templatetags.param_change',
    ]

これでテンプレート側で`{% url_replace request field vale %}`が使えるようになる。`request`と`field`と`value`はいずれも引数。

## テンプレートの修正

先程作ったカスタムテンプレートを使用する。テンプレートファイルの冒頭に下記を追加する。

    {% load param_change %} 

順番は{% load static %}の後で良い。続いて、ページネーション部はこうなる。

    <ul class="pagination justify-content-center">
        {% if data.has_previous %}
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' '1' %}">最初のページ</a></li>
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' data.previous_page_number %}">前のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">最初のページ</a></li>
        <li class="page-item"><a class="page-link">前のページ</a></li>
        {% endif %}
        <li class="page-item"><a class="page-link">{{ data.number }}</a></li>
        {% if data.has_next %}
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' data.next_page_number %}">次のページ</a></li>
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' data.paginator.num_pages %}">最後のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">次のページ</a></li>
        <li class="page-item"><a class="page-link">最後のページ</a></li>
        {% endif %}
    </ul>

`data`の中にページネーションの属性が含まれているので有効に利用する。もう少しコード行数を少なく書くこともできるが、今回は見やすさを重視した。

ちなみに、各要素に指定されているクラス名はBootstrap由来。

## 動作

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-15 12-19-31.png" alt="ページネーション表示"></div>

ちゃんと検索とページ移動を両立できている。

<div class="img-center"><img src="/images/Screenshot from 2020-11-15 12-20-45.png" alt="検索とページ遷移を両立させる"></div>


## 結論

カスタムテンプレートタグはセキュリティの制約上`settings.py`の`INSTALLED_APPS`に指定しない限り、使えない点に注意。

他のパラメータを保持した状態でページ移動ができるので、複雑な絞り込みや検索などが要求される通販サイトの作成に有効。

最初の1ページ目で、パラメータがある場合とない場合で内容重複する問題はmetaタグのcanonicalを指定しておけばSEO的に問題はないと思う。それか、`.copy()`を使用してリクエストをコピーした後、パラメータを追加して返却するぐらいでしょう。

## 参考文献

いずれも公式のドキュメントに書かれてある。

ページネーション関係

https://docs.djangoproject.com/en/3.1/ref/paginator/

カスタムテンプレートタグ関係

https://docs.djangoproject.com/en/3.1/howto/custom-template-tags/

似たような問題で悩んでいる人は結構いる。

https://stackoverflow.com/questions/2047622/how-to-paginate-django-with-other-get-variables

## ソースコード


