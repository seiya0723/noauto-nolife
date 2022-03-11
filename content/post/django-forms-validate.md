---
title: "【Django】forms.pyでバリデーションをする【モデルを継承したFormクラス】"
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

1. forms.pyを作り、models.pyをimport、モデルクラスを継承したフォームクラスを作る
1. views.pyはforms.pyをimport、フォームクラスでバリデーションを行う

## forms.pyを作る

モデルを継承したフォームクラスを作る。


    from django import forms 
    
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]
    
継承に使用するモデルは`Topic`、バリデーション対象のフィールドは`comment`である。

クラス名は`Topic`モデルを継承して作ったフォームクラスなので、`TopicForm`とした。

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
                print(form.error)
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()

`TopicForm`の引数に`request.POST`をそのまま入れる。フォームクラスのオブジェクトである`form`は`.is_valid()`メソッドの返り値(TrueとFalse)でバリデーションOKかNGは判定できる

もし、2000文字以上だったり、空欄だったりすれば、返り値はFalseになる。

`.is_valid()`メソッドを実行して、返り値がTrueであれば、`.save()`メソッドを実行できる。モデルクラスのものと同じようにDBにデータを書き込む。

ちなみに、フォームクラスのオブジェクトは`.error`属性がある。これで、バリデーションNGだった場合、何がNGの原因なのかを知ることができる。

## 動かすとこうなる。

何も入力せずに送信ボタンを押しても何も表示されない。2000文字を超えたコメントも拒否される。

<div class="img-center"><img src="/images/Screenshot from 2021-09-29 09-38-49.png" alt=""></div>

ログにはこのように書かれてある。

<div class="img-center"><img src="/images/Screenshot from 2021-09-29 09-39-27.png" alt=""></div>

## 結論

『[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)』ではモデルフィールドが増えれば、その都度ビューでキーワード引数で入れるフィールドが増えるため、ビューが煩雑になってしまうが、このフォームクラスを使用する方法であれば、モデルフィールドが増えてもビューが煩雑になることはない。

問題のあるデータが事前に拒否されるので、モデルクラスに直接キーワード引数を入れて保存するよりもこちらのほうが良いだろう。

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

