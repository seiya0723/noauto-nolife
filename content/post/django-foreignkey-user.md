---
title: "【Django】ユーザーモデルと1対多のリレーションを組む方法【カスタムユーザーモデル不使用】"
date: 2021-12-05T11:48:32+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","allauth","認証","初心者向け" ]
---

[認証にはallauth](/post/startup-django-allauth/)を使用する。

コードは[40分Djangoの簡易掲示板](/post/startup-django/)を元に作成する。[forms.pyを実装](/post/django-forms-validate/)させている。

## Userモデルと1対多のリレーションを組み、誰が投稿したのかわかるようにする。


### models.py

    from django.db import models
    from django.contrib.auth.models import User
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        user        = models.ForeignKey(User, verbose_name="投稿者", on_delete=models.CASCADE, null=True,blank=True)
    
        def __str__(self):
            return self.comment
    

`ForeignKey`を使用して、`django.contrib.auth.models`内にある`User`と紐付ける。これでユーザーモデルを1対多で紐付けることができる。1対多に関しては下記記事を参照する。




### forms.py

モデルを継承したバリデーションを行う。先ほど作ったモデルクラスをインポート。フィールドにはuserを追加しておく。

    from django import forms 
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment","user" ]
    
### views.py

ログイン済みの人のみビューにアクセスできるようにする。それから、ユーザーIDをバリデーション前にセットする。

    from django.shortcuts import render,redirect
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(LoginRequiredMixin,View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            copied          = request.POST.copy()
            copied["user"]  = request.user.id
    
            form    = TopicForm(copied)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()
    
ユーザーから送信されたデータ(requestオブジェクト内にあるPOST属性)は書き換えができないので、`.copy()`で内容をコピー。辞書型なので、キーであるuserを指定して、ユーザーIDを代入。バリデーションをする。


### templates/bbs/index.html

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
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>投稿者:{{ topic.user }}</div>
                <div>{{ topic.comment }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

誰が投稿したのか、わかるようにしておく。`{{ topic.user }}`と書くと、ユーザー名が出てくる。これで誰が投稿したのかわかる。


## 実際に動かすとこうなる。

このように誰が投稿したのかわかる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-05 13-15-40.png" alt="ユーザー名が投稿される。"></div>

実践では、ユーザーIDで絞り込み、自分の投稿した内容しか表示させないようにしたり、自分の投稿した内容であれば、削除や編集のボタンを表示させたりして対処する。

ちなみに、`LoginRequiredMixin`が指定されているので、未ログインの状態で`LoginRequiredMixin`を指定したビューにアクセスすると、ログインページにリダイレクトされる。


## 結論

これで誰が投稿したのかわかるようになる。認証機能を実装させることで、プライベートな投稿を本人にのみ表示させることができるなど、様々なウェブアプリ開発に応用できる。

ただ、本件は[メール認証に対応](/post/startup-django-allauth/)しておらず、[ログインページの装飾](/post/django-allauth-loginpage/)もされていない、[ユーザーモデルもカスタムされていない](/post/django-custom-user-model-uuid/)ので、一般公開させる本格的なウェブサービスとしてはまだまだ足りない部分もある。

## ソースコード

https://github.com/seiya0723/django_allauth_foreignkey_user
