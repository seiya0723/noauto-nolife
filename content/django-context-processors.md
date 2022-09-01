---
title: "【Django】context_processorsを使い、全ページに対して同じコンテキストを提供する【サイドバーのカテゴリ欄、ニュース欄などに有効】"
date: 2022-05-17T09:24:35+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---


以前は、[ビュークラスの継承を使ったり](/post/django-add-context/)、[MIDDLEWAREでリクエストオブジェクトを操作したりする](/post/django-create-middleware-add-request-attribute/)ことでテンプレートに対してデータを提供していたが、これではやや無駄が多い。

Djangoには`context_processors`という、任意の処理を行った後contextを追加できる便利な機能があるので、こちらを使う。

## context_processorsを作る

まず、アプリディレクトリ内部に、`custom_context.py`というファイルを作る。内容は下記。

    from .models import Topic
    
    def first_topic(request):
        
        context = {}
        context["FIRST_TOPIC"]  = Topic.objects.order_by("-id").first()
    
        return context

### 【補足1】contextのキーの重複を防ぐには？

上記のように大文字を使用するのが一考である。ただ、むやみに大文字で書いてしまえばいいという問題ではないと思う。

例えば、サイドバーに表示させるコンテキストを提供したい場合、


    from .models import Category,Tag,Topic
    
    def sidebar(request):
        
        context                 = {}
        context["SIDEBAR"]      = {}

        context["SIDEBAR"]["categories"]    = Category.objects.order_by("-dt")
        context["SIDEBAR"]["tags"]          = Tag.objects.order_by("-dt")
        context["SIDEBAR"]["latests"]       = Topic.objects.order_by("-dt")[:10]

        return context


このようにすると良いだろう。


## context_processorsを登録する

続いて、`context_processors`をsettings.pyに登録する。

    TEMPLATES = [ 
        {   
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [ BASE_DIR / "templates" ],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                    "bbs.custom_context.first_topic", #←追加
                ],  
            },  
        },  
    ]
    

## テンプレートで表示させる

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <h1 class="bg-primary text-white">簡易掲示板</h1>
    
        <main class="container">
    
            <h2>投稿フォーム</h2>
    
            {# ここが投稿用フォーム #}
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
    
            <h2>最新の投稿</h2>
    
            <div class="border">{{ FIRST_TOPIC.comment }}</div>
    
            <h2>投稿一覧</h2>
    
            {# ここが投稿されたデータの表示領域 #}
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>


## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-05-17 09-47-49.png" alt=""></div>


## 結論

ご覧の通り、`context_processors`はMIDDLEWAREを扱うよりも遥かに簡単に実装できるだろう。

ただ、contextのキー名が重複しないように、別途配慮をする必要がありそうだ。

例えば、今回のように大文字のキーを作るとか、あるいは`custom_context`というキーの中に辞書型を仕込ませ、そこからキーを指定して取り出すとかの工夫が必要と思われる。

    {{ custom_context.first_topic.comment }}

などと呼び出せば、キーの重複が起こる事はないと思われる。

