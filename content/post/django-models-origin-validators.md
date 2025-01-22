---
title: "【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】"
date: 2022-04-15T14:33:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

例えば、簡易掲示板にて、特定の禁止ワードを含んだ投稿を拒否したい場合。

承認制にして、管理者が文面を確認した上で公開を許す方法もあるが、それでは人件費がかかる。

なるべく保存する前に禁止ワードを含んでいるかどうかをチェックする仕組みにしたい。

そういう時は、validatorsに独自の関数を割り当てれば良い。

コードは[40分Django](/post/startup-django/)から流用して作る

## models.py

不快語を除外するバリデーションを実装させる。

    from django.db import models
    from django.core.exceptions import ValidationError
    
    bad_words   = [ "あああ","いいい" ]
    
    
    def validate_bad_word(value):
        for word in bad_words:
            if word in value:
                #TIPS:forループ中でもraise命令で後続の処理は実行されなくなるため、breakは不要
                raise ValidationError( "不適切な単語が含まれています。" ,params={'value': value}, )
                
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000, validators=[validate_bad_word])

## forms.py

フォームクラスでバリデーションしなければ、モデルのフィールドオプションに指定したvalidatorsは発動しない。

そのため、モデルを使用したバリデーション用のフォームクラスを作る。

    from django import forms 
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = ["comment"]
    
## views.py

フォームクラスを使ってバリデーションをする。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
                print(form.errors)
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


## 実際に動かしてみる

禁止ワードである『あああ』を入力して挙動を確かめる

<div class="img-center"><img src="/images/Screenshot from 2022-04-15 15-38-53.png" alt=""></div>

無事、拒否された。


## 結論

バリデーションは基本、型の確認や文字列の長さなどまでしか判定できないと思っていたが、今回の件で何でもできる事がわかった。

今回は特定の単語を含んでいるかどうかという判定のため、例えば『バカ』と『バカンス』を両方禁止してしまう問題がある。

そのため、形態素解析ツールを使用すると良いだろう。

MecabやJumanなどがここで有効に機能すると思われる。ただ、誤判定もあるため、手放しで実装を推奨されるものでもない。

もし、不適切な単語を含む投稿をしてバリデーションNGになった場合は、DjangoMesseageFrameworkを使ってユーザーに注意喚起も合わせて行う。

[DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する](/post/django-message-framework/)

参照: https://docs.djangoproject.com/en/4.0/ref/validators/


