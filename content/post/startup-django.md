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

Djangoのインストールをまだしていない場合は下記コマンドで。

```
pip install django 
```

## 注意事項

40分はあくまでも私見に基づく目安である点をご留意いただきたい。

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

予めディレクトリを作っておき、その状態で`django-admin startproject config .`を実行することで`settings.py`や`urls.py`等の設定ファイルを`config`ディレクトリ内に収めることが可能。

もし、下記のように`django-admin startproject`コマンド実行時、プロジェクト名をそのまま指定した場合、設定ファイル関係がプロジェクトディレクトリと同名のディレクトリに格納される。

    django-admin startproject myproject  #この場合、myprojectの中に設定ファイルを含むmyprojectディレクトリが作られる。

## アプリを作る(5分)

下記コマンドでbbsアプリを作る。

    python3 manage.py startapp bbs

Windowsの場合、`python3`ではなく`python`コマンドを使う

    python manage.py startapp bbs

※本記事はLinux及びMacユーザー向けとしているため、以降は`python3`と書かれてあるが、Windowsの場合は`python`と実行する。


## settings.pyの書き換え(5分)

`INSTALLED_APPS`の最後に`'bbs.apps.BbsConfig',`を追加する。

`bbs`ディレクトリ内にある`apps.py`の`BbsConfig`クラスを読み込むという意味。これを忘れるとマイグレーションが反映されない問題が起こるので注意。

    INSTALLED_APPS  = [

        'bbs.apps.BbsConfig',

        ## 省略 ##
    ]


市販の教科書によっては、このINSTALLED_APPSにアプリ名だけの`bbs`と書くように指示しているものもある。

だが、Django公式では上記のように書くことを推奨している。

詳細は下記。

[【Django】settings.pyのINSTALLED_APPSにはどのように書くのが適切か【順番とapps】](/post/django-settings-installed-apps/)


`TEMPLATES`の`DIRS`にテンプレートのパスを追加。プロジェクト直下の`templates`ディレクトリをレンダリング対象のHTMLを格納するテンプレートとして扱うという意味。

    #変更前
    TEMPLATES = [ 
        {   
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },  
    ]


    #変更後
    TEMPLATES = [ 
        {   
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [ BASE_DIR / "templates" ],  #←ここを編集
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },  
    ]


`LANGUAGE_CODE`、`TIME_ZONE`を下記に変更。日本時間で日本語を指定。

    LANGUAGE_CODE = 'ja'
    TIME_ZONE = 'Asia/Tokyo'


### 【補足】Django 2.x以前のパスの書き方

Django 2.x以前ではosモジュールを使用する形式だったため、下記のように記述する。

    # 3.x以降の書き方
    'DIRS': [ BASE_DIR / "templates" ],

    # 2.x以前の書き方
    'DIRS': [ os.path.join(BASE_DIR,"templates") ],

3.x以降で使用されている、`pathlib`モジュールの場合、下記のように冒頭で定義された`BASE_DIR`にプロジェクトのディレクトリまでのフルパスが格納されているので、`/`で区切り、以降のパスを文字列で追加する。

    BASE_DIR = Path(__file__).resolve().parent.parent
    BASE_DIR / "templates" #←これでプロジェクトディレクトリ直下のtemplatesディレクトリという意味になる。


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
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            return render(request,"bbs/index.html")
    
    index   = IndexView.as_view()

上記`views.py`はGET文を受け取ったら、`templates/bbs/index.html`のレンダリングをするという意味。`urls.py`から呼び出される`views.index`は`IndexView.as_view()`、即ち`IndexView`の処理のことである。

`render()`にはレンダリング対象のHTMLを指定する。とは言え、`templates/bbs/index.html`はまだ存在しないので次の項目で作成する。


### 【補足1】`*args`、`**kwargs`とは？

`*args`、`**kwargs`についての詳細は下記を参考に。引数が溢れてもエラーが起こらないようにする事ができる。

[DjangoやPythonにおける\*argsと\*\*kwargsとは何か](/post/django-args-kwargs/)


### 【補足2】なぜクラスが直接メソッドを実行できるのか？

通常のクラスであれば、オブジェクトを作った上で、メソッドを実行する。

    obj   = BaseClass()
    obj.do_something()

しかし、今回は

    index   = IndexView.as_view()

と実行できる。これはクラスメソッドである。

クラスメソッドを予め作っておけば、このようにクラスが直接メソッドを呼び出すことができる。

今回IndexViewの継承に使用したViewクラスには、前もってこの`.as_view()`のメソッドがクラスメソッドとして書かれてある。

https://github.com/django/django/blob/main/django/views/generic/base.py

とりわけ、この`.as_view()`メソッドはDjangoが独自に作った`@classonlymethod`で作られている(オブジェクトから`.as_view()`を呼び出すことはできない)

下記を参照。

- https://stackoverflow.com/questions/8133312/what-is-the-difference-between-django-classonlymethod-and-python-classmethod
- https://qiita.com/ysk24ok/items/848daec3886f1030f587


### 【補足3】このクラスベースのビューというものがよくわからない

Djangoには関数ベースのビューも用意されているので、クラスの概念が難しい場合はそちらを使うと良いだろう。

[【Django】ビュー関数とビュークラスの違い、一覧と使い方](/post/django-view-def-and-class/)

クラスを使うには、オブジェクト指向の概念を理解する必要がある。下記記事で解説されている。

[Djangoをやる前に知っておきたいPython構文【オブジェクト指向(class文)と別ファイル読み込み(import文)は特に重要】](/post/django-essential-python/)


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
            {# ここが投稿用フォーム #}
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
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

DTL(Django Template Language)を使用し、`for`文でデータを並べる。Pythonの`for`文と違って、インデント構文ではなく、`endfor`を使用することで`for`文の終端を示す。

    {% for topic in topics %}
    <div class="border">
        {{ topic.comment }}
    </div>

変数は`{{ 変数名 }}`で表現する。コメントを表示させる必要があるので、モデルオブジェクト変数`topic`の中の`comment`属性を参照する。よって、`{{ topic.comment }}`となる。

## models.pyでフィールドの定義(5分)

`bbs/models.py`に下記を記入。

    from django.db import models
    
    class Topic(models.Model):
        comment     = models.CharField(verbose_name="コメント",max_length=2000)

    
このモデルをマイグレーション(後述)することで、DBへテーブルが作られる。DBはプロジェクト直下の`db.sqlite3`というファイル。このDB設定は`settings.py`のDATABASEから確認できる。

このモデルをマイグレーションして作られるテーブルのテーブル名は`bbs_topic`、そのテーブルの中に文字列型のデータを格納するフィールド、即ち`models.CharField()`の`comment`を定義する。

テーブルの主キーは数値型かつオートインクリメントの`id`が、`models.Model`を継承した時点で付与されている。だから特別な理由(数値型ではない主キーを指定したいなど)を除き、あえて`id`まで定義する必要はない。

### 【補足1】テーブル名を明示的に指定するには`db_table`を書く。

テーブル名は自動的に`[アプリ名]_[モデルクラス名(小文字)]`になるので、指定する必要はないが、あえて指定することもできる。

    from django.db import models
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)


ただし、このように明示的にテーブル名を指定する場合は、テーブル名の重複問題にも配慮する必要がある。

詳しくは『[【Django】複数のアプリを作る場合、models.pyのモデルクラスにテーブル名を指定するべきではない【重複問題】](/post/django-models-do-not-set-table-name/)』を参考に。

### 【補足2】Topic object (1) などと表示される場合は、strメソッドを追加する。

マイグレーション後の話になるが、データを投稿してさあ中身を`print()`で出力してみようとすると、`Topic object (1)`などと表示され、投稿内容がわからない事がある。

    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment


そういう場合、上記のようにstrメソッドをセットする。こうすることで投稿されたコメントが`print()`で出力され、どんなデータなのかわかりやすくなる。

ちなみに、このstrメソッドの指定がないと、idの数値が表示される。例えばidが5のデータであれば、`Topic object (5)`となる。

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

    class IndexView(View):

        def get(self, request, *args, **kwargs):

            topics  = Topic.objects.all()
            context = { "topics":topics }

            return render(request,"bbs/index.html",context)

        def post(self, request, *args, **kwargs):

            posted  = Topic( comment = request.POST["comment"] )
            posted.save()

            return redirect("bbs:index")

    index   = IndexView.as_view()

`models.py`の中にある`Topic`クラスを`import`する。これでDBへデータの読み書きができるようになる。

`get`メソッドでは全データの参照、`post`メソッドではクライアントから受け取ったデータをDBへ書き込んでいる。

### getメソッドの処理

`get`メソッドは`Topic`を使ってDBへの読み込みを行う。下記で全データの読み込みを行うことができる。

    Topic.objects.all()

返り値として受け取るのは、モデルオブジェクト。ただ、全データが含まれているので、複数のモデルオブジェクトと解釈したほうが良いだろう。

    topics  = Topic.objects.all()

この`topics`はforループを行うことで1つずつ取り出すことができる。この`topics`をテンプレートでレンダリングして表示させるため、`context`としてレンダリング時に引き渡す。

    topics  = Topic.objects.all()
    context = { "topics":topics }

    return render(request,"bbs/index.html",context)

#### 【補足1】contextを受け取り、レンダリングするテンプレート側の処理

テンプレートは`context`に指定されているキーを呼び出し、レンダリングをする。つまり、`Topic.objects.all()`で実行された結果を表示させたい場合、キー名の`topics`を呼び出す。

    {{ topics }}

ただ、これだけだと全データが雑然と表示されてしまうので、forループで1つずつ取り出し、表示させる。

    {% for topic in topics %}
    <div>{{ topic.comment }}</div>
    {% endfor %}


#### 【補足2】モデルクラスを使った絞り込みと並び替え

他にも、このモデルクラスを使うことで、絞り込みや、並び替えなどもできる。

    #特定idだけ絞り込んで表示する。
    Topic.objects.filter(id=1)

    #全件からidを逆順に並び替えて表示する。
    Topic.objects.order_by("-id")


これを応用することで、検索機能を実装させることができる。詳しくは下記を確認したい。

[Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】](/post/django-or-and-search/)


#### 【補足3】contextをもっとスマートに書く

先のコードではcontextを最後に定義し、topicsに対してtopicsというキーを割り当てた。

    topics  = Topic.objects.all()
    context = { "topics":topics }

    return render(request,"bbs/index.html",context)

しかし、この書き方ではcontextに含める値が増えるとこうなる。

    topics_1    = Topic.objects.all()
    topics_2    = Topic.objects.all()
    topics_3    = Topic.objects.all()
    topics_4    = Topic.objects.all()

    context     = { 
        "topics_1":topics_1,
        "topics_2":topics_2,
        "topics_3":topics_3,
        "topics_4":topics_4,
    }

    return render(request,"bbs/index.html",context)

このように、contextに含める値が増えるたびに、行数が余分に増えてしまう。これではビューの見通しが悪くなる。

そこで、このように書くとビューの行数を削減できて見通しが良くなるだろう。下記は上記のコードと等価である。

    context             = {}    
    context["topics_1"] = Topic.objects.all()
    context["topics_2"] = Topic.objects.all()
    context["topics_3"] = Topic.objects.all()
    context["topics_4"] = Topic.objects.all()

    return render(request,"bbs/index.html",context)

### postメソッドの処理

`post`メソッドではデータを書き込みを行う。ここでもモデルクラスを使用する。

    posted  = Topic( comment = request.POST["comment"] )
    posted.save()

モデルオブジェクトを作る時、キーワード引数として`comment`を入れる。`request.POST["comment"]`はテンプレートに記述した`name="comment"`に起因している。

つまり、テンプレート側が`name="message"`となった場合、`request.POST["message"]`となる。

その後、`get`メソッドへリダイレクトする。このリダイレクトをする時、`bbs/urls.py`に書いた`app_name`と`name`を組み合わせてURLを逆引きし、リダイレクト先を指定している。

    redirect("[app_name]:[name]")

#### 【補足1】モデルクラスを使った保存の別解

例では下記のようにモデルオブジェクトを作って保存した。

    posted  = Topic( comment = request.POST["comment"] )
    posted.save()

だが、下記のやり方でも問題はない。やっていることは全く同じである。

    posted          = Topic()
    posted.comment  = request.POST["comment"]
    posted.save()

モデルオブジェクトを作る時に送信されたデータを指定するか、それともモデルオブジェクトを作った後に送信されたデータを指定するか、の違いである。

#### 【補足2】postメソッドではリダイレクトを返し、レンダリングを行ってはいけないのはなぜか

この`post`メソッドの末尾にレンダリングの処理を書いてreturnしてはいけない。

    #postメソッドで下記を実行してはいけない。
    #return render(request,"bbs/index.html")

ブラウザ上で更新ボタンを押すと、`『このページを表示するにはフォームデータを再度送信する必要があります。フォームデータを再送信すると以前実行した検索、投稿や注文などの処理が繰り返されます。』`という警告文が表示される。これでは後々、問題が発生する。

詳しくは下記をご覧いただきたい。

[Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法](/post/django-redirect/)

#### 【補足3】現状では空文字列も2000文字オーバーも受け付ける

このモデルクラスを使った保存方式には欠陥がある。

それは、バリデーションが行われていないので、モデルで定義した『入力必須』、『2000文字以内』というルールに従っていなくても、保存ができてしまう。

開発中はデータベースとしてsqlite3を使用しているので、そのまま保存されてしまうが、デプロイ後に本番用のデータベース(MySQLやPostgreSQLなど)を使うと、DBがエラーを出す。これではDBに負荷がかかってしまうので、事前のバリデーションは必須。

そこで登場するのが、`forms.py`。バリデーションを行い、ルールに則っていないデータをデータベースへ保存させないようにすることができる。詳しくは下記を参照する。

[【Django】forms.pyでバリデーションをする【モデルを利用したFormクラス】](/post/django-forms-validate/)


## 開発用サーバーを起動する(3分)

開発用サーバーを起動させ、動作を確かめる。

    python3 manage.py runserver 127.0.0.1:8000

上記コマンドを実行した後、 http://127.0.0.1:8000/ にアクセスする。下記のような画面が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 16-07-52.png" alt="簡易掲示板の完成"></div>

### 【補足1】manage.py系コマンドについて

冒頭で`startapp`、モデルに書いた内容でDBへテーブルを作るためのマイグレーションコマンドである`makemigrations`と`migrate`、そして開発用サーバーを起動する`runserver`等を実行する事ができるのが、プロジェクトの直下にある`manage.py`

他にも管理者ユーザーを作る`createsuperuser`やDBに格納されたデータのバックアップとリストアも`manage.py`で行うことができる。

詳細は下記。

[Djangoで管理サイトを作る【admin.py】](/post/django-admin/)

[Djangoで開発中、データベースへ初期データを入力する【バックアップしたデータをloaddataコマンドでリストア】](/post/django-loaddata/)

[DjangoでDBに格納したデータをダンプ(バックアップ)させる【dumpdata】](/post/django-dumpdata/)


ちなみに、`manage.py`で実行できるコマンドは下記で確認できる。

    python3 manage.py

`manage.py`に新たに独自のコマンドを追加することもできる。

[【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)


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

`views.py`の`post`メソッドの処理の補足で説明したとおり、現状ではモデルクラスを使用して直接データを格納しているので、`models.py`で設定した2000文字を超過したり、空欄を入力されてしまう。

これを防ぐため`forms.py`によるフォームクラスのバリデーションを実装すると良い。

どんなウェブアプリでも、バリデーションを行ってからDBにデータを格納するのが基本のため、受け取った値のバリデーションは早めに実装したほうが良いだろう。(※本記事では、とりあえずクライアント側からのデータの格納を最短で行う事を重視したため、あえて省略した。)

[【Django】forms.pyでバリデーションをする【モデルを利用したFormクラス】](/post/django-forms-validate/)

ちなみに、独自のバリデーションを用意して使うことができる。

不快語などの不適切な単語が含まれているかどうかをチェックして、投稿を拒否する事もできる。

[【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】](/post/django-models-origin-validators/)

### admin.pyで管理サイトから簡単に投稿されたデータを読み書き、削除、編集を行う

管理サイトを使用すれば、指定したモデルを簡単に読み書き、削除、編集ができる。検索や絞り込み、並び替えなどのも可能。

[Djangoで管理サイトを作る【admin.py】](/post/django-admin/)

[Djangoの管理サイト(admin)をカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】](/post/django-admin-custom/)

### staticディレクトリ内のCSSやJavaScriptなどの静的ファイルの読み込み

静的ファイルの読み込みができるようになれば、サイトを見やすく装飾することができるし、後にAjaxを使用してサーバーにデータを送信することもできるようにもなる。

画像の表示もできるようになるので、実装しておいたほうが良いだろう。

[【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】](/post/django-static-file-settings/)

### Topicの個別ページを作る

urls.pyのパスコンバータを使うことで個別ページを作ることができる。

[【Django】パスコンバータ(URLに含まれた引数)を使って個別ページを表示させる](/post/django-single-page/)

この個別ページを作ることで、後続の削除と編集、リプライなどの機能の実装ができる。

### クライアント側からの削除と編集を実装させる

管理サイトによって、管理者側からは自由に削除と編集ができるが、クライアント側からは削除や編集はできない。

そこで、ビューを追加して対象のレコードを特定し、削除・編集を行う。編集時にはforms.pyによるバリデーションも行う。

[Djangoで投稿したデータに対して編集・削除を行う](/post/django-models-delete-and-edit/)

もし、自分が投稿したデータだけ削除・編集できるような形式にしたい場合、ユーザー認証が必要になる。

### モデルフィールドの追加

コメントだけでなく、名前や投稿日時なども入力させたり、表示させたりしたい場合、モデルにフィールドを追加する必要がある。

新しく追加されるモデルフィールドにdefault値が無い場合は、マイグレーションファイル作成時に警告が出るが、この解説も下記記事にて行っている。

[【Django】models.pyにフィールドを追加・削除する【マイグレーションできないときの原因と対策も】](/post/django-models-add-field/)

マイグレーション時に警告が出る原理・理由については下記を参照と良いだろう。

[DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】](/post/django-non-nullable/)

### 画像やファイルのアップロード

画像や動画等のファイルをアップロードさせるためには、モデルにフィールドを追加するだけでなく、専用のmediaディレクトリを作り、`settings.py`と`config/urls.py`に設定を施す必要がある。

アップロード時のビューの処理も通常の文字列の送信とは異なるため、やや難度が高い。

[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)

### トピックにカテゴリ選択やコメント投稿を実現させる。

トピックを投稿した時に、カテゴリを選択したり、特定のトピックに対してコメントを投稿する場合は、モデルに1対多のフィールドを追加する必要がある。

下記記事では`forms.py`を使ったバリデーションも行っている。

[【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示](/post/django-m2m-form/)

### ユーザー認証

SNSなどではクライアント側がIDとパスワードを入力してユーザー認証を行う必要がある。それを簡単に実現できるのが、django-allauth。

allauthのインストールと、`settigns.py`、`config/urls.py`の設定だけで実現できる。メール認証も実装できる。

[【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)

### canvasで描画した画像をAjaxで送信

ブラウザで描画した絵をAjaxでアップロードする。Ajaxに加えcanvasの扱いなども解説されているため、とても難易度は高い。

[【Django】canvasで描画した画像をAjax(jQuery)で送信【お絵かきBBS、イラストチャット、ゲームのスクショ共有などに】](/post/django-canvas-send-img-by-ajax/)

