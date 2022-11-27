---
title: "【Django】1回のリクエストで複数のデータを投稿する【request.POST.getlist()】"
date: 2022-07-15T14:13:01+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","コスト削減" ]
---


例えば、複数のデータを投稿しなければならない時。

    フォームに内容を書いて投稿(POSTリクエスト)、投稿内容が表示される(レスポンス)
    フォームに内容を書いて投稿(POSTリクエスト)、投稿内容が表示される(レスポンス)
    フォームに内容を書いて投稿(POSTリクエスト)、投稿内容が表示される(レスポンス)
    フォームに内容を書いて投稿(POSTリクエスト)、投稿内容が表示される(レスポンス)


などと複数回リクエストを繰り返しているようでは、クライアントにとってもサーバーにとっても負担になるだろう。

そこで、入力作業の負荷とリクエストを軽減させるためにも、1回のリクエストで複数のデータをまとめて送信できるように仕立てる。

今回も[40分Django](/post/startup-django/)を元に作った。

## ソースコード

### views.py

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
            context["topics"]   = Topic.objects.all()
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            #TIPS仮にrequest.POSTにcommentがなかったとしても、空のリストになるだけ
            comments    = request.POST.getlist("comment")
            
            for comment in comments:
                dic = {}
                dic["comment"]  = comment
    
                form    = TopicForm(dic)
    
                if not form.is_valid():
                    print(form.errors)
                    continue
    
                print("バリデーションOK")
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    




### index.html

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
    
            <form action="" method="POST">
                {% csrf_token %}
                <input type="text" name="comment" placeholder="コメント1">
                <input type="text" name="comment" placeholder="コメント2">
                <input type="text" name="comment" placeholder="コメント3">
                <input type="text" name="comment" placeholder="コメント4">
                <input type="text" name="comment" placeholder="コメント5">
                <input type="text" name="comment" placeholder="コメント6">
                <input type="submit" value="送信">
            </form>
    
            {# 仮にrequest.POST["comment"]がなくてもgetlistではエラーにならない。 #}
            <form action="" method="POST">
                {% csrf_token %}
                <input type="submit" value="送信">
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

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-07-15 14-24-46.png" alt=""></div>


## 結論

この方法はAjaxでも有効である。画像複数枚を一気に送信する事ができる。

[【Django】Ajaxで複数枚の画像を一回のリクエストでアップロードする。](/post/django-ajax-multi-img-upload/)


ちなみに、JavaScript側で、同じname属性の複数の値を取り扱いたい場合、FormDataに対して、`.getAll()`と`.append`を使うとよいだろう。

[【Django】DurationFieldのフォームの最適解を考えてみる【JSを使うか、Django側で制御するか】](/post/django-duration-fields-form/)



