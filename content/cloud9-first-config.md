---
title: "【AWS】Cloud9使う時にすぐやる設定【bashrc、Django等】"
date: 2021-02-16T09:42:06+09:00
draft: false
thumbnail: "images/aws.jpg"
categories: [ "サーバーサイド" ]
tags: [ "初心者向け","bash","スタートアップシリーズ","cloud9","django" ]
---

Cloud9を使う時にやっておく設定をまとめる。

注意事項としてAWS、Cloud9はいずれも頻繁にバージョンアップを行っている仕様上、ここに書かれている情報では再現できない可能性がある。もし、Cloud9のバージョンアップによる不具合や動作不良などを気にされる場合は、ローカル環境に開発環境を構築すると良い。

## Bashの設定関係


### コマンド履歴に日時を表示させる

`~/.bashrc`を下記のように編集する。

    export HISTSIZE=100000
    export HISTFILESIZE=100000
    export HISTTIMEFORMAT='%y/%m/%d %H:%M:%S ' #←追加
    export PROMPT_COMMAND="history -a;"

これで`history`コマンド実行時に日付が表示されるようになる。

## Djangoのインストール

### venvを構築する

venvを構築しておけば、pipを使用してインストールしたライブラリのバージョン管理などが可能になる。まずは下記コマンドを実行する。

    virtualenv --no-site-packages venv

venvをアクティブにする。

    source ./venv/bin/activate

### pipでDjangoをインストール

下記コマンドを実行する。2021年2月時点でLTSのDjango2.2をインストールする。

    pip install django==2.2

下記コマンドでバージョン確認。2.2と表示されればOK

    django-admin --version

### プロジェクトを作る

下記コマンドを実行してプロジェクトを作る。

    mkdir django-project
    cd django-project    
    django-admin startproject config .

`config`ディレクトリと、`manage.py`が生成されれば完了。


### データベースにMariaDBをインストール、settings.pyにてDB設定書き換え

Cloud9ではDjangoのデフォルトのSQLiteはバージョン問題につき使用することはできない。そこで、MySQL及びMariaDBを使用する方法を解説する。Cloud9におけるパッケージ管理ツールはyumのため、下記コマンドを実行する。

    sudo yum install mariadb-server    

`systemctl`から自動機能を有効化及び、起動させる。

    sudo systemctl enable mariadb
    sudo systemctl start mariadb

DB操作用のPythonライブラリであるmysqlclientをインストールする。

    pip install mysqlclient

データベースを作る。今回はDBを扱うユーザーの作成作業は省略し、rootからアクセスする。セキュリティ上の問題があるので、デプロイ先ではやらないように。

    mysql -uroot -p

    Enter Password:     ←そのままEnterキーを押す(デフォルトではパスワードは空)

    MariaDB [(none)]> create database django_db;    ←DBを作る
    MariaDB [(none)]> show databases;               ←作ったDBが表示されればOK

settings.pyにて、DATABASESの設定を以下のように書き換える

    """
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
    """
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": "django_db",
            "USER": "root",
            "PASSWORD": "",
            "HOST": "localhost",
            "PORT": "3306"
        }
    }


これでDBの設定は完了。マイグレーションができるようになる。


### 開発用サーバー起動

通常、ローカルの環境でサーバーを起動する時、下記コマンドを実行するが、これでは動作しない

    python3 manage.py runserver 127.0.0.1:8000

Cloud9では開発用サーバーのIPアドレスとポート番号は環境ごとによって異なるからだ。そこでCloud9では下記コマンドを実行して、開発用サーバーを起動させる

    python3 manage.py runserver $IP:$PORT

ただし、上記コマンドを実行しても`You may need to add '[省略].amazonaws.com' to ALLOWED_HOSTS.`と表示されるので、`[省略].amazonaws.com`を`settings.py`の`ALLOWED_HOSTS`に入れる

これで、Djangoが起動した。

<div class="img-center"><img src="/images/Screenshot from 2021-02-17 09-46-11.png" alt="開発サーバーが起動した"></div>

## Laravelのインストール

近日公開予定

## Railsのインストール

近日公開予定


## 結論

Cloud9はインターネットさえあればどこでも開発環境を構築可能で、複数人で同時に開発を行うこと(ペア・プログラミング)ができると言う点でメリットがあるが、あくまでもクラウド上の開発環境であるため一部の機能が制限されていたり、デプロイに手間取る可能性もある。それにバージョンがコロコロ変わるのもいかがかと思う。(この方法もいずれは通用しなくなる。)

クレジットカードを使わないと利用できない上に、1年過ぎたら従量課金制で有料になってしまうことも、実機もしくはVirtualBox上に直接Linuxをインストールする方式(永久に無料)の方が優れていると、作業をしていてひしひしと感じた。


