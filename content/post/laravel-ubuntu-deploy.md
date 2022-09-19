---
title: "LaravelをUbuntuにデプロイする【Nginx+PostgreSQL】"
date: 2021-04-13T19:09:40+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Ubuntu","デプロイ","nginx","PostgreSQL" ]
---

## 構成について

タイトルの通り、下記構成にてデプロイを行う

- Laravel Framework 7.30.4
- Ubuntu 18.04
- nginx version: nginx/1.14.0 (Ubuntu)
- psql (PostgreSQL) 10.16 (Ubuntu 10.16-0ubuntu0.18.04.1)


### なぜPostgreSQLなのか？(MySQLではないのか？)

MySQLは使わない。なぜなら、Laravelの`timestamp`型と`MySQL`が組み合わさると[2038年問題](https://ja.wikipedia.org/wiki/2038%E5%B9%B4%E5%95%8F%E9%A1%8C)が発生するから。

コード側を合わせるという方法もあるが、今回はデプロイが主目的であるため、安全なPostgreSQLでデプロイする。

https://qiita.com/ucan-lab/items/99ee14ad6bb24614980c

## デプロイまでの流れ

1. php拡張パッケージ、composerをインストール
1. Nginx、PostgreSQLをインストール
1. PostgreSQLにてDBとユーザー作成
1. .env設定からマイグレーション
1. Nginxの設定
1. プロジェクトの配置と権限付与
1. Nginxの再起動
1. 動作チェック


## php拡張パッケージ、composerをインストール

まず、phpと拡張パッケージ。mysqlを使う場合、php7.2-mysqlをインストール。

    sudo apt install php7.2 php7.2-fpm php7.2-zip php7.2-gd php7.2-pgsql
    sudo apt install php-mbstring php-xml php-json 

続いて、composer

    curl https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    composer --version

## Nginx、PostgreSQLをインストール

    sudo apt install postgresql nginx

## PostgreSQLにてDBとユーザー作成

    sudo -u postgres -i

    createuser --createdb --username=postgres --pwprompt laraveluser

    createdb laraveldb --owner=laraveluser

パスワードは控えておく。詳しくは下記記事を参照。

[PostgreSQLインストールから、ユーザーとDBを作る](/post/startup-postgresql/)

## .env設定からマイグレーション


プロジェクトディレクトリ直下の`.env`を書き換え。

    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=laraveldb
    DB_USERNAME=laraveluser
    DB_PASSWORD=[パスワード]

マイグレーション。これでDBの設定は完了

    php artisan migrate


## Nginxの設定

予め設定ファイルのバックアップを取ってから編集する。

    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default_origin

    sudo vi /etc/nginx/sites-available/default

下記のように編集。

    ##
    # You should look at the following URL's in order to grasp a solid understanding
    # of Nginx configuration files in order to fully unleash the power of Nginx.
    # https://www.nginx.com/resources/wiki/start/
    # https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/
    # https://wiki.debian.org/Nginx/DirectoryStructure
    #
    # In most cases, administrators will remove this file from sites-enabled/ and
    # leave it as reference inside of sites-available where it will continue to be
    # updated by the nginx packaging team.
    #
    # This file will automatically load configuration files provided by other
    # applications, such as Drupal or Wordpress. These applications will be made
    # available underneath a path with that package name, such as /drupal8.
    #
    # Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
    ##
    
    # Default server configuration
    #
    server {
    	listen 80 default_server;
    	listen [::]:80 default_server;
    
    	# SSL configuration
    	#
    	# listen 443 ssl default_server;
    	# listen [::]:443 ssl default_server;
    	#
    	# Note: You should disable gzip for SSL traffic.
    	# See: https://bugs.debian.org/773332
    	#
    	# Read up on ssl_ciphers to ensure a secure configuration.
    	# See: https://bugs.debian.org/765782
    	#
    	# Self signed certs generated by the ssl-cert package
    	# Don't use them in a production server!
    	#
    	# include snippets/snakeoil.conf;
    
    	root /var/www/[プロジェクト名]/public; #←任意のプロジェクト名のpublicのindex.phpを読み込ませる
    
    	# Add index.php to the list if you are using PHP
    	index index.php index.html index.htm index.nginx-debian.html;
    
    	server_name [IPアドレス、ドメイン名]; #←デプロイするサーバーのドメイン名もしくはIPアドレスを指定
    
    	#location / {
    	#	# First attempt to serve request as file, then
    	#	# as directory, then fall back to displaying a 404.
    	#	try_files $uri $uri/ =404;
    	#}
        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ /index.php?$query_string; # ←追加
        }
    
    
    
    	# pass PHP scripts to FastCGI server
    	#
    	#location ~ \.php$ {
    	#	include snippets/fastcgi-php.conf;
    	#
    	#	# With php-fpm (or other unix sockets):
    	#	fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
    	#	# With php-cgi (or other tcp sockets):
    	#	fastcgi_pass 127.0.0.1:9000;
    	#}
    	
        #↓追加。FastCGI(php-fpm)関係の設定
        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        location ~ \.php$ {
                try_files $uri =404;
                fastcgi_split_path_info ^(.+\.php)(/.+)$;
                fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
        }
    
    	# deny access to .htaccess files, if Apache's document root
    	# concurs with nginx's one
    	#
    	#location ~ /\.ht {
    	#	deny all;
    	#}
    }
    
    
    # Virtual Host configuration for example.com
    #
    # You can move that to a different file under sites-available/ and symlink that
    # to sites-enabled/ to enable it.
    #
    #server {
    #	listen 80;
    #	listen [::]:80;
    #
    #	server_name example.com;
    #
    #	root /var/www/example.com;
    #	index index.html;
    #
    #	location / {
    #		try_files $uri $uri/ =404;
    #	}
    #}

## プロジェクトの配置とストレージディレクトリの作成

プロジェクトをコピペする。

    sudo mkdir /var/www/[プロジェクト名]/
    sudo cp -r [プロジェクト名]/* /var/www/[プロジェクト名]

ファイルのアクセス権、所有者を書き換え。

    sudo chown -R :www-data /var/www/[プロジェクト名]/
    sudo chmod -R 775 /var/www/[プロジェクト名]/storage

## 動作チェック

デプロイしたサーバーのIPアドレスにアクセス。もしくは、デプロイしたサーバーを直接操作しているのであれば http://127.0.0.1/ でも良い。

これでデプロイしたプロジェクトがそのまま表示されればOK


## 動かないときの対策

### 500エラー

大抵がLaravel関係のエラー。.envがコピーされているか、マイグレーションはされているか、コントローラなどの処理に問題がないか調べる。

### 403エラー

大抵がファイルのアクセス権かnginxの設定(`/etc/nginx/sites-available/default`)に問題がある。


### 静的ファイルが読めない

静的ファイルのアクセス権を確認する。その他のユーザーに読み込み権限が付与されているか。

## 結論

Djangoのデプロイに比べればLaravelのデプロイはとても容易。もともとただの`.php`ファイルを`/var/www/html`にコピペしただけでも動くわけだから。

後はNginx設定とファイルのアクセス権に注意すれば問題はないかと。

参照元: https://gist.github.com/santoshachari/87bf77baeb45a65eb83b553aceb135a3
