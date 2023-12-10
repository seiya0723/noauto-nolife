---
title: "Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】"
date: 2020-11-11T17:57:49+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け","カスタムテンプレートタグ" ]
---

殆どのプロジェクトで実装必須になるページネーション。

Djangoではdjango.core.paginatorが用意されているので比較的簡単に実装できる。

しかし、単にページネーションを実装しただけでは他のURLパラメーターが保持されない。例えば、検索とページネーションを両立させることはできない。

本記事では他のURLパラメーターを保持した状態で、ページネーションを実装する術を解説する。

## 流れ

1. views.pyを書き換える
1. カスタムテンプレートタグを作成、インストールさせる
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
        
            context = {}
            query   = Q()

            if "search" in request.GET:
    
                #全角スペースを半角スペースに変換、半角スペース区切りで文字列のリストに仕立てる。
                #(ex) 『"Django　教科書 入門"』 → 『"Django 教科書 入門"』 → 『["Django","教科書","入門"]』
                words       = request.GET["search"].replace("　"," ").split(" ")
    
                for word in words:
                    query &= Q(name__contains=word)
    
    
            #TIPS: .order_by()で並び替えしないと、paginatorでWARNINGが出る。
            products    = Product.objects.filter(query).order_by("id")

            #===========ここからページネーション処理================
            paginator   = Paginator(products,4)
    
            # ?page=2 などの指定がある場合、
            if "page" in request.GET:
                context["products"] = paginator.get_page(request.GET["page"])
            else:
                context["products"] = paginator.get_page(1)
    
            return render(request,"shopping/index.html",context)
    
        def post(self, request, *args, **kwargs):

            # 中略 #
                
            return redirect("shopping:index")
       
    index   = ProductView.as_view()


ページネーションをする時は`.order_by()`を明示的に指定してソーティングしていないとWARNINGが出る点に注意。

`Paginator(products,4)`はクエリによって検索されたデータ(`products`)を4個区切りでページネーションにするオブジェクトを返す。つまり1ページにつき4つのレコードが表示される。

続いて、`paginator.get_page()`で指定されたページを表示させる。もし、`request.GET["page"]`の値が数値ではない場合は最初のページを表示させ、マイナス値もしくは最後のページよりも大きい場合は最後のページを返す。だからバリデーションも不要。

他にも似たようなものに、`.page()`メソッドがあるがこちらは不適切な値を入力すると例外処理が発生する。処理時間とコードが長くなるため非推奨。

## 【アンチパターン】普通にページネーションを表示する

まず、普通にページネーションを実装させたらどうなるか、その挙動を確認する。

実践ではこの方法は使い物にならないので、とにかくページネーションを実装させたい場合は、次の項へスキップすると良い。

テンプレート上で、下記を追加する。(クラス名にBootstrapを使用している)

    <ul class="pagination justify-content-center">

        {% if products.has_previous %}
        <li class="page-item"><a class="page-link" href="?page=1">最初のページ</a></li>
        <li class="page-item"><a class="page-link" href="?page={{ products.previous_page_number }}">前のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">最初のページ</a></li>
        <li class="page-item"><a class="page-link">前のページ</a></li>
        {% endif %}

        <li class="page-item"><a class="page-link">{{ products.number }}</a></li>

        {% if products.has_next %}
        <li class="page-item"><a class="page-link" href="?page={{ products.next_page_number }}">次のページ</a></li>
        <li class="page-item"><a class="page-link" href="?page={{ products.paginator.num_pages }}">最後のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">次のページ</a></li>
        <li class="page-item"><a class="page-link">最後のページ</a></li>
        {% endif %}

    </ul>

これで、ページネーションが実装できる。

ただ、検索をした後にページネーションで移動してもらいたい。

検索をした時、 `?search=test`のようにURLにクエリが表示されるが、その状態でページ移動をすると、`?search=test&page=2`の状態ではなく、ただの`?page=2`になってしまうのである。

つまり、検索をした状態でページ移動ができない。

この問題を解消するため、カスタムテンプレートタグを使う。

## 【正攻法】ページネーション用のカスタムテンプレートタグを追加、インストール

前項で説明したとおり、今回は単にページネーションを実装するのではなく、検索のパラメーターも維持した状態でページ移動も行わなければならない。

公式にはURLパラメータを両立させるための機能は用意されていない。故に、テンプレートタグを新たに作り、インストールさせ実装する。

まず、アプリのディレクトリ内に`templatetags`ディレクトリを作る。スペルミスに注意。

    mkdir ./shopping/templatetags/

続いて、`templatetags`に`param_change.py`を作る。中身は下記。

    from django import template
    register = template.Library()
    
    @register.simple_tag()
    def url_replace(request, key, value):
        copied      = request.GET.copy()
        copied[key] = value
        return copied.urlencode()

それから、`settings.py`の`INSTALLED_APPS`に上記のカスタムテンプレートを指定する。`アプリ名.ディレクトリ名.Pythonファイル名`のように指定すればOK

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

これでテンプレート側で`{% load %}``{% url_replace request field vale %}`が使えるようになる。`request`と`field`と`value`はいずれも引数。

### 【補足1】@register.simple_tag()とは何か？

@マークから始まる文言をPythonではデコレータと呼ぶ。このデコレータは、後続に書かれた関数に機能を追加させるためのものだ。

つまり、デコレータである`@register.simple_tag()`は、関数の`def url_replace(request, key, value):`に対して、テンプレートタグとしての機能を追加している。

このデコレータを追加していなければ、Djangoのテンプレート側から、`url_replace`を呼び出すことはできない。

### 【補足2】関数のurl_replaceは何をしているのか。

引数の指定により、次のページ、もしくは前のページのリンクを生成することができる。

受取する引数は3つ。リクエストオブジェクト、クエリストリングで書き換えたいキー、クエリストリングで書き換えたいキーに対応する値。

まず、リクエストオブジェクトからクエリストリングが生成される。?search=test&page=2にアクセスした状態で、下記を実行すると

    print(request.GET.urlencode())

出力されるのはこんな感じ。

    search=test&page=2

クエリストリングの?を除いた形になる。

リクエストオブジェクトから値を取り出すには下記のようにする。

    print(request.GET["search"])

上記を実行すると、下記のように表示される。

    test

いまアクセスしているページが2ページで、次のページのリンクを表示させたい時、生成するクエリストリングは?search=test&page=3である。

故に、リクエストオブジェクトからpageの値を書き換える必要がある。ただし、リクエストオブジェクトはイミュータブルな値。つまり書き換えはできないので、下記はエラーになってしまう。

    #request.GET["page"]    = 3

そのため、リクエストオブジェクトの値を書き換えるには、`.copy()`を実行して書き換え可能な形にする必要がある。

    copied  = request.GET.copy()

その上で、pageの値を書き換える。

    copied["page"]  = 3

ただし、今回の書き換え対象のキーと値は、引数として受け取っているので、

    copied[key]     = value

となる。


### 【補足3】クエリストリング？パラメータ？どっち？

以下はいずれも同じ意味。

- クエリストリング
- クエリ文字列
- URLパラメータ
- パラメータ

そのため、表記ゆれを防ぐため本ブログ内では統一したいところではある。

しかし、あくまでも個人的な解釈ではクエリストリングは全体、パラメータは部分的な物として捉えている。

ちなみに、上記から、?を除いたものをURLエンコード、もしくはパーセントエンコーディングと呼ばれている。これは全くの別物。冒頭に?が付かなければ、リンクとして機能しない。

以下、参考程度に。

- https://e-words.jp/w/URL%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF.html
- https://e-words.jp/w/%E3%82%AF%E3%82%A8%E3%83%AA%E6%96%87%E5%AD%97%E5%88%97.html
- https://e-words.jp/w/URL%E3%82%A8%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%89.html

## テンプレートの修正

先程作ったカスタムテンプレートを使用する。テンプレートファイルの冒頭に下記を追加する。

    {% load param_change %} 

順番は{% load static %}の後で良い。続いて、ページネーション部はこうなる。

    <ul class="pagination justify-content-center">
        {% if products.has_previous %}
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' '1' %}">最初のページ</a></li>
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' products.previous_page_number %}">前のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">最初のページ</a></li>
        <li class="page-item"><a class="page-link">前のページ</a></li>
        {% endif %}
        <li class="page-item"><a class="page-link">{{ products.number }}</a></li>
        {% if products.has_next %}
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' products.next_page_number %}">次のページ</a></li>
        <li class="page-item"><a class="page-link" href="?{% url_replace request 'page' products.paginator.num_pages %}">最後のページ</a></li>
        {% else %}
        <li class="page-item"><a class="page-link">次のページ</a></li>
        <li class="page-item"><a class="page-link">最後のページ</a></li>
        {% endif %}
    </ul>

`products`の中にページネーションの属性が含まれているので有効に利用する。もう少しコード行数を少なく書くこともできるが、今回は見やすさを重視した。

ちなみに、各要素に指定されているクラス名はBootstrap由来。

### 【補足1】{% load static %}と{% load param_change %}はどちらが先に書くべきか？

どちらが先でも問題はない。

ただ、テンプレートの継承を意味する、`{% extends %}`は一番最初に書かなければならない。loadよりも後にextendsを書いてはならない。


    {% extends "common/base.html" %}

    {% load static %}
    {% load param_change %}


## 動作

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-15 12-19-31.png" alt="ページネーション表示"></div>

ちゃんと検索とページ移動を両立できている。

<div class="img-center"><img src="/images/Screenshot from 2020-11-15 12-20-45.png" alt="検索とページ遷移を両立させる"></div>


## 結論

カスタムテンプレートタグはセキュリティの制約上`settings.py`の`INSTALLED_APPS`に指定しない限り、使えない点に注意。

他のパラメータを保持した状態でページ移動ができるので、複雑な絞り込みや検索などが要求される通販サイトの作成に有効。

最初の1ページ目で、パラメータがある場合とない場合で内容重複する問題はmetaタグのcanonicalを指定しておけばSEO的に問題はないと思う。


### どうしてもカスタムテンプレートタグを使いたくない場合は？

カスタムテンプレートタグの実装はアプリ内に新たにディレクトリを作って、`INSTALLED_APPS`まで編集する必要もあり、少々手間がかかる。

更に、カスタムテンプレートタグはサーバーサイドの処理であり、安易に増やしていけば当然サーバーに負荷がかかる。

そこでJavaScriptを使った方法を推奨する。パラメータの書き換えはJSでも再現できる。

[JavaScriptでクエリパラメータを書き換え、GETメソッドを送信する【通販サイトなどの絞り込み検索に有効】](/post/javascript-query-change-and-get-method/)

サーバーの処理の負担を軽減させることができるので、スペックの低いサーバーを使用している場合はこちらが良いだろう。

### 参考文献

いずれも公式のドキュメントに書かれてある。

ページネーション関係

https://docs.djangoproject.com/en/3.1/ref/paginator/

カスタムテンプレートタグ関係

https://docs.djangoproject.com/en/3.1/howto/custom-template-tags/

似たような問題で悩んでいる人は結構いる。

https://stackoverflow.com/questions/2047622/how-to-paginate-django-with-other-get-variables


## ソースコード

下記ソースコードは、簡易掲示板仕様になっているので注意。

- https://github.com/seiya0723/django_search_and_paginator

<!-- 

https://github.com/seiya0723/simple_ecsite

-->
