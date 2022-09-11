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










## ソースコード


https://github.com/seiya0723/django_search


