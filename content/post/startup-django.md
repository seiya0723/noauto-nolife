---
title: "Djangoビギナーが40分で掲示板アプリを作る方法"
date: 2020-10-20T14:20:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","スタートアップシリーズ","初心者向け" ]
---

公式のDjangoチュートリアルではよくわからない方向け。

対象読者は既にDjangoをインストール済み、Linux系コマンド習得済み、Python及びHTMLの基本構文を把握済みとする。

## 流れ

以下、流れ。

1. プロジェクトを作る(5分)
1. アプリを作る(5分)
1. settings.pyの書き換え(5分)
1. urls.pyでURLの指定(5分)
1. views.pyで処理の定義(5分)
1. templatesでHTMLの作成(5分)
1. models.pyでフィールドの定義(5分)
1. マイグレーション実行(2分)
1. views.pyでDBへアクセス(5分)
1. 開発用サーバーを起動する(3分)


初心者向けの記事につき、forms.pyのバリデーション、デプロイ、DB設定、Ajaxなどは割愛する。

また、views.pyはクラスベースのビューを採用。

## プロジェクトを作る(5分)

    mkdir startup_bbs
    cd startup_bbs
    django-admin startproject config .

予めディレクトリを作っておき、その状態で`django-admin startproject config .`を実行することで`settings.py`や`urls.py`等の設定ファイルをconfigディレクトリ内に収めることが可能。

## アプリを作る(5分)

下記コマンドでbbsアプリを作る。(※Windowsの場合、`python3`ではなく`python`コマンドを使う)

    python3 manage.py startapp bbs


## settings.pyの書き換え(5分)

冒頭に下記を追加。バージョンによってはすでに追加されている場合もある。

    import os

`INSTALLED_APPS`の最後に`'bbs.apps.BbsConfig',`を追加。`bbs`ディレクトリ内にある`apps.py`の`BbsConfig`クラスを読み込むという意味。これを忘れるとマイグレーションが反映されない問題が起こるので注意。

    INSTALLED_APPS  = [

        ## 省略 ##
    
    
        'bbs.apps.BbsConfig',
    ]

`TEMPLATES`の`DIRS`に下記を追加。プロジェクト直下の`templates`ディレクトリを`TEMPLATES`として設定するという意味。

    #変更前
    'DIRS': [],

    #変更後
    'DIRS': [ os.path.join(BASE_DIR,"templates") ],


`LANGUAGE_CODE`、`TIME_ZONE`を下記に変更。日本時間で日本語を指定。

    LANGUAGE_CODE = 'ja'
    TIME_ZONE = 'Asia/Tokyo'



## urls.pyでURLの指定(5分)

`config/urls.py`を下記に修正。トップページにアクセスした時、`bbs`ディレクトリ内の`urls.py`を参照する

    from django.contrib import admin
    from django.urls import path,include
    
    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include("bbs.urls")),
    ]

`bbs/urls.py`を作成、内容は下記。トップページにアクセスした時、`views.py`の`index`を呼び出す。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [
        path('', views.index, name="index"),
    ]

`app_name`と`name`は第一引数のURL(URI)を逆引きするために使うので、それぞれ1度決めたら変更しないほうが良い。

## views.pyで処理の定義(5分)

まずはGET文を正常に処理させるように書く。`bbs/views.py`に下記を書き込む。

    from django.shortcuts import render
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            return render(request,"bbs/index.html")
    
    index   = BbsView.as_view()


上記`views.py`はGET文を受け取ったら、`templates/bbs/index.html`のレンダリングをするという意味。`urls.py`から呼び出される`views.index`は`BbsView.as_view()`、即ち`BbsView`の処理のことである。

`render()`にはレンダリング対象のHTMLを指定する。とは言え、`templates/bbs/index.html`はまだ存在しないので次の項目で作成する。

`*args`、`**kwargs`についての詳細は下記を参考に。

[DjangoやPythonにおける\*argsと\*\*kwargsとは何か](/post/django-args-kwargs/)

## templatesでHTMLの作成(5分)

まず、プロジェクトディレクトリ直下に`templates`ディレクトリを作る。続いて`bbs`ディレクトリを作る

    mkdir -p templates/bbs/
   
こういうときは`mkdir`コマンドの`-p`オプション使うことで、2階層以上のディレクトリを一気に作れる。

続いて`templates/bbs/index.html`を作る。下記をそのままコピペでOK。

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
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

DTL(Django Template Language)を使用し、`for`文でデータを並べる。Pythonの`for`文と違って、インデント構文ではなく、`endfor`を使用することで`for`文の終端を示す。

変数は`{{ 変数名 }}`で表現する。コメントを表示させる必要があるので、モデルオブジェクト変数`topic`の中の`comment`属性を参照する。よって、`{{ topic.comment }}`となる。

## models.pyでフィールドの定義(5分)

`bbs/models.py`に下記を記入。

    from django.db import models
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

テーブル名は`topic`、そのテーブルの中に文字列型のデータを格納するフィールド、即ち`models.CharField()`の`comment`を定義する。

テーブルの主キーは数値型かつオートインクリメントの`id`が、`models.Model`を継承した時点で付与されている。だから特別な理由(数値型ではない主キーを指定したいなど)を除き、あえて`id`まで定義する必要はない。

## マイグレーション実行(2分)

`models.py`で定義したフィールドはマイグレーションを実行して、DBに格納先のテーブルを作る。

この時、`settings.py`の`INSTALL_APPS`に含まれていないものはマイグレーションを実行してもマイグレーションファイルが生成されない点に注意。

    python3 manage.py makemigrations
    python3 manage.py migrate

マイグレーションが完了すると下記画像のようになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 15-55-43.png" alt="マイグレーション成功"></div>

## views.pyでDBへアクセス(5分)

`views.py`はクライアントから受け取ったデータをDBに保存したり、DBからデータを抜き取ってページに表示させなければならない。故に、下記の様に`views.py`を書き換える。

    from django.shortcuts import render,redirect

    from django.views import View
    from .models import Topic

    class BbsView(View):

        def get(self, request, *args, **kwargs):

            topics  = Topic.objects.all()
            context = { "topics":topics }

            return render(request,"bbs/index.html",context)

        def post(self, request, *args, **kwargs):

            posted  = Topic( comment = request.POST["comment"] )
            posted.save()

            return redirect("bbs:index")

    index   = BbsView.as_view()

`models.py`の中にある`Topic`クラスを`import`する。これでDBへデータの読み書きができるようになる。

`get`メソッドでは全データの参照、`post`メソッドではクライアントから受け取ったデータをDBへ書き込んでいる。

`post`メソッドではデータを書き込んだ後、`get`メソッドへリダイレクトしている。このリダイレクトをする時、`bbs/urls.py`に書いた`app_name`と`name`を組み合わせてURLを逆引きし、リダイレクト先を指定している。

    redirect("[app_name]:[name]")

## 開発用サーバーを起動する(3分)

開発用サーバーを起動させ、動作を確かめる。

    python3 manage.py runserver 127.0.0.1:8000

上記コマンドを実行した後、 http://127.0.0.1:8000/ にアクセスする。下記のような画面が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 16-07-52.png" alt="簡易掲示板の完成"></div>

## ソースコード

https://github.com/seiya0723/startup_bbs

## この先のロードマップ

最後にこの先、どうやって勉強していけばよいかわからない人向けに、いくらかの指針を並べる。

### ネットワーク、セキュリティ、データベースの仕組みについてを知りたい

チュートリアルで手を動かして、簡易掲示板の表示はできた。だが、ウェブアプリケーションフレームワークの仕組みがいまいちわからない。そういう時は、ネットワーク、セキュリティ、データベースの仕組みを知ると良いだろう。

[ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】](/post/startup-web-application-framework/)

フレームワークの勉強方法なども解説しているため、本格的に開発を進める前に読んでおくと良いだろう。ただ、DjangoだけでなくLaravel、Railsにも共通した解説を行っているため、やや抽象的ではある。

### DTLを覚えたい

最初の段階で覚える必要があるDjango Template Language(DTL)はそれほど多くない。下記記事にて、必要最低限のDTLの解説を行っている。

[【Django】開発を始める上で最初に覚えておいたほうがよい Django Templates Language(DTL)](/post/django-templates-language/)

### forms.pyで受け取った値のバリデーション(不適切なデータの受け入れ拒否)

現状ではモデルクラスを使用して直接データを格納しているので、`models.py`で設定した2000文字を超過したり、空欄を入力されてしまう。これを防ぐため`forms.py`によるバリデーションを実装すると良い。

どんなウェブアプリでも、バリデーションを行ってからDBにデータを格納するのが基本のため、受け取った値のバリデーションは早めに実装したほうが良いだろう。(※本記事では、とりあえずクライアント側からのデータの格納を最短で行う事を重視したため、あえて省略した。)

[【Django】forms.pyでバリデーションをする【モデルを継承したFormクラス】](/post/django-forms-validate/)

### admin.pyで管理サイトから簡単に投稿されたデータを読み書き、削除、編集を行う

管理サイトを使用すれば、指定したモデルを簡単に読み書き、削除、編集ができる。検索や絞り込み、並び替えなどのも可能。

[Djangoで管理サイトを作る【admin.py】](/post/django-admin/)

[Djangoの管理サイト(admin)をカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】](/post/django-admin-custom/)

### staticディレクトリ内のCSSやJavaScriptなどの静的ファイルの読み込み

静的ファイルの読み込みができるようになれば、サイトを見やすく装飾することができるし、後にAjaxを使用してサーバーにデータを送信することもできるようにもなる。

画像の表示もできるようになるので、実装しておいたほうが良いだろう。

[【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】](/post/django-static-file-settings/)

### クライアント側からの削除と編集を実装させる

管理サイトによって、管理者側からは自由に削除と編集ができるが、クライアント側からは削除や編集はできない。

そこで、ビューを追加して対象のレコードを特定し、削除・編集を行う。編集時にはforms.pyによるバリデーションも行う。

[Djangoで投稿したデータに対して編集・削除を行う](/post/django-models-delete-and-edit/)

もし、自分が投稿したデータだけ削除・編集できるような形式にしたい場合、ユーザー認証が必要になる。

### モデルフィールドの追加

コメントだけでなく、名前や投稿日時なども入力させたり、表示させたりしたい場合、モデルにフィールドを追加する必要がある。

新しく追加されるモデルフィールドにdefault値が無い場合は、マイグレーションファイル作成時に警告が出るが、この解説も下記記事にて行っている。

[【Django】models.pyにフィールドを追加・削除する【マイグレーションできないときの原因と対策も】](/post/django-models-add-field/)

### 画像やファイルのアップロード

画像や動画等のファイルをアップロードさせるためには、モデルにフィールドを追加するだけでなく、専用のmediaディレクトリを作り、`settings.py`と`config/urls.py`に設定を施す必要がある。

アップロード時のビューの処理も通常の文字列の送信とは異なるため、やや難度が高い。

[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)

### canvasで描画した画像をAjaxで送信

ブラウザで描画した絵をAjaxでアップロードする。Ajaxに加えcanvasの扱いなども解説されているため、とても難易度は高い。

[【Django】canvasで描画した画像をAjax(jQuery)で送信【お絵かきBBS、イラストチャット、ゲームのスクショ共有などに】](/post/django-canvas-send-img-by-ajax/)

### トピックにカテゴリ選択やコメント投稿を実現させる。

トピックを投稿した時に、カテゴリを選択したり、特定のトピックに対してコメントを投稿する場合は、モデルに1対多のフィールドを追加する必要がある。

下記記事では`forms.py`を使ったバリデーションも行っている。

[【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示](/post/django-m2m-form/)

### ユーザー認証

SNSなどではクライアント側がIDとパスワードを入力してユーザー認証を行う必要がある。それを簡単に実現できるのが、django-allauth。

allauthのインストールと、`settigns.py`、`config/urls.py`の設定だけで実現できる。メール認証も実装できる。

[【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)

