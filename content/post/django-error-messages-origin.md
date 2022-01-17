---
title: "【Django】任意のエラーメッセージを表示させる【forms.pyでerror_messagesを指定】"
date: 2022-01-16T17:57:29+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

forms.pyに書いたフォームクラスを使ってバリデーションを行った時、エラーメッセージの表示ができる。

    print(forms.errors)

例えば、これで入力しなければならない場所を未入力で投稿した場合、

    このフィールドは入力必須です

とエラーが出てくる。やや堅めの文章であり、『フィールド』という単語はエンジニアであればまだしも、一般人はそれが何を意味しているのかわからないだろう。

そこでこの時に表示されるエラーメッセージを別のものに書き換える。

原型のコードはいつもの[40分Django簡易掲示板](/post/startup-django/)から引用している。

## forms.py

    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = ["comment"]
    
            error_messages = {
                'comment': {
                    'max_length': "コメントの文字数が" + str(Topic.comment.field.max_length) + "文字を超えています。",
                    'required': "コメントを入力してください",
                },
            }
    
`error_messages`にフィールドを指定、エラー条件に応じて、メッセージを割り当てる。


`max_length`で指定した文字数を参照して、エラーメッセージに含めている。この方法は下記記事に書いてある。        

[Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】](/post/django-reference-models-option/)


## views.py


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    from django.contrib import messages
    
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
            else:
                print(form.errors)
                print(form.errors.get_json_data())
            
                #メッセージだけ取り出す。
                values          = form.errors.get_json_data().values()
    
                for value in values:
                    for v in value:
                        messages.error(request, v["message"])
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


`print(form.errors)`でエラーメッセージが表示される時、先ほど指定したものが表示される。空欄であれば、『コメントを入力してください』、`max_length`を超過していれば『コメントの文字数が〇〇文字を超えています。』と出てくる。

ただ、`form.errors`で出力されるメッセージにはname属性まで含まれている。一般の人はname属性はわからない。だから必要なのはメッセージだけ。メッセージだけ取り出して、メッセージフレームワークに入れる。

フロントにそのエラーメッセージを表示させるため、メッセージフレームワークを使用している

[DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する](/post/django-message-framework/)

## bbs/index.html


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
    
            {% for message in messages %}
            <div>{{ message }}</div>
            {% endfor %}
    
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
    

メッセージフレームワークを表示させる。

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-01-16 21-30-15.png" alt=""></div>


## 【補足】error_messagesで指定できるキーについて

下記リンクに表示されている、Error message keysが指定できる。

https://docs.djangoproject.com/en/4.0/ref/forms/fields/#built-in-field-classes

<div class="img-center"><img src="/images/Screenshot from 2022-01-16 18-36-17.png" alt=""></div>

上記、`BooleanField`であれば、`required`が`error_messages`のキーとして指定できる。

`django.core.validators`を使用する場合、フィールドオプションの`validators`に`RegexValidator`等を使用するが、この場合は`invalid`を指定すればよい。


