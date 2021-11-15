---
title: "DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する"
date: 2021-11-14T18:53:28+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

## DjangoのMessageFrameworkを有効化させる

まず、`settings.py`の`INSTALLED_APPS`に

    'django.contrib.messages'

が含まれているかどうかをチェック。Django 3.2であればデフォルトで書かれてある。

同じく`MIDDLEWARE`に

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware'
    
上記2つが含まれている事を確認。`SessionMiddleware`は`MessageMiddleware`よりも前に書かれてある必要がある。これもデフォルトで書かれてある。

また同じく`settings.py`の`TEMPLATES`、`OPTIONS`、`context_processors`にて、

    'django.contrib.messages.context_processors.messages',

が含まれていることを確認。これもデフォルト。

つまり、とりわけ`settings.py`を下手にいじっていなければデフォルトでMessageFrameworkは有効化されている。


## MessageFrameworkを使ってHelloWorldを表示させる。

元になるコードは[40分Djangoにforms.pyを追加した状態](/post/django-forms-validate/)から流用している。

まず、`views.py`にて、[公式からコード](https://docs.djangoproject.com/en/3.2/ref/contrib/messages/#using-messages-in-views-and-templates)を拝借して追加した。

    from django.shortcuts import render,redirect
    
    from django.views import View

    from .models import Topic
    from .forms import TopicForm
    
    
    #↓追加
    from django.contrib import messages
    
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):

            #↓追加    
            messages.add_message(request, messages.INFO, 'Hello world.')
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


HTML側でメッセージを表示させるにはこうする。

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
    
            <!--↓追加-->
            {% if messages %}
            <ul class="messages">
                {% for message in messages %}
                <li{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
                {% endfor %}
            </ul>
            {% endif %}
    
    
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

つまり、仕組みは
    
    messages.add_message(request, messages.INFO, 'Hello world.')

これでメッセージを追加。`settings.py`の設定によりテンプレート側に引き渡される変数`messages`を参照し、HTML上で表示させている。


## 【応用】投稿成功時、投稿エラー時にそれぞれメッセージを表示させる

テンプレートはそのままにビューを下記のようにする。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    
    from django.contrib import messages
    
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            ##messages.add_message(request, messages.INFO, 'Hello world.')
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
                messages.add_message(request, messages.INFO, '投稿内容を保存しました')
            else:
                messages.add_message(request, messages.INFO, '投稿エラー')
                
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


バリデーションに失敗したら投稿エラーの旨を、バリデーション成功して保存を終えたら投稿内容を保存しましたと言う。リダイレクトを経由したとしても、問題なくHTML上で表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-15 13-47-30.png" alt="メッセージが表示される。"></div>


## 結論

これを利用すれば、わざわざcontextにデータを渡さなくても1行でメッセージの追加ができる。このようにリダイレクトする場合でもメッセージは共有されるので、まとめて表示される。

ちなみに、公式によると、もっと短く記述する方法があるそうだ。下記コードの上と下は等価。

    messages.add_message(request, messages.INFO, "Hello world.")

    messages.info(request, "Hello world.")


詳しくは下記を参照。

https://docs.djangoproject.com/en/3.2/ref/contrib/messages/#using-messages-in-views-and-templates


参照元:https://docs.djangoproject.com/en/3.2/ref/contrib/messages/
