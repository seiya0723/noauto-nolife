---
title: "DjangoをDEBUG=FalseでHerokuにデプロイする方法"
date: 2020-10-26T11:16:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","heroku","デプロイ","git" ]
---

プロジェクトのディレクトリ構造は、『現場で使えるDjangoの教科書 基礎編』に準拠している。

<!--
## クラウドにインストールさせるライブラリの定義(requirements.txt) 

pycharm等の統合開発環境を使用していて、仮想環境が動いている場合(既にターミナルの左側に(venv)等の表示がされている場合)、下記コマンドを実行して、requirements.txtを生成する。

    pip freeze > requirements.txt


もし、仮想環境を使用していない場合、virtualenvを使って必要なライブラリをpipコマンドにてインストールする。
-->

## HerokuCLIをインストール

Herokuではherokuコマンドを実行して、事前にログインをした上でデプロイを行う。下記からインストールする。

https://devcenter.heroku.com/ja/articles/heroku-cli

herokuコマンドを実行して、デプロイ先のサーバーでマイグレーション等の操作を行うためにある。

### 【補足1】Herokuコマンドが使えない。

Windowsの場合、HerokuCLIをインストール直後にherokuコマンドを実行しようとしても、コマンドとして認識されないことがある。

そんな時は、PCを再起動するとherokuコマンドが使えるようになる。

## Herokuのアカウント作成、アプリ作成から設定まで

予め[Herokuのアカウント](https://signup.heroku.com/jp)を作っておく。クレジットカード不要で必要なものはメールアドレスだけ。

まずはHerokuアカウントからデプロイ先として指定するアプリを作る。ダッシュボードにアクセスすると下記画面が見える。右上のNEWをクリックする。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-08-22.png" alt="ダッシュボードから新しいアプリを作る"></div>

ツールチップが表示されるので、Create new appをクリック。

app nameを指定する。サーバーのリージョン(居場所)はアメリカを指定注意:無料アカウントでは作成できるアプリの数の上限は5個。それ以上は作れないため注意。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-10-51.png" alt="アプリの名前指定"></div>

端末からHerokuにログインする。

    heroku login

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-12-11.png" alt="Herokuログイン"></div>

## DBのパスワード、ホスト名などを控える

Heroku側にはDBのPostgreSQLが用意されている。そのパスワードとホスト名等を控え、settings.pyに書き込むことでDBが使用できる

デフォルトではpostgresqlは実装されていないため、実装する必要がある。まずはHerokuのResourceタブをクリックする。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-13-43.png" alt="Resourcesをクリック"></div>

Add-onsにて、postgresと入力する。Heroku Postgresをクリック

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-14-42.png" alt="Add-ons追加"></div>

Submit Order Formをクリック。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-15-39.png" alt="herokupostgresの追加画面"></div>

このような表示がされれば問題なく利用できる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-16-36.png" alt="HerokuPostgres設定完了"></div>

Heroku Postgres のリンクをクリック、Settingsタブをクリック。View Credentialsをクリック

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-19-08.png" alt="View Credentials"></div>

DBの使用に必要なユーザー名、DBの名前、パスワードなどが表示される。これを後のsettings.pyに書き込む。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-19-57.png" alt="View Credentials"></div>

## settings.pyの設定

下記に倣ってsettings.pyを書き換える。DEBUGモードの無効化をお忘れなく。

    # DEBUGモードを無効化
    # DEBUG = True
    DEBUG = False

    # 静的ファイルの読み込み設定がwhitenoiseに影響が及ぶので、デバッグ時にのみ有効にしておく。
    if DEBUG:
        STATICFILES_DIRS = [ BASE_DIR / "static" ]


    if not DEBUG:

        # ALLOWED_HOSTSにホスト名)を入力
        ALLOWED_HOSTS = [ 'hogehoge.herokuapp.com' ]

        # 静的ファイル配信ミドルウェア、whitenoiseを使用。※ 順番不一致だと動かないため下記をそのままコピーする。
        MIDDLEWARE = [
            'django.middleware.security.SecurityMiddleware',
            'whitenoise.middleware.WhiteNoiseMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
            'django.middleware.clickjacking.XFrameOptionsMiddleware',
            ]

        # DBを使用する場合は下記を入力する。
        DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.postgresql_psycopg2',
                    'NAME': '',
                    'USER': '',
                    'PASSWORD': '',
                    'HOST': '',
                    'PORT': '5432',
                    }
                }

        #HerokuPostgresの接続方法(SSL使用、接続の有効時間は600秒)
        import dj_database_url
        db_from_env = dj_database_url.config(conn_max_age=600, ssl_require=True)
        DATABASES['default'].update(db_from_env)

        # 静的ファイル(static)の存在場所を指定する。
        STATIC_ROOT = BASE_DIR / 'static'

        #osモジュールを使う場合はこちら。
        #STATIC_ROOT = os.path.join(BASE_DIR, 'static')



settings.pyの修正を終えたら、pipコマンドでデプロイ後に必要になるライブラリをインストールさせる。

    pip install django-heroku dj-database-url gunicorn whitenoise psycopg2

requirements.txtにて控えを用意する。このrequirements.txtに基づき、Herokuにデプロイ時にライブラリがインストールされる。

    pip freeze > requirements.txt

gunicorn(ウェブサーバーとDjangoをつなげるライブラリ)の設定を施す。下記コマンドを実行する。

    echo "web: gunicorn config.wsgi:application --log-file -" > Procfile


<!--
サーバー起動用のファイルを作る。

    echo "web: python manage.py runserver 0.0.0.0:5000" > Procfile.windows

-->


### 【補足1】Windowsで作った設定ファイル類がHeroku上で読めない

Windowsの場合、echoコマンドを実行したときの文字コードがUTF-8ではないため、Heroku上で読むことができない。

そんな場合は統合開発環境から、ファイルを作り、echoのダブルクオーテーションで囲んだ部分を記入すると良いだろう。

つまり、

    echo "web: gunicorn config.wsgi:application --log-file -" > Procfile

であれば、`Procfile`というファイルを作り、その中に`web: gunicorn config.wsgi:application --log-file -`と書き込む。

これでHerokuが読める設定ファイルになる。

### 【補足2】wsgi.pyを格納しているディレクトリ名が違うため、デプロイに失敗する

もし、settings.pyやurls.pyなど設定ファイル関係を格納しているディレクトリが、configではなく、プロジェクト名である場合、下記は間違いである。

    echo "web: gunicorn config.wsgi:application --log-file -" > Procfile

仮にディレクトリ名がconfigではなくmyprojectの場合、下記のように修正する必要がある。

    echo "web: gunicorn myproject.wsgi:application --log-file -" > Procfile

つまり、設定ファイル関係を格納するディレクトリにある、wsgi.pyを参照して動かしているということ。

wsgi.pyを格納しているディレクトリ名が違うとデプロイに失敗する。


## いざデプロイ

プロジェクトをgitで管理する。gitでコミットする。

    git init
    git add .
    git commit -m "heroku deploy"

Herokuのデプロイ先とローカルリポジトリを関連付ける。

ダッシュボードからDeployタブをクリックした時に表示される下記画像に倣ってコマンドを打つ。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-22-11.png" alt="リポジトリの関連付け"></div>

    heroku git:remote -a アプリの名前

<!--
デフォルトでは静的ファイルを再配置するcollectstaticコマンドがデプロイ後に自動実行されるようになっている。上記設定であればcollectstaticコマンドは自動実行しなくても良いので、下記コマンドを実行

    heroku config:set DISABLE_COLLECTSTATIC=1
-->

この状態で、デプロイする。下記コマンドを実行してherokuにプッシュ。`git push origin master `ではない点に注意。

    git push heroku master

ターミナルに表示されるページにアクセスする。アプリがスリープ中の場合、復帰しないといけないため、ブラウザに表示されるまでに1分程度かかる。エラーではない。

### 【補足1】gitでcommitできない

Herokuデプロイを境に初めてgitをインストールして使う場合、事前にやっておくことがある。コミットするユーザーの名前とメールアドレスの登録である。

    git config --global user.name "John Doe"
    git config --global user.email johndoe@example.com

これをやっておかないとコミットすることができない。

参照:https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration

## デプロイ後の設定

DBを使用するタイプのウェブアプリであればデプロイ後にマイグレーションの実行する必要がある。

    heroku run python3 manage.py migrate

初期データをインプットするのであれば下記コマンドも実行。

    heroku run python3 manage.py loaddata ./アプリ名/fixture/jsonファイル


## 環境変数の設定

例えば、`EMAIL_BACKEND`に値を入れたい場合、下記のように指定すれば良い。

    heroku config:set PASSWORD="password"


Python側から読む時、以下のようにする。

    import os
    PASSWORD_LIST = [ os.environ['PASSWORD'] ]


これでパスワードなどの情報をsettings.pyに直接書かなくても済む


## 動かないときの対策

設定はしっかりしているのに、エラーが出てしまう場合、下記コマンドを実行してDoneが表示されれば正常に設定が再読込され、動くようになる。

    heroku ps:scale web=1

## 結論

Herokuデプロイでつまずく最大の原因は、余計なものをsettings.pyに書いてしまうこと。

特にHerokuにはストレージがないので、メディアファイルの扱いをsettings.pyに書くともれなく500エラーが返ってくる。ファイルのアップロード関係のウェブアプリを作る予定であれば、別途S3等の外部クラウドストレージを用意してあげましょう。

それからwhitenoiseの位置にも注意。INSTALLED_APPSの順序間違えると動かない。

requirements.txtの記述にも注意が必要。pip freezeコマンドを忘れずに。

<!--
ちなみにこの方法だと別途管理サイト(admin)のCSSを用意してあげる必要がある。[Django公式のGitHub](https://github.com/django/django)からDLして設置すればよろし。
-->


### 【補足】ストレージありのデプロイはどうする？

下記を参照する。

[DjangoをHeroku+Cloudinary(基本無料ストレージ)の環境にデプロイする【ウェブアプリのデモを一般公開したい場合などに】](/post/django-deploy-heroku-cloudinary/)

ストレージであるCloudinaryを使う。前もってクレジットカードの登録が必要。

