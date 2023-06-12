---
title: "【django】summernoteを使用してwysiwygエディタを表示させる【マークダウンよりも簡単】"
date: 2023-04-22T15:44:08+09:00
lastmod: 2023-04-22T15:44:08+09:00
draft: false
thumbnail: "images/Screenshot from 2023-04-24 09-51-47.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","ウェブデザイン","セキュリティ" ]
---

## wysiwygエディタとは？

このようなエディタのことである。

<div class="img-center"><img src="/images/Screenshot from 2023-04-24 09-51-47.png" alt=""></div>

入力した内容と、ページに表示される内容が全く同一。

MSwordのようなエディタをウェブ上で扱うことができる。(.docxファイルがウェブ上で扱えるわけではないので注意。)

今回も[40分Django](/post/startup-django/)をベースとしてDjango-summernoteを実装していく。


## Djangoでwysiwygエディタを使うならdjango−summernote

以下に実装手順をまとめる

### ライブラリのインストール

```
pip install django-summernote
```

同時に、HTMLのタグを判定するbleachというライブラリもインストールされる。また、style属性のCSSを解析するためのtinycss2をインストールしておく

```
pip install tinycss2
```


### config/settings.py

settings.pyでは許可をするHTMLタグを指定する。

```
# django_summernoteを追加する。
INSTALLED_APPS = [
    "django_summernote",

    # 以下略
]


## 中略 ## 

# summernoteで保存する画像の設定
MEDIA_URL   = "/media/"
MEDIA_ROOT  = BASE_DIR / "media"



# summernoteの設定(エディタのサイズ調整)
# https://github.com/summernote/django-summernote
SUMMERNOTE_CONFIG = { 
    'summernote': {
        'width': '100%',
        'height': '480',
    }   
}

# 許可するHTMLタグと属性の指定(XSSに注意。scriptタグとonclick,onsubmitなどの属性は追加厳禁)
# bleachで判定する
ALLOWED_TAGS = [ 
    'a', 'div', 'p', 'span', 'img', 'em', 'i', 'li', 'ol', 'ul', 'strong', 'br',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'tbody', 'thead', 'tr', 'td',
    'abbr', 'acronym', 'b', 'blockquote', 'code', 'strike', 'u', 'sup', 'sub','font'
]
ATTRIBUTES = { 
    '*': ['style', 'align', 'title', 'style' ],
    'a': ['href', ],
    'img': ['src', ],
}
```

この許可をするHTMLタグを誤るとXSS脆弱性を生み出してしまうので、十分注意する。

上記の通りにやれば、特に問題はない。


`django_summernote`の中にはモデルが有るので、マイグレーションをしておく。

```
python3 manage.py migrate
```


### config/urls.py

Django-summernoteのパスと画像のパスを追加する

```
from django.contrib import admin
from django.urls import path,include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [ 
    path('admin/', admin.site.urls),

    # 中略

    path('summernote/', include('django_summernote.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

Django-summernoteのエディタで添付された画像は、django-summernoteのモデルに記録される。



### models.py

DBに保存されるのは、膨大なHTMLの羅列になるので、文字数制限を排除したTextFieldを採用した。

```
from django.db import models

class Topic(models.Model):
    comment         = models.TextField(verbose_name="コメント")
```


### forms.py

django-summernoteに用意されているフォームフィールドを使うと、エラーになってしまうので、公式からオーバーライドしていく。

参照元: https://github.com/summernote/django-summernote/blob/main/django_summernote/fields.py

```
from django import forms 

from django_summernote.widgets import SummernoteWidget
from django.conf import settings

from .models import Topic

import bleach

# style属性を許可する場合、 CSSSanitizerをbleach.clean()の引数に入れる
# 前もって、 pip install tinycss2 を実行しておく
from bleach.css_sanitizer import CSSSanitizer

#css = CSSSanitizer(allowed_css_properties=[ "color" ]) # 個別に許可をしたい場合はここに文字列型で許可するCSSのプロパティを入れる。すべて許可する場合は、引数なし。


class HTMLField(forms.CharField):

    def __init__(self, *args, **kwargs):
        super(HTMLField, self).__init__(*args, **kwargs)
        self.widget = SummernoteWidget()

    # ここで.clean()内にstyles引数を入れるとエラー(bleachではすでにstyle引数は廃止されている)
    def to_python(self, value):
        value       = super(HTMLField, self).to_python(value)
        return bleach.clean(value, tags=settings.ALLOWED_TAGS, attributes=settings.ATTRIBUTES, css_sanitizer=CSSSanitizer())


class TopicForm(forms.ModelForm):
    class Meta:
        model   = Topic
        fields  = [ "comment" ]

    comment = HTMLField()
```


このTopicFormを使ってバリデーションをする。

bleachが発動し、settings.pyの許可リストに存在しないHTMLがある場合、バリデーションNGとする。

### views.py

フォームクラスのテンプレートを提供する。

```
from django.shortcuts import render,redirect
from django.views import View

from .models import Topic
from .forms import TopicForm

class IndexView(View):

    def get(self, request, *args, **kwargs):

        context             = {}
        context["topics"]   = Topic.objects.all()
        context["form"]     = TopicForm()

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        form    = TopicForm(request.POST)

        if form.is_valid():
            form.save()

        return redirect("bbs:index")

index   = IndexView.as_view()
```

### templates/bbs/index.html


通常のtextareaタグは使用できないので、views.pyから受け取ったformを使ってsummernoteのエディタをレンダリングする。`{{ form.comment }}`の部分。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

<style>
img{ max-width:100%; }
</style>


</head>
<body>

    <main class="container">
        {# ここが投稿用フォーム #}
        <form method="POST" >
            {% csrf_token %}
            {{ form.comment }}
            <input type="submit" value="送信">
        </form>

        {# ここが投稿されたデータの表示領域 #}
        {% for topic in topics %}
        <div class="border">
            {{ topic.comment|safe }}
        </div>
        {% endfor %}

    </main>
</body>
</html>
```


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-05-30 16-08-37.png" alt=""></div>

このフォームを投稿するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-05-30 16-08-42.png" alt=""></div>


## 結論

これで[マークダウン](/post/django-markdown/)よりもユーザーフレンドリーなエディタの提供ができる。

Djangoで、Wordpressのようなコンテンツ管理システムを運用しようと考えた場合、このsummernoteを使うのが良いだろう。

だが、summernoteの開発はすでに停止しているようなので、サービスを提供する開発者側はそれなりの知識が要求される点に注意。

### 管理サイト上でこのエディタを扱うには？

先ほどのTopicFormをカスタムアドミンで採用する。

[Djangoの管理サイト(admin)のフォームをforms.pyを使用してカスタムする【文字列入力フォームをtextareaタグで表現】](/post/django-admin-custom-form/)


## 参照元

- https://bleach.readthedocs.io/en/latest/clean.html#sanitizing-css


## ソースコード

https://github.com/seiya0723/summernote_test

