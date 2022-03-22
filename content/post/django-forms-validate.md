---
title: "【Django】forms.pyでバリデーションをする【モデルを利用したFormクラス】"
date: 2021-09-29T09:16:49+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---

『[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)』で作った簡易掲示板はクライアントから受け取った値のチェックを行っていない。

モデルでは投稿できるコメントは2000文字以内であり。入力必須となっているが、開発用のSQLiteはそこまで判定できない。故にこういうことが起こる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-29 09-28-04.png" alt=""></div>

MySQLやPostgreSQL等の本番用のDBではDBが直接エラーを出す仕組みになるが、それでは使用しているDBが何かクライアントに把握されてしまったり、DBに負荷がかかってしまう。

そこで、Formクラスを使用して、バリデーションを行う。

## 手順

手順は非常にシンプル

1. forms.pyを作り、models.pyをimport、モデルクラスを利用したフォームクラスを作る
1. views.pyはforms.pyをimport、フォームクラスでバリデーションを行う

## forms.pyを作る

モデルを利用したフォームクラスを作る。まず`forms.ModelForm`を継承する。

    from django import forms 
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]
    
利用するモデルは`Topic`、バリデーション対象のフィールドは`comment`である。

クラス名は`Topic`モデルを利用して作ったフォームクラスなので、`TopicForm`とした。

## views.pyを書き換える

`views.py`は`forms.py`を`import`して使う。

    from django.shortcuts import render,redirect
    from django.views import View
    
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            """
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
            """
                
            form    = TopicForm(request.POST)
                
            if form.is_valid():
                print("バリデーションOK")
                #保存する
                form.save()
            else:
                print("バリデーションNG")

                #バリデーションNGの理由を表示させる
                print(form.errors)
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()

`TopicForm`の引数に`request.POST`をそのまま入れる。フォームクラスのオブジェクトである`form`は`.is_valid()`メソッドの返り値(TrueとFalse)でバリデーションOKかNGは判定できる

もし、2000文字以上だったり、空欄だったりすれば、返り値はFalseになる。

`.is_valid()`メソッドを実行して、返り値がTrueであれば、`.save()`メソッドを実行できる。モデルクラスのものと同じようにDBにデータを書き込む。

ちなみに、フォームクラスのオブジェクトは`.errors`属性がある。これで、バリデーションNGだった場合、何がNGの原因なのかを知ることができる。


## 動かすとこうなる。

何も入力せずに送信ボタンを押しても何も表示されない。2000文字を超えたコメントも拒否される。

<div class="img-center"><img src="/images/Screenshot from 2021-09-29 09-38-49.png" alt=""></div>

ログにはこのように書かれてある。

<div class="img-center"><img src="/images/Screenshot from 2021-09-29 09-39-27.png" alt=""></div>


## 【補足1】モデルフィールドが増えたらどうなる？

『[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)』ではモデルフィールドが増えれば、その都度ビューでキーワード引数で入れるフィールドが増えるため、ビューが煩雑になってしまうが、このフォームクラスを使用する方法であれば、モデルフィールドが増えてもビューが煩雑になることはない。

例えば、モデルクラスが下記のように、nameとageが追加されたとする。

    from django.db import models
    
    class Topic(models.Model):
        name        = models.CharField(verbose_name="名前",max_length=100)
        age         = models.IntegerField(verbose_name="年齢")
        comment     = models.CharField(verbose_name="コメント",max_length=2000)


モデルクラスを使った保存をする場合、下記のようになる。

    posted  = Topic( comment =request.POST["comment"],
                     name = request.POST["name"],
                     age = request.POST["age"],
                    )
    posted.save()

つまり、モデルのフィールドが増えるたびに、ビューでの保存処理にもキーワード引数が増えていく。これではビューが煩雑になってしまう。

しかし、forms.pyを使う場合、下記のようにバリデーション対象のフィールドとして、モデルクラスに追加したフィールドを追記しておくだけで良い。

    from django import forms 
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment","name","age" ]
    

ビューの処理はそのままで問題はない。comment,name,ageの3つがバリデーションされる。

    form    = TopicForm(request.POST)
        
    if form.is_valid():
        print("バリデーションOK")
        form.save()
    else:
        print("バリデーションNG")
        print(form.errors)


## 結論

このようにフォームクラスを使うことで問題のあるデータが事前に拒否することができる。

他にもフォームクラスで作ったフォームオブジェクトをテンプレートに引き渡すことで、HTMLのフォームを表示させることができる。(※もっともHTMLのclass名をサーバーサイドで指定することになるので、フロントとサーバーの分業が難しくなるデメリットがある。)


## この先にやること

フォームクラスを使ってデータのバリデーションが出来たら、後はエラーの理由を表示させたり、投稿完了した旨をテンプレート側に表示させると良いだろう。

### テンプレート上に投稿完了、エラーなどの表示をさせる

現状では投稿完了したにもかかわらず、その旨が表示されない。そこで、MessageFrameworkを使って投稿完了を表示させる。

[DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する](/post/django-message-framework/)


### 任意のエラーメッセージを表示させる。

上記のやり方ではまだ問題がある。

例えば、『入力必須』『2000文字以内』の2つのルールがあり、いずれでも単に『エラー』と表示されてしまうので、何が問題なのかユーザーはわからないだろう。

そこで、forms.pyのルールに応じて表示させるエラーメッセージを切り替える。これで何が問題なのかわかる。

[【Django】任意のエラーメッセージを表示させる【forms.pyでerror_messagesを指定】](/post/django-error-messages-origin/)

### モデルを利用しないフォームクラス

例えば、フォームクラスを使ってのバリデーションがDBにデータを書き込むためのものであれば、モデルを利用したほうが良い。

しかし、モデルには関係のないデータをバリデーションする場合、バリデーションした後DBにデータを格納しない場合などは、モデルを利用しないでフォームクラスを作ったほうが良いだろう。

具体的な例として、年月検索がある。年月検索をする時、月の指定に1~12以外の値を入れるとエラーになる。

    #13月は存在しないので、これではエラーになってしまう。
    Topic.objects.filter(dt__month=13).order_by("-dt")

下記記事では年月検索をするため、モデルを利用しないフォームクラスを作っている。

[【Django】年月検索と、年別、月別アーカイブを表示させる【最新と最古のデータから年月リストを作成(Trunc不使用)】](/post/django-year-month-search-and-list/)


### フォームクラスを使って、フォームのテンプレートを提供する。

ビューのgetメソッドでフォームクラスのオブジェクトを作り、それをcontextに入れてレンダリングすることで、フォームクラスに適したフォームテンプレートをレンダリングすることができる。

まず、ビュークラスにて、下記のようにフォームオブジェクトをcontextに入れてレンダリングさせる

    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            form    = TopicForm()

            context = { "topics":topics,
                        "form":form
            }
    
            return render(request,"bbs/index.html",context)


続いて、レンダリング対象のHTMLであるbbs/index.htmlにて下記を追加する。

    {{ form.as_p }}


これが下記のようになる。

    <p><input type="text" name="comment" maxlength="2000" required></p>

だが、このフォームテンプレートの装飾は容易ではない。下記記事を見るとよくわかる。

[Djangoのforms.pyが提供するフォームテンプレートは使わない](/post/django-forms-temp-not-use/)


