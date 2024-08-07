---
title: "Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】【ForeignKey】"
date: 2021-11-21T16:34:32+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

1対多のリレーションを構築することができれば、トピックにカテゴリを指定したり、トピックに対してコメントを投稿することができる。

本記事はその方法を1対多の原理からDjangoの`models.py`での書き方まで記す。コードは『[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)』から流用する。

## 1対多の仕組み

1対多とは、一言で言ってしまうと、プロ野球チームとチームに所属する選手の関係である。下記図をご覧いただきたい。

<div class="img-center"><img src="/images/Screenshot from 2021-10-29 21-45-13.png" alt=""></div>

プロ野球チームは複数の選手を保有する。一方で、選手はどこかしらのチーム1つに所属する。間違ってもカープと巨人の両方に所属することはできない。

この場合、球団側は1、選手側は多である。

これをDBのテーブルで表現すると、こうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-29 21-45-18.png" alt=""></div>

球団テーブルと選手テーブルの2つがある。選手テーブルでは名前のほかに所属球団のidを指定して、球団テーブルを呼び出せるようにしている。球団テーブルには球団名が書かれてあるので、選手と球団名を併記できるのだ。

A選手はカープ、B選手はヤクルト、C選手は巨人ということがわかる。

更に、球団テーブルには球団に関するカラムを追加することができるので、選手テーブルから球団情報を参照することができる。

### 1対多のメリット

このように直接、所属先の文字列を書き込むよりも、1対多のリレーションを組むほうがメリットが多い。

- 必ずどれかひとつを選ぶ(複数選ぶことはできない)
- 表記ゆれがなくなる
- 1が消された時の挙動を指定できる(多を削除など)

#### 必ずどれかひとつを選ぶ(複数選ぶことはできない)

1対多のメリットとしてどれかひとつを選ぶことにある。もちろん選ばないという選択肢もモデルの設定によっては実現できる。

だが、1対多において複数を選ぶことはない。今回の例であれば選手が複数の球団と同時に契約することはできない。

#### 表記ゆれがなくなる

もし、これがエクセルであり、文字列で手入力する場合、必ずどこかで表記ゆれが発生する。球団の名称であれば、『カープ』『広島』『広島東洋』などの表記ゆれが発生してしまう。

この表記ゆれが発生した場合、何が問題かと言うと、検索でヒットしなくなる。

#### 1が消された時の挙動を指定できる(多を削除など)

例えば、球団が消滅した時、所属している選手はどうするかを指定することができる。主な設定は下記。

- 球団に所属している選手を球団未所属の選手としてデータを保存し続ける
- 球団に所属している選手のデータを全て抹消する
- 球団に所属している選手のデータを別の球団に割り当てる
- 選手を保有している球団であれば、消滅することはできないようにする

1対多のリレーションを作っている時点で球団の変化に合わせて、所属している選手のデータの扱いを自動的に書き換えることができる。

### 1対多のリレーションを組んだほうがよい例

以下に例を示す。左を1、右を多としている。

|1|多|
|:--:|:--:|
|カテゴリ|投稿されたコンテンツ(掲示板、動画など)|
|投稿者|投稿されたコンテンツ(掲示板、動画など)|
|投稿されたコンテンツ(掲示板、動画など)|コンテンツに対するコメント|
|コンテンツに対するコメント|そのコメントに対するリプライ|
|部署・グループ|所属社員・メンバーなど|

その一方で、多対多で組んだほうが良いものの主な例として、食品に含まれるアレルギー品目などがある。これらは1対多で組むとアレルギー品目の1つは、どれか1つの食品にしか紐付けない。[ 多対多でリレーションを組む ](/post/django-many-to-many/)。

## 1対多のコード

実際にコードを書いていく。

### トピックにカテゴリを指定する

『[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)』より、まず`models.py`を以下のように書き換える。

    class Category(models.Model):
    
        name    = models.CharField(verbose_name="カテゴリ名",max_length=20)
    
        def __str__(self):
            return self.name
    
    
    class Topic(models.Model):
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

新たに`Category`モデルクラスを作る。そして、既存の`Topic`モデルクラスに`ForeignKey`フィールドを追加する。

`ForeignKey`フィールドにはフィールドオプションとして、`on_delete`は必須なので指定する。今回指定した`models.CASCADE`はトピックに指定したカテゴリが削除された時、トピックもセットで削除すると言う意味。前項で説明したとおり、削除させずに残したりすることもできる。

下記は`on_delete`に指定できる値の一覧である

|値|効果|
|:--:|----|
|models.CASCADE|1が削除される時、紐付いている多は全て削除される|
|models.PROTECT|1が削除される時、紐付いている多が存在する場合、削除できない|
|models.SET_NULL|1が削除された時、紐付いている多にNULL(PythonのNone)が入力される(ただしNull=Trueとしている場合に限る)|
|models.SET_DEFAULT|1が削除された時、紐付いている多にdefaultの値が入力される(ただしdefaultに値がセットされている場合に限る)|

そして、これをマイグレーションする時、警告が出る。null禁止である`category`にはフィールドオプションの`default`がない。この矛盾の対策は3通りある。

- 【対策1】categoryフィールドにnull=Trueとblank=Trueのフィールドオプションを指定、未分類を許可する
- 【対策2】migrationsディレクトリとdb.sqlite3を削除し、一からマイグレーションファイルを作り直し
- 【対策3】migrationsディレクトリとdb.sqlite3を削除できない場合、1度限りのデフォルト値を入れる

参照元:[DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】](/post/django-non-nullable/)

#### 【対策1】categoryフィールドにnull=Trueとblank=Trueのフィールドオプションを指定、未分類を許可する

まず、カテゴリを指定する際に、未分類の投稿を許すのであれば`category`フィールドに`null=True`と`blank=True`を指定する。

    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE, null=True, blank=True)

#### 【対策2】migrationsディレクトリとdb.sqlite3を削除し、1からマイグレーションファイルを作り直し

一方で、未分類を許さないのであれば、migrationsディレクトリとdb.sqlite3を削除し、一からマイグレーションファイルを作り直す。

ちなみに、手動でmigrationsディレクトリを削除した場合、再度マイグレーションファイルを作る時は、明示的にアプリ名を指定する必要がある点に注意。

    python3 manage.py makemigrations bbs

#### 【対策3】migrationsディレクトリとdb.sqlite3を削除できない場合、1度限りのデフォルト値を入れる

もし、未分類を許さず、マイグレーションファイルやDBを削除することができない状況の場合は、1度限りのdefault値を入れる。ただし入力するdefault値は文字列ではなく、数値である。ForeignKeyは指定したモデルのidフィールドと繋がっている。idフィールドは未指定であれば数値型になっている。だから適当な数値を入力する。1から順にカテゴリのレコードが挿入されるので、1と指定すると良いだろう。

言うまでもなくマイグレーションをした後はすぐに[管理サイトから](/post/django-admin/)カテゴリを追加する。idが1のデータが参照できないからだ。

続いて、フォームとビュー、テンプレートを書き換える

`forms.py`にて、モデルを使ったフォームクラスの`fields`に`category`と`comment`を指定。

    from django import forms 
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = ["category","comment"]

`views.py`にて、カテゴリを表示させるため、カテゴリのモデルクラスを`import`する。フォームクラスを使ったバリデーションもお忘れなく。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Category,Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
            context["topics"]       = Topic.objects.all()

            #カテゴリの選択肢を作るため、全てのカテゴリをcontextに引き渡す
            context["categories"]   = Category.objects.all()
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()

以下、`templates/bbs/index.html`。

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

                {# ここでカテゴリの選択肢をレンダリングさせる #}
                <select name="category">
                    {% for category in categories %}
                    <option value="{{ category.id }}">{{ category.name }}</option>
                    {% endfor %}
                </select>

                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.category.name }}</div>
                <div>{{ topic.comment }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

1対多で1つのカテゴリを選択する時は、このようにselectタグを使用すると良い。`option`タグの`value`属性にはidを指定しておく。

後は、カテゴリを管理サイトから追加できる形式に仕立てる。admin.pyに下記を記入。

    from django.contrib import admin
    from .models import Category,Topic
    
    admin.site.register(Category)
    admin.site.register(Topic)

詳しくは[Djangoで管理サイトを作る【admin.py】](/post/django-admin/)を参照。

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-27 17-27-16.png" alt="カテゴリ指定の挙動"></div>

### トピックにコメントを投稿する

続いて、トピックにコメントが投稿できるようにする。モデルの作り方は先ほどとほぼ同じ。

`models.py`を以下のように書き換える。

    from django.db import models
    
    class Category(models.Model):
    
        name    = models.CharField(verbose_name="カテゴリ名",max_length=20)
    
        def __str__(self):
            return self.name
    
    class Topic(models.Model):
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment
    
    class Reply(models.Model):
    
        target  = models.ForeignKey(Topic,verbose_name="リプライ対象のトピック",on_delete=models.CASCADE)
        comment = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

`Reply`モデルクラスが新たに作られた。この`Reply`モデルクラスの`ForeignKey`は`Topic`に繋がっている。つまり、リプライ対象の`Topic`のidを指定するのだ。

当然、Replyはユーザー側から投稿される仕様にするので、`forms.py`にて、`Reply`モデルクラスを使ったフォームクラスを作る必要がある。

    from django import forms 
    from .models import Topic,Reply
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "category","comment" ]
    
    class ReplyForm(forms.ModelForm):
    
        class Meta:
            model   = Reply
            fields  = [ "target","comment" ]

続いて、ビューを書き換える。モデルクラスのReply、フォームクラスのReplyFormをそれぞれimportする。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Category,Topic,Reply
    from .forms import TopicForm,ReplyForm

    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
            context["topics"]       = Topic.objects.all()
            context["categories"]   = Category.objects.all()
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    
    class ReplyView(View):
    
        def get(self, request, pk, *args, **kwargs):
    
            context = {}
            context["topic"]    = Topic.objects.filter(id=pk).first()
            context["replies"]  = Reply.objects.filter(target=pk)
    
            return render(request,"bbs/reply.html",context)
    
        def post(self, request, pk, *args, **kwargs):
    
            #request.POSTのコピーオブジェクトを作る。(そのままでは書き換えはできないため)
            copied              = request.POST.copy()
            copied["target"]    = pk
    
            form    = ReplyForm(copied)
    
            if form.is_valid():
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:reply",pk)
    
    reply   = ReplyView.as_view()

新しく`ReplyView`を作った。ここで返信のフォームの表示、返信の投稿処理を行う。

引数としてpkを受け取っている。ビュークラスのメソッドに引数を指定する方法は、[削除と編集について解説している記事](/post/django-models-delete-and-edit/)を確認すると良いだろう。

リプライ対象のトピックのid(引数名pk)を手に入れたいので、これはURLの中に含ませる形式に仕立てる。つまり、`urls.py`を書き換える。

`bbs/urls.py`を下記のようにする。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('reply/<int:pk>/', views.reply, name="reply"),
    ]

`reply/数値/`であれば`views.reply`、即ち`ReplyView`を呼び出す。その時、引数として`pk`が与えられる。例えば、

    reply/5/

に対してリクエストが送信されれば、pkには整数型(int型)の5が入り、ビューが実行される。GETメソッドであればpkでトピックの特定とレンダリングが、POSTメソッドであればpkでリプライ対象のトピックのIDをキー名`target`に値として入れ、バリデーションする。

これで`urls.py`から対象のidを特定し、その上で、表示したり、リプライを保存したりすることができる。

後は返信をする時、HTMLの`form`タグの`action`属性に`action="reply/数値/"`になるようにテンプレートを作る。

新しく`templates/bbs/reply.html`を作る。内容は下記。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{{ topic.comment }}に対するリプライ</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
    </head>
    <body>
        
        <h1 class="bg-primary text-white text-center">リプライ</h1>
    
        <main class="container">
    
            <a class="btn btn-primary" href="{% url 'bbs:index' %}">一覧に戻る</a>
    
            <div class="border">
                <div>{{ topic.category.name }}</div>
                <div>{{ topic.comment }}</div>
            </div>
    
            <form action="{% url 'bbs:reply' topic.id %}" method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="返信">
            </form>
    
            <h2>リプライの一覧</h2>
    
            <div>{{ replies|length }}件のリプライ</div>
    
            {% for reply in replies %}
            <div class="border">
                <div>{{ reply.id }}</div>
                <div>{{ reply.comment }}</div>
            </div>
            {% empty %}
            <div>リプライはありません。</div>
            {% endfor %}
        
        </main>
    </body>
    </html>

`action`属性はフォームの送信先を示しているから、URLを指定する必要がある。とは言え、`action="reply/{{ topic.id }}"`などと書いてしまうと。URLが変わった時に対処できない。

だから`form`タグの`action`属性にはDTLの`url`を使用している。`urls.py`で指定した`name`と`app_name`を使って逆引きしているのだ。その時、引数として`topic.id`を指定する。これでトピックのidによって、`action`属性の値を変化させることができる。

ついでに、`templates/bbs/index.html`に返信のリンクを載せる。

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
                <select name="category">
                    {% for category in categories %}
                    <option value="{{ category.id }}">{{ category.name }}</option>
                    {% endfor %}
                </select>
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.category.name }}</div>
                <div>{{ topic.comment }}</div>
    
                <!--↓追加-->
                <a class="btn btn-primary" href="{% url 'bbs:reply' topic.id %}">返信</a>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

動かすとこうなる。トップページはこんな感じ。

<div class="img-center"><img src="/images/Screenshot from 2021-10-30 10-39-50.png" alt=""></div>

こんなふうに、返信を投稿することができる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-30 10-40-42.png" alt=""></div>

## 結論

このように1対多はカテゴリやリプライなど様々な用途がある一方で、限界もあり万能とは言い難い。

### 多対多について

本記事で1対多の実装方法を解説したが、実践では多対多も必要になってくる。

具体的には、1つのトピックに対して複数のタグを指定するには1対多では成立しない。フードデリバリー系のウェブアプリで、[メニューに対して含有するアレルギー品目を複数指定する](/post/django-m2m-form/)などでも1対多では成立しない。


### コメント数を表示するには？

モデルにコメント数をカウントするメソッドを追加して、

    class Topic(models.Model):
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)

        def reply_amount(self):
            return Reply.objects.filter(target=self.id).count()
    
        def __str__(self):
            return self.comment

テンプレートでメソッドを呼び出す。

    {% for topic in topics %}
    <div>コメント数 ( {{ topic.reply_amount }} )</div>
    {% endfor %}

ちなみに、このようにモデルにメソッドを追加したくない場合、annotateとCountを使うことでも再現できる。詳しくは下記記事を参照。

[【Django】外部キーに対応したデータの個数をカウントして表示【リプライ・コメント数の表示に有効】【annotate+Count】](/post/django-foreign-count/)


### 1対多で検索をするには？

1対多で検索をするには、前もってのバリデーションが必要になる。

下記記事では、[スペース区切りの文字列検索](/post/django-or-and-search/)と組み合わせて検索している

[Djangoでクエリビルダを使い、スペース区切りの文字列検索と絞り込みを同時に行う【JSとカスタムテンプレートタグを使用】](/post/django-search-querybuilder-custom-templates-js/)


ちなみに多対多で検索をする時、クエリビルダは通用しない。クエリビルダを実行した後に絞り込みをする必要がある。

[【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】](/post/django-m2m-search-and-add/)


### 削除と編集もURLに引数を含める

さらに、このリプライのビューは編集や削除のビューと同様に、urls.pyから受け取った引数を元に処理を行っている。リプライができたのであれば、クライアント側からの削除や編集に挑戦してみるのも良いだろう。

[Djangoで投稿したデータに対して編集・削除を行う【urls.pyを使用してビューに数値型の引数を与える】](/post/django-models-delete-and-edit/)

### 誰が投稿したかを記録するには？

認証機能を実装させ、認証済みのユーザーのみ投稿を許可する。投稿する直前に、投稿したユーザーのIDを記録する。

つまり、トピックとリプライの1対多を組んだ上で、ユーザーモデルとリプライもしくはユーザーモデルとトピックの1対多を構築する。

[【Django】ユーザーモデルと1対多のリレーションを組む方法【カスタムユーザーモデル不使用】](/post/django-foreignkey-user/)

ちなみにログインしていないユーザーの投稿を禁止するには、`LoginRequiredMixin`を使うと良いだろう。


### 通販サイトのように星付きのレビューを投稿するには？

下記の2つの記事を組み合わせる。

- [【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】](/post/django-template-integer-for-loop/)
- [HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】](/post/css3-star-review-radio/)

星付きのレビューにするため、レビューのモデルに、IntegerFieldを追加すると良いだろう。

ただし、5つ星にする場合、Validatorsを使用する必要がある(1~5の数値を入力させるため)


### 通販サイトで、商品に紐づく画像を無制限にするには？

例えば、通販サイトでは商品1つに対して、複数枚の画像が表示されている。

こういう状況の場合、商品モデル画像のフィールドを大量に追加するのは利口ではない。

そこで、本記事の1対多を扱う。これで1つの商品に対して無制限の画像をセットすることが可能になる。問題はフォームだが、それも下記記事では対策済みである。

[【Django】Ajaxで複数枚の画像を一回のリクエストでアップロードする。](/post/django-ajax-multi-img-upload/)


## ソースコード

https://github.com/seiya0723/startup_bbs_foreignkey

