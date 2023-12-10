---
title: "【Django】カスタムテンプレートタグを実装させずにページネーションと検索を両立させる【Paginator】"
date: 2023-12-08T17:13:10+09:00
lastmod: 2023-12-08T17:13:10+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","アンチパターン","上級者向け","作業効率化" ]
---

以前の[ページネーションを実装する方法(他パラメータとの両立)](/post/django-paginator/)は、実装に手間がかかる。

- views.pyでPaginatorのオブジェクトを作り
- bbs/templatetags/param_change.py を作り
- ↑をsettings.pyに登録
- ↑をテンプレートで呼び出し、カスタムテンプレートタグを実行

たかが、検索とページネーションを両立させるためだけに、3工程も4工程もかかってしまう。

もっとシンプルにできないかと模索し、カスタムテンプレートタグの処理をビューで行うことにした。


## ビューにカスタムテンプレートタグの処理を書いておく

すでにあるメソッド名と重複しないように、別の属性を付与することにした。


```
from django.shortcuts import render,redirect

from django.views import View
from django.db.models import Q
from django.core.paginator import Paginator 

from .models import Topic
from .forms import TopicForm

class IndexView(View):

    def get(self, request, *args, **kwargs):
        context = {}
        query   = Q()

        if "search" in request.GET:
            raw_words   = request.GET["search"].replace("　"," ").split(" ")
            words       = [ w for w in raw_words if w != "" ]

            for word in words:
                query &= Q(comment__icontains=word)

        topics      = Topic.objects.filter(query).order_by("id")
        paginator   = Paginator(topics,4)

        if "page" in request.GET:
            topics  = paginator.get_page(request.GET["page"])
        else:
            topics  = paginator.get_page(1)

        #TODO: ここでpageの値を考慮したurlencodeを、属性として加える。
        copied  = request.GET.copy()

        if topics.has_previous():
            copied["page"]                      = topics.previous_page_number()
            topics.previous_page_link           = "?" + copied.urlencode()

            copied["page"]                      = 1
            topics.first_page_link              = "?" + copied.urlencode()

        if topics.has_next():
            copied["page"]                      = topics.next_page_number()
            topics.next_page_link               = "?" + copied.urlencode()

            copied["page"]                      = topics.paginator.num_pages
            topics.end_page_link                = "?" + copied.urlencode()


        context["topics"]   = topics


        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        form    = TopicForm(request.POST)

        if form.is_valid():
            form.save()
        else:
            print(form.errors)

        return redirect("bbs:index")

index   = IndexView.as_view()
```

- `topics.previous_page_link` : 前のページのリンク
- `topics.first_page_link` : 最初のページのリンク
- `topics.next_page_link` : 次のページのリンク
- `topics.end_page_link` : 最後のページのリンク

そしてこれをテンプレートで呼び出す。

```
{# カスタムテンプレートタグ不使用 #}

<ul class="pagination justify-content-center">
    {% if topics.has_previous %}
    <li class="page-item"><a class="page-link" href="{{ topics.first_page_link }}">最初のページ</a></li>
    <li class="page-item"><a class="page-link" href="{{ topics.previous_page_link }}">前のページ</a></li>
    {% else %}
    <li class="page-item"><a class="page-link">最初のページ</a></li>
    <li class="page-item"><a class="page-link">前のページ</a></li>
    {% endif %}
    <li class="page-item"><a class="page-link">{{ topics.number }}</a></li>
    {% if topics.has_next %}
    <li class="page-item"><a class="page-link" href="{{ topics.next_page_link }}">次のページ</a></li>
    <li class="page-item"><a class="page-link" href="{{ topics.end_page_link }}">最後のページ</a></li>
    {% else %}
    <li class="page-item"><a class="page-link">次のページ</a></li>
    <li class="page-item"><a class="page-link">最後のページ</a></li>
    {% endif %}
</ul>
```

これなら、ページネーションを実装するとき、編集するファイルはビューとテンプレートだけ。

カスタムテンプレートタグから実装する場合、ビューとテンプレートに加え、settings.pyとカスタムテンプレートタグのファイルも編集しないといけない。

編集するファイルを4つから、2つに減らすことができた。

これでそれなりに作業は簡単になったのでは？と思う。

## 結論

しかし、これでもなんだかコードが長く感じられて、もう少しシンプルに書けないものかと思うばかりである。

こんなふうにページのパラメータの名前とrequestオブジェクトを引数にしてオブジェクトを作れるようになれたらいいなあと

```
paginator   = Paginator(topics, 4, request=request, attr="page")
```

公式に嘆願書でも送ろうかと思う。もしくは自分でPaginatorクラスの仕様をオーバーライドしていくか。それもまた面倒なことになりそうだが。

他のパラメータとの両立ぐらいは含めてほしいなとつくづく思う。


