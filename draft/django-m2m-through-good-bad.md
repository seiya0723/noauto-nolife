---
title: "Djangoで中間テーブルありの多対多フィールドを使用したモデルに良いね・悪いねする【related_nameとカスタムユーザーモデル】"
date: 2021-08-24T13:03:33+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","allauth","tips" ]
---


## 状況

以前作った、[【Django】Reverse accessor for 'Topic.good' clashes with reverse accessor for 'Topic.user'.というエラーの対処【Topicに対する良いね、多対多中間フィールドあり】](/post/django-m2m-through-reverse-accessor-error/)では、モデルはできあがっているものの、肝心のトピックに良いね悪いねするビューの処理、テンプレートの描画までは解説していない。

そこで、今回はトピックに良いね悪いねをする方法を解説する。


### bbs/models.pyとusers/models.py

モデルは[以前の記事](/post/django-m2m-through-reverse-accessor-error/)と全く同じ。


    from django.db import models
    from django.utils import timezone
    from django.conf import settings
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        dt          = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="投稿者",on_delete=models.CASCADE,related_name="posted_user")
        comment     = models.CharField(verbose_name="コメント",max_length=200)
    
        good        = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="良いね",through="GoodTopic",related_name="posted_good")
        bad         = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="悪いね",through="BadTopic",related_name="posted_bad")
    
        def __str__(self):
            return self.comment
    
    class GoodTopic(models.Model):
    
        class Meta:
            db_table = "good_topic"
    
        dt          = models.DateTimeField(verbose_name="良いねした時刻",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="良いねしたユーザー",on_delete=models.CASCADE)
        target      = models.ForeignKey(Topic,verbose_name="良いねしたトピック",on_delete=models.CASCADE)
    
        def __str__(self):
            return self.target.comment
    
    class BadTopic(models.Model):
    
        class Meta:
            db_table = "bad_topic"
    
        dt          = models.DateTimeField(verbose_name="悪いねした時刻",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="悪いねしたユーザー",on_delete=models.CASCADE)
        target      = models.ForeignKey(Topic,verbose_name="悪いねしたトピック",on_delete=models.CASCADE)
    
        def __str__(self):
            return self.target.comment
    

カスタムユーザーモデルの作り方は[DjangoでUUIDを主キーとしたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】](/post/django-custom-user-model-uuid/)にて解説しているため、そちらをご覧いただきたい。


### bbs/forms.py

Topicにgoodとbadのフィールドが追加されているが、これは後から良いね悪いねするので、バリデーションはしなくてもいい。

    from django import forms
    from .models import Topic,GoodTopic,BadTopic
    
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment","user" ]
    
    
    class GoodTopicForm(forms.ModelForm):
        class Meta:
            model   = GoodTopic
            fields  = [ "user","target" ]
    
    
    class BadTopicForm(forms.ModelForm):
        class Meta:
            model   = BadTopic
            fields  = [ "user","target" ]
    
ここで注意するべきは、バリデーションしなくても良いからと行って、`models.py`のgoodとbadのフィールドに、フィールドオプションとして、`null=True`と`blank=True`を指定しなくても良いという点だ。`ManyToManyField`では`null=True`や`blank=True`の指定は意味ない。

指定した場合、下記のような警告が出る。全く影響を及ぼしていないそうだ。

<div class="img-center"><img src="/images/Screenshot from 2021-08-24 13-18-03.png" alt="M2Mのnullとblank指定は意味ない"></div>



### bbs/views.py


    from django.shortcuts import render,redirect
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm,GoodTopicForm,BadTopicForm
    
    from users.models import CustomUser
    
    class BbsView(LoginRequiredMixin,View):
    
        def get(self, request, *args, **kwargs):
    
            users   = CustomUser.objects.all()
    
            topics  = Topic.objects.all()
            context = { "topics":topics,
                        "users":users,
                    }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            copied              = request.POST.copy()
            copied["user"]      = request.user.id
    
            form    = TopicForm(copied)
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()
    
    
    class BbsGoodView(LoginRequiredMixin,View):
    
        def post(self, request, pk, *args, **kwargs):
    
            copied              = request.POST.copy()
            copied["user"]      = request.user.id
            copied["target"]    = pk
    
            form    = GoodTopicForm(copied)
            if form.is_valid():
                print("バリデーションOK")
                form.save()
    
            return redirect("bbs:index")
    
    good    = BbsGoodView.as_view()
    
    class BbsBadView(LoginRequiredMixin,View):
    
        def post(self, request, pk, *args, **kwargs):
    
            copied              = request.POST.copy()
            copied["user"]      = request.user.id
            copied["target"]    = pk
    
            form    = BadTopicForm(copied)
            if form.is_valid():
                print("バリデーションOK")
                form.save()
    
            return redirect("bbs:index")
    
    bad     = BbsBadView.as_view()


まず、ユーザーの記録をしなければならないので、LoginRequiredMixinで未ログインユーザーはログイン画面にリダイレクトさせた。

続いて、リクエストをコピーした上で、ユーザーID、良いねと悪いねの場合は対象になるトピックのIDもセットでバリデーションを行う。後は保存をするだけである。

今回はユーザーモデルに格納されたレコードも表示している。ユーザーモデル側からはトピックモデルのフィールドオプションで指定した`related_name`が参照できるようになっている。それを確認するためである。


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
    
            <h2>トピック一覧</h2>
    
            {% for topic in topics %}
            <div class="border">
                <div>投稿者:{{ topic.user }}</div>
                <div>投稿日時:{{ topic.dt }}</div>
                <div>コメント:{{ topic.comment }}</div>
                <div>良いね:{{ topic.good.all|length }}
                    <form action="{% url 'bbs:good' topic.id  %}" method="POST" style="display:inline-block;">
                        {% csrf_token %}
                        <input type="submit" value="送信">           
                    </form>
                </div>
                <div>良いねした人: {% for good in topic.good.all %}{{ good }} {% endfor %}</div>
                <div>悪いね:{{ topic.bad.all|length }}
                    <form action="{% url 'bbs:bad' topic.id  %}" method="POST" style="display:inline-block;">
                        {% csrf_token %}
                        <input type="submit" value="送信">
                    </form>
                </div>
                <div>悪いねした人: {% for bad in topic.bad.all %}{{ bad }} {% endfor %}</div>
            </div>
            {% endfor %}
    
            <h2>ユーザー一覧</h2>
    
            {% for user in users %}
            <div class="border">
                <div>ID:{{ user.id }}</div>
                <div>ユーザー名:{{ user.username }}</div>
                <div>投稿した回数:{{ user.posted_user.all|length }}</div>
                <div>良いねした回数:{{ user.posted_good.all|length }}</div>
                <div>悪いねした回数:{{ user.posted_bad.all|length }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>
    


このようにTopicのモデルオブジェクトからgoodとbadが参照できる。いずれも多対多であるため、all属性を付与して参照する必要がある。ユーザー一覧を表示させたいならforループを。良いね数、悪いね数をカウントしたいだけなら、lengthフィルタを付与する。


goodとbadとuserのモデルフィールドに書いた、フィールドオプションの`related_name`の値はカスタムユーザーモデル側のフィールドとしてアクセスできる。

だから、ユーザーが良いねしたトピック(`user.posted_good`)、悪いねしたトピック(`user.posted_bad`)、投稿したトピック(`user.posted_user`)が参照できる。

ただし、いずれも多対多のフィールドであるため、all属性を指定してあげて、forループでひとつずつ表示させなければならない点に注意。数をカウントして表示させたいだけなら、上記のようにlengthフィルタでOK


## 実際に動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-08-24 13-18-05.png" alt=""></div>

このようになる。


見ての通り、一人のユーザーが同じトピックに対して何度も良いねしたり、悪いねしたりできる。投稿した自分自身に対しても良いねできる。

実際には良いねされている状態でもう一度良いねボタンを押すと良いねが解除されるようになるが、ビューの処理にそれを加えていないので、まだその機能は無い。

もし、良いねされている状態で、いいねボタンを押すと解除する仕組みにしたいのであれば、ビュー側でレコードが存在するかチェックした上で、削除するか追加するかを判断すると良いだろう。

それからモデル上でも`class Meta`にて`unique_together`を使用すると良いかも知れない。トピックとユーザーの組み合わせが固有になるためだ。これでDB上でも良いねを2度以上送信することができなくなる。


## 結論 

このM2Mフィールドを使用したモデルのメリットは、ビューの検索処理の軽減にあると思う。トピックのフィールドにgoodとbadがあるおかげで、良いね数、悪いね数をテンプレート側から参照できる。故にビューの処理が軽減される。

良いねをした人の一覧、悪いねをした人の一覧を表示も可能。

ただ、良いねと悪いねのモデルクラスのフィールドのdtに関しては、トピックモデル側から参照することはできない。トピックモデルの良いねと悪いねのフィールドに紐付いているのはユーザーモデルであり、良いねと悪いねのモデルクラスではないからだ。もし、良いねと悪いねのdtを参照したい場合、直接モデルオブジェクトを作って参照する必要(GoodTopic,BadTopicのこと)がある。

## ソースコード

https://github.com/seiya0723/m2m_through_related_name


## 本記事に関連する技術を解説している記事

本件は非常に多くの知識が要求されるため、関連していると思われる記事を列挙する。

- [Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)
- [【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)
- [DjangoでUUIDを主キーとしたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】](/post/django-custom-user-model-uuid/)
- [Djangoでカスタムユーザーモデルを外部キーとして指定する方法](/post/django-custom-user-model-foreignkey/)
- [Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】](/post/django-many-to-many/)
- [【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】](/post/django-m2m-through/)
- [【Django】Reverse accessor for 'Topic.good' clashes with reverse accessor for 'Topic.user'.というエラーの対処【Topicに対する良いね、多対多中間フィールドあり】](/post/django-m2m-through-reverse-accessor-error/)



