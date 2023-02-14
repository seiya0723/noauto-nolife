---
title: "DjangoをAWSのEC2(Ubuntu)にデプロイする"
date: 2021-07-18T09:45:32+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","デプロイ","AWS","EC2","上級者向け" ]
---

Herokuとは違ってサーバーが日本にもあり、なおかつ課金すれば大型のウェブアプリでもインターネット上に公開できる、それがAWS。

本記事ではAWSのEC2を使用し、デプロイ工程を解説する。

<!--
## デプロイ対象のコード

ソースコードは以下。

https://github.com/seiya0723/django_fileupload

作り方は下記を参照。

[Djangoで画像及びファイルをアップロードする方法](https://noauto-nolife.com/post/django-fileupload/)
-->


## 必要な知識

手順通りこなせばデプロイはできるが、作業の意味を理解するには、以下の知識を要する。

- ネットワーク、データベース、セキュリティの知識
- Linuxのコマンド(cp,mkdir,mv,cdなど)
- vimやnanoなどのCUI系エディタの操作方法
- 公開鍵認証方式を使用したSSH(sshとscpコマンド)
- Nginxのログの確認方法
- PostgreSQLにて、ユーザーとDBの作成
- AWS無料利用枠について
- サーバー版Ubuntuについて

一部下記で解説してある。

- [ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】](/post/startup-web-application-framework/)
- [Nginxのログをチェックする、ログの出力設定を変更する](/post/nginx-log-check/)
- [PostgreSQLインストールから、ユーザーとDBを作る](/post/startup-postgresql/)
- [AWSでなるべくお金がかからないようにウェブアプリを運用する方法](/post/aws-do-not-spend-money/)
- [UbuntuにSSHでリモートログインする方法【パスワード認証+公開鍵認証+scpコマンド】](/post/ubuntu-ssh/)
- [nanoエディタの操作方法](/post/startup-nano-editor/)

## 手順

1. EC2にてインスタンスを作る
1. インスタンスへSSH接続
1. インスタンスの.bashrcの設定変更、Python等の必要なパッケージをインストールする
1. PostgreSQLの設定
1. プロジェクトディレクトリをscpでアップロード 
1. settings.pyの書き換え
1. systemdにgunicornの自動起動を指定
1. Nginxの設定
1. マイグレーション
1. 静的ファイル配信
1. インバウンドにHTTPアクセスの許可

インスタンスを作ってSSHでログインするまでは、下記リンクに書かれたUbuntuへのデプロイと差異は殆ど無い。

[UbuntuにDjangoをデプロイする【PostgreSQL+Nginx、Virtualenv使用】](/post/django-deploy-ubuntu-venv/)

<!--
[DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】](/post/django-deploy-linux/)

ただし、今回はUbuntuに直にpip3コマンドを実行してPythonライブラリをインストールするのではなく、仮想環境virtualenvを使用してライブラリをインストールする。これで開発環境とデプロイ環境でライブラリのバージョンが一致する。
-->

## EC2にてインスタンスを作る

オレンジ色のインスタンスの起動をクリック、

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-24-19.png" alt="インスタンス作成"></div>

Amazonマシンイメージ(OSのこと)はUbuntuを選択する。スクロールしてUbuntuが64ビット(x86)になっていることを確認して『選択』をクリック

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-26-42.png" alt="マシンイメージの選択"></div>

インスタンスタイプはデフォルトの無料枠の対象のままでOK、『次のステップ』をクリックして任意の設定を施す。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-44-30.png" alt="インスタンスタイプの選択"></div>

インスタンスの設定、及び、ストレージの追加、タグの追加はそのままデフォルトでOK、セキュリティグループの設定ではSSHのアクセスをマイIPからのみ許すように設定。

これでAWSのサーバーへSSHを利用できるのは自分だけ。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-48-43.png" alt="マイIPからのみSSHを許可"></div>

確認したら、起動を押す。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-51-16.png" alt="起動を押す"></div>

SSHを利用するには専用の秘密鍵を生成する必要がある。先ほどの起動ボタンを押すと、下記のようなダイアログが出てくるので、新しいキーペアの作成を選び、適当なキーペア名を指定して、キーペアのダウンロードを押す。


<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-55-17.png" alt="キーペアの作成"></div>

上記の場合、seiya0723-aws.pemという秘密鍵ファイルが生成され、ダウンロードされる。DLできたらインスタンスの作成をクリックする。

この秘密鍵ファイルは再DLはできないので、別途USBメモリなどに保管するなどバックアップを取り、なおかつファイルが外部に漏れないよう、厳重に管理する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-00-26.png" alt="インスタンス作成完了"></div>

これでEC2のインスタンスが生成できた。

## インスタンスへSSH接続

自分のPCの端末(Windowsの場合はPowerShellもしくはTeraterm)から、先ほど生成したSSHの秘密鍵を使ってインスタンスへ接続を行う。

まず、先ほどDLした秘密鍵のディレクトリまで移動して、権限を所有者のみ読み取り権限に変更する。

この所有者のみ読み取りの権限ありに設定しないと、SSHでログインはできない。(英語で権限が多すぎると言われる。)

    chmod 400 seiya0723-aws.pem

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-10-37.png" alt="所有者読み取りのみ可"></div>

権限をこのようなすれば完了。

Windowsの場合は`icacls`コマンドから秘密鍵に所有者の読み取り権限のみを付与する。詳細は下記

- 参照1: https://qiita.com/sumomomomo/items/28d54e35bfa5bc524cf5
- 参照2: https://qiita.com/uttne/items/7bfa4e820834f7f54be8


そして、その秘密鍵を使って`ssh`コマンドを実行する。

    ssh -i "seiya0723-aws.pem" ubuntu@[パブリックIPv4 DNS]

パブリックIPv4 DNSはインスタンスの画面から確認できる。赤で塗りつぶした部分から、amazonaws.comまでをパブリックIPv4 DNSに指定

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-15-39.png" alt="パブリックIPv4 DNS"></div>

上記コマンドを実行すると、`Are you sure you want to continue connecting (yes/no)?`と聞かれるので、`yes`を入力してEnterを押す。

これでインスタンスへのSSHに成功する。ターミナルの左端のユーザー名、リモートホスト名が変わったらOK

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-20-23.png" alt="ログイン成功"></div>

## インスタンスの.bashrcの設定変更、Python等の必要なパッケージをインストールする


### bashの設定を変更する

まず、インスタンスのbashの設定を変更する。

    vi ~/.bashrc

nanoエディタを使いたい場合は下記。使い方は『[nanoエディタの操作方法](/post/startup-nano-editor/)』へ

    nano ~/.bashrc

下記のように記述。

    HISTSIZE=100000
    HISTFILESIZE=200000
    HISTTIMEFORMAT='%y/%m/%d %H:%M:%S '

この設定を読み込ませる。これでhistoryコマンドを打つとコマンドを打った日付が確認できて便利。

    source ~/.bashrc


### パッケージの更新とインストール

全パッケージの更新

    sudo apt update && sudo apt -y upgrade && sudo apt -y autoremove

pip、PostgreSQL、Nginx等、必要なパッケージをインストール

    sudo apt install python3-pip python3-dev libpq-dev postgresql postgresql-contrib nginx

virtualenvのインストール

    sudo pip3 install virtualenv

## PostgreSQLの設定

PostgreSQLにて、DBとそのDBにアクセスするユーザーを作る。

詳しくは下記リンクを参照。

[PostgreSQLインストールから、ユーザーとDBを作る](/post/startup-postgresql/)


## プロジェクトディレクトリをscpでアップロード 

scpコマンドを実行し、Djangoのプロジェクトのディレクトリを任意の場所にアップロードする。今回は、[UbuntuにDjangoをデプロイする【PostgreSQL+Nginx、Virtualenv使用】](/post/django-deploy-ubuntu-venv/)に倣って、`~/Documents/`に格納する。

まず、EC2へログインした状態でDocumentsディレクトリを作る。

    mkdir ~/Documents

Ctrl+Dを押してログアウトをする。

`~/Documents/プロジェクト名/`にプロジェクトのファイル一式をコピーする。再帰的にアップロードする`-r`オプションもつける。(※`-ri`であり`-ir`ではない)。

    scp -ri "seiya0723-aws.pem" ./[プロジェクト名]/ ubuntu@[パブリックIPv4 DNS]:~/Documents/

### Djangoプロジェクトに必要なライブラリのインストール

再びSSHでEC2へログインし、先ほどアップロードしたディレクトリに移動して、仮想環境を作成し、有効にしておく。必要なライブラリをインストール。(※pycharm等ですでに手元で仮想環境を使っている場合、この工程はスキップする。)

    virtualenv venv
    source ./venv/bin/activate
    pip install django gunicorn psycopg2 psycopg2-binary
    
もし、すでにvenvがある場合、ファイル数が多いvenvはscpでアップロードせず、予めrequirements.txtを作っておき、以下のようにrequirements.txtに書かれてあるライブラリをインストールさせる。

    # ローカルにて
    source ./venv/bin/activate
    pip freeze > requirements.txt

    #venvを削除した上で、scp。その後sshでログイン
    source ./venv/bin/activate
    pip install -r requirements.txt

こうすることで、venvをそのままアップロードするよりも時間がかからない。
    

## settings.pyの書き換え


settings.pyの末端に下記を追記する。

    #予めDEBUGをFalseにしておく
    DEBUG = False
    
    if not DEBUG:
        ALLOWED_HOSTS = [ "ここにパブリックIPv4アドレスを" ]
    
        SECRET_KEY  = "ジェネレートしたシークレットキーをここに書く"
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql_psycopg2',
                'NAME': 'ここに先に作ったDBの名前を',
                'USER': 'ここに先に作ったユーザーの名前を',
                'PASSWORD':'ここに先に作ったユーザーのパスワードを',
                'HOST': 'localhost',
                'PORT': '',
            }
        }
    
        STATIC_ROOT         = "/var/www/{}/static".format(BASE_DIR.name)

        #下記はファイルのアップロード機能を有する場合のみ
        MEDIA_ROOT          = "/var/www/{}/media".format(BASE_DIR.name)


`SECRET_KEY`はここで再度ジェネレートしておく。

参照: [【Django】settings.pyのSECRET_KEYを再発行(リジェネレート)する【alias登録で即生成・即実装からの再起動】](/post/django-secret-key-regenerate/)

この`STATIC_ROOT`及び`MEDIA_ROOT`で指定している`/var/www/[プロジェクト名]/`は存在しないので、作る必要がある。

    sudo mkdir /var/www/[プロジェクト名]/

所有者とグループはrootになっているので、所有者はubuntu、グループはwww-dataに書き換える。

    sudo chown ubuntu:www-data /var/www/[プロジェクト名]/

mediaとstaticまでは作る必要はない。Djangoが自動的に作ってくれる。


## systemdにgunicornの自動起動を指定

systemdとは、Linuxにおいてシステムを起動する際、同時に起動させる仕組みのこと。

- https://www.designet.co.jp/faq/term/?id=c3lzdGVtZA
- https://qiita.com/bluesDD/items/eaf14408d635ffd55a18
- https://hogetech.info/linux/base/systemd

先ほど仮想環境にインストールさせたgunicornを自動起動させるため、以下の`.service`ファイルを作る。これをsystemdに登録する。

    sudo vi /etc/systemd/system/gunicorn.service

中身は下記

    [Unit]
    Description=gunicorn daemon
    After=network.target
    
    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/Documents/[プロジェクト名]
    ExecStart       =/home/ubuntu/Documents/[プロジェクト名]/venv/bin/gunicorn --access-logfile - --workers 3 \
                     --bind unix:/home/ubuntu/Documents/[プロジェクト名]/[プロジェクト名].socket config.wsgi:application
    
    [Install]
    WantedBy=multi-user.target


例えば、`[プロジェクト名]`が`startup_bbs`であればこうなる。

    [Unit]
    Description=gunicorn daemon
    After=network.target
    
    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/Documents/startup_bbs
    ExecStart       =/home/ubuntu/Documents/startup_bbs/venv/bin/gunicorn --access-logfile - --workers 3 \
                     --bind unix:/home/ubuntu/Documents/startup_bbs/startup_bbs.socket config.wsgi:application
    
    [Install]
    WantedBy=multi-user.target


ちなみにこのように書いてもOKだ。

    [Unit]
    Description=gunicorn daemon
    After=network.target
    
    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/Documents/startup_bbs
    ExecStart=/home/ubuntu/Documents/startup_bbs/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/ubuntu/Documents/startup_bbs/startup_bbs.socket config.wsgi:application
    
    [Install]
    WantedBy=multi-user.target


プロジェクトの`wsgi.py`は`config`ディレクトリの中に`urls.py`や`settings.py`と含まれているので、`config.wsgi.application`になる点にご注意。

仮想環境(`venv`)の場所は、プロジェクトディレクトリ(`[プロジェクト名]`)にあるので、そちらに指定している。

`systemd`のファイルはバックスラッシュ(`\`)を使うことで、改行することができる。セミコロン(`;`)を使うことでコメントアウトもできる。


起動させ、自動起動を有効化させる。

    sudo systemctl start gunicorn
    sudo systemctl enable gunicorn

この状態で、gunicornのステータスを確認する。

    sudo systemctl status gunicorn

下記の画像のように動いていればOK。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-38-53.png" alt="gunicorn.serviceが動いている"></div>

ここから離脱したいときは、qキーを押す。

もしここで赤丸でエラーが出る場合は、先程の`gunicorn.service`ファイルに何らかの誤りがあるか、Djangoプロジェクトのディレクトリ構造が誤っている可能性がある。

これで、DjangoとNginxをつなぐgunicornが動くようになった。次はNginxの設定である。

## Nginxの設定

次のファイルを作成し、Nginxの設定ファイルを作る。

    sudo vi /etc/nginx/sites-available/[プロジェクト名]

中身は下記

    server {
        listen 80;
        server_name [ここにパブリックIPv4アドレスを記入(※DNSではない)];
    
        #favicon.icoのログは記録しない
        location = /favicon.ico { access_log off; log_not_found off; }

        #静的ファイルの読み込み
        location /static/ {
            root /var/www/[プロジェクト名];
        }

        #以下はファイルアップロード機能を有する場合にのみ書く
        location /media/ {
            root /var/www/[プロジェクト名];
        }


        #前項で作ったgunicornのサービスがsocketを作るので、Nginxはそのsocketを読み取る。
        location / {
            include proxy_params;
            proxy_pass http://unix:/home/ubuntu/Documents/[プロジェクト名]/[プロジェクト名].socket;
        }

        #アップロード可能なファイルサイズの上限値 100MB
        client_max_body_size 100M;
    }

パブリックIPv4アドレスを指定する。そして、末端には`client_max_body_size`を指定する。これはアップロードできるファイルの容量上限値。100MBまでアップロードできるように設定した。これがないと、1MBまでしかアップロードできない。

`sites-enabled`にシンボリックリンクを作り、この設定を反映させる。

    sudo ln -s /etc/nginx/sites-available/[プロジェクト名] /etc/nginx/sites-enabled/

デフォルト設定のシンボリックリンクファイル( `/etc/nginx/sites-enabled/default` )は除外して、設定を再読込、nginxを再起動させる。

    # デフォルト設定を無効化(先程作った設定ファイルを有効にするため) 
    sudo unlink /etc/nginx/sites-enabled/default

    # Nginxの設定ファイルの動作確認(設定ファイル構文に問題なければsyntax is okと出る)
    sudo nginx -t 

    # 設定を再読込する
    sudo systemctl reload nginx

先ほどのgunicornと同様に、statusを確認して、動いていれば設定完了。

    sudo systemctl status nginx

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-50-11.png" alt="Nginxが動いている。"></div>

qキーを押して離脱できる。

ここで赤丸のエラーが出る場合は、Nginxの設定ファイルに何らかの誤りがある可能性が高い。

## マイグレーション

マイグレーションを実行する。

    python3 manage.py migrate

これの実行を忘れていると、もれなくサーバーエラーが表示されてしまう。

## 静的ファイル配信

staticファイルを配信する、下記コマンドを実行
    
    python3 manage.py collectstatic

このコマンドで予め作っておいた`/var/www/[プロジェクト名]/`にstaticディレクトリが作られ、その中に静的ファイルがコピーされる。

## インバウンドにHTTPアクセスの許可

ダッシュボードの左カラムから、『ネットワーク&セキュリティ』の中にある『セキュリティグループ』をクリック。任意のセキュリティグループをクリックして、インバウンドルールタブの`Edit inbound rules`をクリック。

ルールを追加して、タイプからHTTPを指定。ソースは自分のIPアドレスを指定する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-13-32.png" alt="自分の端末からHTTP通信を許可する。"></div>

これで、今EC2のダッシュボードを表示している端末のみ、HTTPを使ってデプロイしたウェブアプリを見ることが許可される。


### 【補足】開発用サーバーを使用したい時

もし、開発用サーバーを使いたい場合は、下記のようにカスタムTCPを選び、ポート番号は8000を指定して、ソースはマイIPを指定する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-23-34.png" alt="開発用サーバーのアクセスを許可する。"></div>

そして、開発用サーバーを起動する時は下記のコマンドを使う。

    python3 manage.py runserver 0.0.0.0:8000

これで、下記のリンクへアクセスすると、開発用サーバーを起動した内容が表示される。

    【パブリックIPv4アドレス(※DNSではない)】:8000


## デプロイしたウェブアプリへアクセス。

パブリックIPv4アドレスへアクセスすると、デプロイしたウェブアプリにアクセスできる。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 15-19-32.png" alt="デプロイ"></div>

Nginxの設定で指定したとおり、100MBまでのファイルのアップロードできる。

## AWS(EC2)の問題と解決策

最後に、EC2利用時における問題と解決策をまとめる。

### インスタンスを削除するには

インスタンスを終了させる。その後、自動的に削除される。そのため、EC2を一時停止にしたい場合は、インスタンスを停止を選ぶ。

https://qiita.com/shizen-shin/items/549087e77f1397bc1d92

終了は削除を意味する。

デプロイを終えた段階でインスタンスをうっかり終了してしまうと、また一からやり直しになってしまうので注意。


### gunicornでエラーが発生する場合はどうしたら良い？

もし`/etc/systemd/system/gunicorn.service`の内容を間違えずに記述して、それでもgunicornが立ち上がらないエラーが出てしまう時がある。

<div class="img-center"><img src="/images/Screenshot from 2022-10-10 12-43-42.png" alt=""></div>

こういう時は、Djangoの構文エラーを疑った方が良いだろう。

gunicornがDjangoのwsgi.pyを読み込む時、Djangoの中に構文エラーがあると、このように起動に失敗する。しかもこのようにDjango側の具体的なエラーメッセージが表示されないため、gunicornに問題があると思ってしまう。

ハマる原因になるので、Djangoの構文エラーを確かめる

```
python3 manage.py runserver
```

これで表示されるエラー内容を確認し、適宜修正をする。


### 502 Bad Gatewayエラーはどうすればいい？

まず、Nginxのエラーログを確認する

    less /var/log/nginx/error.log

socketファイルのアクセス権に関するエラーが書かれてある場合、`~/Documents/[プロジェクト名]/`までのパーミッションが755になっていることを確認する。

もし、755になっていない場合はそのように修正する。

とりわけ、最近のEC2インスタンスは、ホームディレクトリのアクセス権が、その他のユーザーの実行と読み込みの権限が割り当てられていないため、nginxがsocketファイルのアクセスに失敗してしまう。

この問題を解決するには、このコマンドを実行する。

    chmod 755 ~


詳細は下記を。

[Nginxのログをチェックする、ログの出力設定を変更する](/post/nginx-log-check/)


### Djangoのファイルを変更したのに、サイトに反映されない

Djangoのプロジェクト内に含まれるファイルを変更したにも関わらず、反映されないのは、サーバーを再起動していないから。

    sudo systemctl restart nginx gunicorn 

これを実行して、Djangoプロジェクトを再読込、サイトに反映させる。

特にsettings.pyを書き換えた後は、必ず上記コマンドを実行しないと反映されないので、注意。

### インスタンスを停止して、再起動したらSSHでログインできなくなった。

EC2のインスタンスに割り当てられているパブリックIPv4アドレスを使用して、SSHにログインをするが、このパブリックIPv4アドレスは、インスタンスの停止と再起動をもって、変わってしまう。

そのため、停止と再起動をした場合は、新しく割り当てられたパブリックIPv4アドレスをコピーしてsshコマンドを実行してログインをする必要がある。

もし、停止と再起動を繰り返しても、固定されたIPアドレスでSSHログインをしたい場合は、ElasticIPを使うと良いだろう。

[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)

### インスタンスをつけっぱなしにしていても、ある日突然SSHでログインできなくなった。

おそらく、SSHにログインするPCのグローバルIPアドレスが変わった可能性がある。

セキュリティグループの設定で、SSHをマイIPのみ許可していた場合、そのマイIPが変わったため、拒否されてしまった。

問題のインスタンスのセキュリティグループの設定へアクセスして、SSHを許可するIPアドレスを新しいマイIPに修正する。

これでログインできるようになる。

### 請求金額が尋常じゃない

おそらく、無料利用枠ではないインスタンスタイプ、マシンイメージを選んだか、インスタンスを多重起動してしまった可能性がある。

とりわけ、インスタンスの多重起動をすると、その数だけ無料で利用できる750時間を消費していくので、使用していないインスタンスは、その都度停止しておくと良い。

下記にお金がかからないようにAWSを利用する方法が書かれてある。

[AWSでなるべくお金がかからないようにウェブアプリを運用する方法](/post/aws-do-not-spend-money/)


### インスタンスが消えた！？

AWSで作業をしている時、急にこれまであったインスタンスが消える事がある。

その場合、リージョンが間違っている事が原因であることが多い。まずは画面の右上から東京リージョンになっていることを確認する。

例えば、リージョンがオハイオであれば、オハイオのEC2のインスタンスが表示されるため、これまで作ってきたリージョンが消えたように見える。



## 結論

これでEC2へのデプロイができるようになるが、実際にサービスを一般公開するとなるとドメインを指定する必要があるだろう。ムームードメインなどからドメインを手に入れ、それを割り当てる。.comドメインなどであれば一年で1000〜2000円程度で手に入る。

下記に方法が書かれてある。

[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)


また、このEC2はストレージが8GBほどしか無く、膨大なデータの取扱いや、大容量ファイルの共有には不向きである。そこで、ストレージにはS3、データベースにはRDSを別途指定する必要がある。S3であれば12ヶ月間5GBまで無料、RDSであれば12ヶ月間無料になっている。

EC2だけでなくRDS、S3も使用したデプロイ方法は下記を参照。

[DjangoをEC2(Ubuntu)、RDS(PostgreSQL)、S3の環境にデプロイをする](/post/django-deploy-ec2-rds-s3/)


## 参照元

https://qiita.com/tachibanayu24/items/b8d73cdfd4cbd42c5b1d

https://qiita.com/Bashi50/items/d5bc47eeb9668304aaa2#10-gunicorn%E3%81%AE%E8%A8%AD%E5%AE%9A

