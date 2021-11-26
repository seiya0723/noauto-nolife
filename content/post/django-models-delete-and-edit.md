---
title: "Djangoで投稿したデータに対して編集・削除を行う【urls.pyを使用してビューに数値型の引数を与える】"
date: 2021-10-17T10:44:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---

[40分簡易掲示板](/post/startup-django/)を元に、forms.pyにてモデルを継承したフォームクラスを作り、その上で削除と編集を実装させる。

## 前提(forms.pyにてモデルを継承したフォームクラスを作る)

モデルを継承したフォームクラスの作り方は『[【Django】forms.pyでバリデーションをする【モデルを継承したFormクラス】](/post/django-forms-validate/)』を参照。

`bbs/forms.py`を作る。内容は下記。

    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]

`bbs/views.py`を下記のように書き換える。

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
    
            form    = TopicForm(request.POST)
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


## 削除を実装させる

実際に削除を実行するのはビューである。故に、ビューに削除の処理を書き込む必要があるのだが、現状のビュークラス(BbsView)はGETメソッドとPOSTメソッドで、既に2つ使い切っている。

このBbsViewのPOSTメソッドに削除処理を追加しても良いが、それではログに削除をしたのか、投稿をしたのかわからなくなり、ログが機能不全になってしまう可能性がある。(ウェブサーバーのログはリクエスト先のURLは記録できるが、リクエストのボディまでは個別に設定をしない限り記録されない。)

そこで、新しいビュークラスを作る必要がある。`bbs/views.py`の末端に下記を追加する。

    class BbsDeleteView(View):
    
        def post(self, request, *args, **kwargs):

            #TODO:ここに削除の処理を記入する。
            
            return redirect("bbs:index")
    
    delete  = BbsDeleteView.as_view()

`bbs/urls.py`からは、この`delete`を呼び出せるようにする。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('delete/', views.delete, name="delete"), #←追加
    ]

ただ、今回実装する削除の処理は、主キー(id)を指定して、削除対象のレコードを特定をした上で削除を行う必要がある。主キーとは、他のレコードとは重複しない固有の値のこと。

とりわけ、Djangoのモデルでは何も指定しなければ自動的に`id`というフィールド名が付与されるようになっている。このデフォルトで付与される`id`は数値型であり、固有の番号が1から順に、2,3,4,5,6,7と割り振られる。

だから、`urls.py`には、パスの中に数値型のidを仕込ませることで、バリデーションを行う手間を省くことができるのだ。下記のように編集する。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('delete/<int:pk>/', views.delete, name="delete"), #←編集
    ]

削除のURLに`<int:pk>`を追加した。これは数値型(`int`)の値を`pk`という引数にしてビューに与えることを意味している。つまり、下記URLの場合、`views.delete`が実行される。

    #下記は全てpkに当たる部分が数値であるため、views.deleteが実行される。その時、数値がpkとして、views.deleteに与えられる。

    delete/1/
    delete/40/
    delete/100/
    delete/333/

一方で、下記のように数値(int)ではない場合、views.deleteは実行されず、404 Not Foundとされる。

    #下記は全て404扱い

    delete/百/
    delete/abc/
    delete/2021-10-15/

`pk`に当たる部分がビューに引き渡されるため、`views.delete`に当たる`BbsDeleteView`の書き換えを行う。

    class BbsDeleteView(View):
    
        #↓第三引数にpkを追加、このpkの型はurls.pyで指定されたものに変換されるため、整数型(int)になる。
        def post(self, request, pk, *args, **kwargs):

            #TODO:ここでpk(削除対象のid)が参照し、削除を実行
            
            return redirect("bbs:index")
    
    delete  = BbsDeleteView.as_view()

第三引数に`pk`を追加する。後は下記のように削除の処理を実装させるだけ。

    class BbsDeleteView(View):
    
        #↓第三引数にpkを追加
        def post(self, request, pk, *args, **kwargs):

            topics  = Topic.objects.filter(id=pk)
            topics.delete()
            
            return redirect("bbs:index")
    
    delete  = BbsDeleteView.as_view()

モデルオブジェクトは`.delete()`メソッドで削除ができる。ちなみに下記でもOK。

    class BbsDeleteView(View):
    
        #↓第三引数にpkを追加
        def post(self, request, pk, *args, **kwargs):

            topic   = Topic.objects.filter(id=pk).first()
            
            if topic:
                print("削除")
                topic.delete()
            else:
                print("対象のデータは見つかりませんでした。")

            return redirect("bbs:index")
    
    delete  = BbsDeleteView.as_view()

続いて、テンプレート側にて、削除ボタンを実装させる。

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
                {{ topic.comment }}
    
                <!--↓追加-->
                <form action="{% url 'bbs:delete' topic.id %}" method="POST">
                    {% csrf_token %}
                    <input class="btn btn-danger" type="submit" value="削除">
                </form>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

urlの中に引数がある場合、上記のように記述すれば良い。urls.pyの`app_name`と`name`で指定した`bbs`と`delete`で逆引きを行うと同時に、`topic.id`が付与されるため、例えば、idが24の場合`delete/24/`となる。これが`action`属性に指定されるので、削除ボタンを押すと同時に、POSTメソッドが`delete/24/`に送信される。

classにはBootstrapの削除ボタン風の装飾を割り当てた。こんなふうに削除ボタンが表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-17 16-18-43.png" alt="削除ボタンの表示完了"></div>

押すと、削除される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-17 16-23-30.png" alt="削除の実行"></div>

## 編集を実装させる

投稿のバリデーションと、削除のurls.pyに倣うことで、編集が実現できる。

まず、編集用のビューを作る。削除のビューと同様に、メソッドの引数としてpkを指定。ただし、今回は編集フォームを表示させるため、getメソッドを作っておく。

    class BbsEditView(View):
    
        def get(self, request, pk, *args, **kwargs):

            #TODO:編集するトピックの特定と編集ページのレンダリングをする

            return redirect("bbs:index")
    
        def post(self, request, pk, *args, **kwargs):

            #TODO:ここで編集の処理
    
            return redirect("bbs:index")
    
    edit    = BbsEditView.as_view()


`bbs/urls.py`にて`views.edit`を呼び出す。下記のように書き換える。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('delete/<int:pk>/', views.delete, name="delete"),
        path('edit/<int:pk>/', views.edit, name="edit"),
    ]


続いて、`templates/bbs/edit.html`を作る。中身は下記。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>編集</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <form action="{% url 'bbs:edit' topic.id %}" method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment">{{ topic.comment }}</textarea>
            <input type="submit" value="送信">
        </form>
    
    </body>
    </html>

まず、formタグのaction属性。送信先を指定する時、pkがあるので、削除のときと同様に`topic.id`を指定する。`textarea`タグには、`{{ topic.comment }}`を入れ、編集前のコメントの状態を表示させている。

この`templates/bbs/edit.html`を`BbsEditView`からレンダリング及び、編集処理を受け付けるため、再びビューの編集を行う。

    class BbsEditView(View):
    
        def get(self, request, pk, *args, **kwargs):
    
            #編集対象を特定してレンダリング
            topic   = Topic.objects.filter(id=pk).first()
            context = { "topic":topic }
    
            return render(request,"bbs/edit.html",context)
    
        def post(self, request, pk, *args, **kwargs):
    
            #編集対象を特定
            topic   = Topic.objects.filter(id=pk).first()
            
            #instanceに編集対象を指定して、request.POSTをバリデーション(※ これで編集対象の内容が書き換わる。もし、instanceが存在しない場合、新しく作られる。)
            form    = TopicForm(request.POST,instance=topic)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    edit    = BbsEditView.as_view()

まず、getメソッド。編集対象を特定して、レンダリングしている。`BbsView`のgetメソッドと違って`.first()`で単一のレコードを返却している。これによりDTLの`for`でループしなくても良い。わかりやすいように複数形のtopicsではなく、単数形のtopicと名付けた。

続いて、postメソッド。`TopicForm`で`request.POST`をバリデーションする時、`instance`というキーワード引数に特定した`topic`を指定することで、指定した`topic`を`request.POST`の内容に倣って編集を行うことができる。後は、投稿と同様にバリデーションを行い、フォームオブジェクトの`form`で`.save()`メソッドを実行すれば編集がDBに保存される。

仮に、指定されたpkが存在しない場合、編集ではなく投稿扱いになる。

最後に、`templates/bbs/index.html`にて、編集フォームを呼び出すリンクを設置する。

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
                {{ topic.comment }}
    
                <form action="{% url 'bbs:delete' topic.id %}" method="POST">
                    {% csrf_token %}
                    <input class="btn btn-danger" type="submit" value="削除">
                </form>
    
                <!--↓ここに編集のリンクを追加-->
                <a class="btn btn-success" href="{% url 'bbs:edit' topic.id %}">編集</a>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

動かすとこうなる。編集と削除のボタンが見える。

<div class="img-center"><img src="/images/Screenshot from 2021-10-18 12-32-33.png" alt="編集ボタン"></div>

編集のボタン(リンク)をクリックすると、編集ページに行く。

<div class="img-center"><img src="/images/Screenshot from 2021-10-18 12-33-26.png" alt="編集ページ"></div>

てきとうにテキストエリアの文字列を書き換え、送信ボタンを押すと、編集された事がわかる。一番上が編集された。

<div class="img-center"><img src="/images/Screenshot from 2021-10-18 12-35-01.png" alt="編集された"></div>

## 結論

本記事で編集と削除が実現できたが、これだと、自分が投稿したトピックでも、他の人が自由に削除・編集ができてしまう。

自分が投稿したトピックは、自分しか削除と編集を許可しないのであれば、ユーザー認証とユーザーidとトピックを紐付ける1対多のフィールドの追加が必要になるだろう。

ユーザー認証であれば、allauthを使えば簡単に実現できる。

[【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)


また、編集のビューは1対多のリレーションを組んだトピックへのリプライのビューと構造が似ている。詳しくは下記記事を参照する。

[Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】](/post/django-models-foreignkey/)



