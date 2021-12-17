---
title: "LaravelのHerokuデプロイがPHPバージョン問題で必ず失敗する問題は、バージョンアップで対処する【ERROR: Dependency installation failed!】"
date: 2021-12-17T11:24:38+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Heroku","デプロイ" ]
---

## 経緯

2021年12月某日、今日もLaravelのプロジェクトの開発を終え、『さあデプロイだ』とHerokuへデプロイをすると、下記のようなエラーメッセージが出た。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 11-21-49.png" alt=""></div>

## 原因

これまで、普通にデプロイできていて、今日になってなぜデプロイに失敗するのか。どこかで設定ファイルの編集ミスったかと思いあれこれ確認してみたが、原因はわからない。

そこでStackOverflowにて、検索してみると、同様のエラー報告がみられた。

- https://stackoverflow.com/questions/70352116/an-error-occurred-in-the-composer-during-deployment
- https://stackoverflow.com/questions/70358254/im-trying-to-deploy-a-laravel-a-project-on-heroku-but-im-getting-this-error-i

StackOverflowによると原因はHerokuのPHPのバージョン対応問題。2021年12月の段階で、Herokuが対応しているPHPのバージョンは下記の通り。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 11-30-14.png" alt=""></div>

参照元:https://devcenter.heroku.com/ja/articles/php-support

私のPHPのバージョンは、7.2

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 11-34-06.png" alt=""></div>

よって、今回のエラーが発生したと思われる。

そもそも、プッシュした時に、Heroku側はPHP 8.1.0をインストールしているのだから。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 11-33-10.png" alt=""></div>

## 対策(Ubuntu)

PHPのバージョンアップを行う。Herokuと同様に8.1をインストールする。

ただ、普通のUbuntu18.01ではaptコマンドを実行してもphp8.1をインストールする事はできない。PHPのリポジトリがないからだ。だから、PHPのリポジトリをまずインストールさせる。

    sudo apt update

    sudo apt install software-properties-common
    sudo add-apt-repository ppa:ondrej/php


上記コマンドを順次実行すると、下記の内容が表示される。
    
     Co-installable PHP versions: PHP 5.6, PHP 7.x and most requested extensions are included. Only Supported Versions of PHP (http://php.net/supported-versions.php) for Supported Ubuntu Releases (https://wiki.ubuntu.com/Releases) are provided. Don't ask for end-of-life PHP versions or Ubuntu release, they won't be provided.
    
    Debian oldstable and stable packages are provided as well: https://deb.sury.org/#debian-dpa
    
    You can get more information about the packages at https://deb.sury.org
    
    IMPORTANT: The <foo>-backports is now required on older Ubuntu releases.
    
    BUGS&FEATURES: This PPA now has a issue tracker:
    https://deb.sury.org/#bug-reporting
    
    CAVEATS:
    1. If you are using php-gearman, you need to add ppa:ondrej/pkg-gearman
    2. If you are using apache2, you are advised to add ppa:ondrej/apache2
    3. If you are using nginx, you are advised to add ppa:ondrej/nginx-mainline
       or ppa:ondrej/nginx
    
    PLEASE READ: If you like my work and want to give me a little motivation, please consider donating regularly: https://donate.sury.org/
    
    WARNING: add-apt-repository is broken with non-UTF-8 locales, see
    https://github.com/oerdnj/deb.sury.org/issues/56 for workaround:
    
    # LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
     詳しい情報: https://launchpad.net/~ondrej/+archive/ubuntu/php
    [ENTER] を押すと続行します。Ctrl-c で追加をキャンセルできます。


Enterキーを押して続行。完了したら、次のコマンドを実行し、php8.1をインストールさせる

    sudo apt install php8.1


インストール完了した後、下記コマンドを実行して、PHPのバージョン確認をする

    php --version


<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-20-42.png" alt=""></div>

ちなみに、先のPHP8.1インストールのコマンドを入力した状態でTabキーを押すと、8.1に対応した拡張パッケージの一覧が出てくる。

    php8.1                 php8.1-ds              php8.1-interbase       php8.1-oauth           php8.1-rrd             php8.1-vips
    php8.1-amqp            php8.1-enchant         php8.1-intl            php8.1-odbc            php8.1-smbclient       php8.1-xdebug
    php8.1-apcu            php8.1-fpm             php8.1-ldap            php8.1-opcache         php8.1-snmp            php8.1-xhprof
    php8.1-ast             php8.1-gd              php8.1-lz4             php8.1-pcov            php8.1-soap            php8.1-xml
    php8.1-bcmath          php8.1-gearman         php8.1-mailparse       php8.1-pgsql           php8.1-solr            php8.1-xmlrpc
    php8.1-bz2             php8.1-gmagick         php8.1-maxminddb       php8.1-phpdbg          php8.1-sqlite3         php8.1-xsl
    php8.1-cgi             php8.1-gmp             php8.1-mbstring        php8.1-protobuf        php8.1-ssh2            php8.1-yac
    php8.1-cli             php8.1-gnupg           php8.1-mcrypt          php8.1-ps              php8.1-swoole          php8.1-yaml
    php8.1-common          php8.1-grpc            php8.1-memcache        php8.1-pspell          php8.1-sybase          php8.1-zip
    php8.1-curl            php8.1-igbinary        php8.1-memcached       php8.1-psr             php8.1-tidy            php8.1-zmq
    php8.1-dba             php8.1-imagick         php8.1-mongodb         php8.1-raphf           php8.1-uopz            php8.1-zstd
    php8.1-decimal         php8.1-imap            php8.1-msgpack         php8.1-readline        php8.1-uploadprogress  
    php8.1-dev             php8.1-inotify         php8.1-mysql           php8.1-redis           php8.1-uuid            
これでPHP8.1に対応した拡張パッケージをインストールする事ができる。


## 再度Laravelプロジェクトを生成してHerokuにデプロイしてみる

デプロイの具体的な方法は下記を参照。

[LaravelをHerokuにデプロイする【Heroku-postgresql使用】](/post/laravel-heroku-deploy/)

まず、下記コマンドを実行してプロジェクトを作る。

    composer create-project --prefer-dist laravel/laravel after_update

この時点で、PHPが8.1になっているので、Laravelもバージョンが7.x系から8.x系になっていることがわかる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-26-38.png" alt=""></div>

だが、ここでプロジェクト生成に失敗した模様。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-30-52.png" alt=""></div>

[stackoverflow](https://stackoverflow.com/questions/43408604/php7-install-ext-dom-issue)によると、下記コマンドを実行し、php8.1-xmlをインストールする。

    sudo apt install php8.1-xml

ちなみに下記サイトによると、インストールしておいたほうが良い拡張パッケージ一覧が載っている。

https://www.cloudbooklet.com/how-to-install-or-upgrade-php-8-1-on-ubuntu-20-04/

    sudo apt install php8.1-common php8.1-mysql php8.1-xml php8.1-xmlrpc php8.1-curl php8.1-gd php8.1-imagick php8.1-cli php8.1-dev php8.1-imap php8.1-mbstring php8.1-opcache php8.1-soap php8.1-zip php8.1-redis php8.1-intl

とは言え、php8.1-xmlをインストールしたら無事プロジェクト作成できた。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-42-09.png" alt=""></div>

サーバーを立ち上げる。

    cd after_update
    php artisan serve

Laravel8.x系のデフォルト画面はこんな感じ。7.x系までとかなり雰囲気が変わっている。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-44-32.png" alt=""></div>

とりあえず、素の状態でデプロイする。Procfileを作る。

    echo "web: vendor/bin/heroku-php-apache2 public/" > Procfile

gitコマンドでローカルリポジトリを作る。

    git init 
    git add .
    git commit -m "1st commit"
    heroku git:remote -a [アプリ名]

プッシュすると、下記のエラーが出た。

    remote:  !     >   Problem 1
    remote:  !     >     - symfony/polyfill-mbstring dev-main requires php >=7.1 -> satisfiable by php[7.3.24, 7.3.25, 7.3.26, 7.3.27, 7.3.28, 7.3.29, 7.3.30, 7.3.31, 7.3.32, 7.3.33, 7.4.12, 7.4.13, 7.4.14, 7.4.15, 7.4.16, 7.4.19, 7.4.20, 7.4.21, 7.4.22, 7.4.23, 7.4.24, 7.4.25, 7.4.26, 8.0.0, 8.0.0RC4, 8.0.1, 8.0.10, 8.0.11, 8.0.12, 8.0.13, 8.0.2, 8.0.3, 8.0.6, 8.0.7, 8.0.8, 8.0.9, 8.1.0].

どうやらsymfonyのバージョン問題らしい。php8.1に対応したものをインストールする。

    sudo apt install php8.1-mbstring

インストール完了後、先ほど作った`after_update`をディレクトリごと削除して、一から同名のプロジェクトを作り、gitローカルリポジトリを作り、プッシュした。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 13-56-58.png" alt=""></div>

この状態でサイトにアクセスしても、500エラーが出る。

当たり前である。なぜなら許可するドメインを指定しておらず、アプリのセキュリティキーを生成して、Heroku側に指定していないから。

    #キーを生成する。
    php artisan key:generate --show
    #↑のコマンドで生成されたキーを↓に張り付け
    heroku config:set APP_KEY=[↑のコマンドのキーをbase64:から記入]
    #公開するサイトのドメインを指定
    heroku config:set APP_URL=[アプリ名].herokuapp.com

デプロイ成功した。ここまで調べながらだったので3〜4時間ぐらい掛かったと思う。

<div class="img-center"><img src="/images/Screenshot from 2021-12-17 14-13-02.png" alt=""></div>

## 結論

PHP8.1も2024年でサポート切れるので、同様の問題が発生しうるだろう。PHPはPythonと違ってコロコロバージョンが変わるので、それに対応しなければならないのは辛い。

参照元:https://www.php.net/supported-versions.php

