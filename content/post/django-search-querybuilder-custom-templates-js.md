---
title: "Djangoでクエリビルダを使い、スペース区切りの文字列検索と絞り込みを同時に行う【JSとカスタムテンプレートタグを使用】"
date: 2022-09-11T14:21:37+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django" ]
---


カスタムテンプレートタグはJavaScriptにとって変えることもできるが、今回はあらゆる状況を考慮し、両方使用した。

## ビュー

```
from django.shortcuts import render
from django.views import View

from django.db.models import Q


from .models import Category,Product
from .forms import CategorySearchForm,ProductMaxPriceForm,ProductMinPriceForm


class IndexView(View):

    def get(self, request, *args, **kwargs):

        context = {}
        query   = Q()

        context["categories"]   = Category.objects.order_by("-dt")

        #検索キーワードあり
        if "search" in request.GET:
            search      = request.GET["search"]

            raw_words   = search.replace("　"," ").split(" ")
            words       = [ w for w in raw_words if w != "" ]

            for w in words:
                query &= Q(name__contains=w)

        
        #カテゴリ検索ありの時、queryに追加する。
        form    = CategorySearchForm(request.GET)

        if form.is_valid():
            cleaned     = form.clean()

            query &= Q(category=cleaned["category"].id)


        #金額の上限
        form        = ProductMaxPriceForm(request.GET)
        if form.is_valid():
            cleaned = form.clean()
            query &= Q(price__lte=cleaned["max_price"])


        #金額の下限
        form        = ProductMinPriceForm(request.GET)
        if form.is_valid():
            cleaned = form.clean()
            query &= Q(price__gte=cleaned["min_price"])

        context["products"]     = Product.objects.filter(query).order_by("-dt")

        return render(request,"shop/index.html",context)

index   = IndexView.as_view()
```

[1対多のリレーション](/post/django-models-foreignkey/)を組んだモデルの検索をする場合、予めフォームクラスを作った上で、バリデーションを行い検索を行う必要がある。


    from django import forms 
    from .models import Topic
    
    class CategorySearchForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "category" ]
    


## テンプレート

    {% load static %}
    {% load param_change %}
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
        <script src="{% static 'shop/js/index.js' %}"></script>
    </head>
    <body>
    
        <h1 class="bg-primary">
            <a class="text-white" href="{% url 'shop:index' %}">通販サイト</a>
        </h1>
    
        <main class="container">
            
            <h2>検索</h2>
            
            {# TODO:ここで検索をする時、JavaScriptを使って、パラメータを両立させる #}
            <form action="">
                <select name="category">
                    <option value="">カテゴリ</option>
                    {% for category in categories %}
                    <option value="{{ category.id }}">{{ category.name }}</option>
                    {% endfor %}
                </select>
                <input type="text" name="search" placeholder="商品名">
    
                {# TODO:先に価格帯を選ぶと、検索後に価格帯の指定が無くなる #}
                {# <input type="submit" value="検索"> #}
                <input id="search" type="button" value="検索">
            </form>
    
            <h2>価格帯</h2>
    
            <div>
                <a class="btn btn{% if request.GET.min_price != '500'   %}-outline{% endif %}-primary" href="?{% url_replace request 'min_price' 500   %}">500~</a>
                <a class="btn btn{% if request.GET.min_price != '1000'  %}-outline{% endif %}-primary" href="?{% url_replace request 'min_price' 1000  %}">1000~</a>
                <a class="btn btn{% if request.GET.min_price != '5000'  %}-outline{% endif %}-primary" href="?{% url_replace request 'min_price' 5000  %}">5000~</a>
                <a class="btn btn{% if request.GET.min_price != '10000' %}-outline{% endif %}-primary" href="?{% url_replace request 'min_price' 10000 %}">10000~</a>
                <a class="btn btn{% if request.GET.min_price != '50000' %}-outline{% endif %}-primary" href="?{% url_replace request 'min_price' 50000 %}">50000~</a>
            </div>
            <div>
                <a class="btn btn{% if request.GET.max_price != '500'   %}-outline{% endif %}-primary" href="?{% url_replace request 'max_price' 500   %}">~500</a>
                <a class="btn btn{% if request.GET.max_price != '1000'  %}-outline{% endif %}-primary" href="?{% url_replace request 'max_price' 1000  %}">~1000</a>
                <a class="btn btn{% if request.GET.max_price != '5000'  %}-outline{% endif %}-primary" href="?{% url_replace request 'max_price' 5000  %}">~5000</a>
                <a class="btn btn{% if request.GET.max_price != '10000' %}-outline{% endif %}-primary" href="?{% url_replace request 'max_price' 10000 %}">~10000</a>
                <a class="btn btn{% if request.GET.max_price != '50000' %}-outline{% endif %}-primary" href="?{% url_replace request 'max_price' 50000 %}">~50000</a>
            </div>
    
            <div class="row">
                {% for product in products %}
                <div class="col-sm-3 border">
                    <div>{{ product.category.name }}</div>
                    <div>発売日:{{ product.release }}</div>
                    <div>{{ product.name }}</div>
                    <div>{{ product.price }}円</div>
                    <div class="text-center">
                        <input class="btn btn-outline-primary" type="button" value="カートに入れる">
                    </div>
                </div>
                {% endfor %}
            </div>
        </main>
    </body>
    </html>


## カスタムテンプレートタグ

    from django import template
    
    register = template.Library()
    
    
    #リクエストオブジェクトのキーを指定し値を書き換える。
    @register.simple_tag()
    def url_replace(request, key, value):
        #ここでリクエストのボディをコピー(辞書型で複製する)
        copied          = request.GET.copy()
    
        #{"order_by":"","search":"商品","page":"1"}
    
        #keyの値をvalueに書き換える(keyが"page"、valueが"2"の場合)
        copied[key]     = value
    
        #{"order_by":"","search":"商品","page":"2"}
    
        return copied.urlencode()
        
        # order_by=&search=商品&page=2


## ソースコード


https://github.com/seiya0723/django_search


