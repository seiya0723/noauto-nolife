---
title: "【Django】modelformset_factoryで1回のリクエストでまとめて投稿する【フォームセット】"
date: 2024-07-03T11:38:52+09:00
lastmod: 2024-07-03T11:38:52+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---


1回のリクエストで、決まった個数のデータをまとめて投稿したい場合、modelformset_factory が有効。

ただし、状況によってはgetlistを使う方法のほうが有効の場合もあるので、よく考える必要がある。

## modelformset_factory とは

例えば、1回のリクエストで5個のコメントをまとめて投稿する必要がある場合。

このようにフォームクラスを元に、フォームセットを作る。


```
from django import forms
from .models import Topic

class TopicForm(forms.ModelForm):
    class Meta:
        model	= Topic
        fields	= [ "comment" ]


from django.forms import modelformset_factory

TopicFormSet = modelformset_factory(Topic, form=TopicForm, extra=5)
```

ビューでこのフォームセットをコンテキストに渡す。

```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic

from .forms import TopicFormSet


class IndexView(View):

    def get(self, request, *args, **kwargs):

        context = {}
        context["topics"]   = Topic.objects.all()

        #                                     ↓これがないとこれまで投稿されたデータまで表示される。
        context["formset"]  = TopicFormSet(queryset=Topic.objects.none())

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        formset = TopicFormSet(request.POST)

        if formset.is_valid():
            formset.save()
        else:
            print(formset)
            print(formset.errors)


        return redirect("bbs:index")

index   = IndexView.as_view()
```

この時、引数としてquerysetを与える。

postメソッドのバリデーション処理は、普通のフォームクラスのバリデーションと同じ。

テンプレート側でフォームセットを呼び出す。



```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
</head>
<body>

    <main class="container">
        {# ここが投稿用フォーム #}
        <form method="post">
            {% csrf_token %}

            {{ formset.management_form }}
            {% for form in formset %}
                {{ form.as_p }}
            {% endfor %}
            <button type="submit">Save</button>
        </form>


        {# ここが投稿されたデータの表示領域 #}
        {% for topic in topics %}
        <div class="border">
            {{ topic.comment }}
        </div>
        {% endfor %}

    </main>
</body>
</html>
```
formsetには、Topic5個分のフォームが用意されている。それを全てレンダリングする。


## 結論

フォームテンプレートを使用しており、個数もサーバー側で取り決める必要があるため、やや汎用性に欠けると思った。

とはいえ、必ず一定個数を投稿したい場合には、getlistよりも厳重にできる。


## 関連記事

### getlist と modelformset_factory の違い

https://noauto-nolife.com/post/django-multi-send/

- 1回のリクエストで、必ず一定の個数を投稿したい場合: modelformset_factory
- 1回のリクエストで、1個でも複数個でも投稿したい場合: getlist 

とそれぞれ使い分けする方法が妥当と思われる。

## ソースコード

https://github.com/seiya0723/startup_bbs_modelformset_factory




