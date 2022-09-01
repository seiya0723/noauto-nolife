---
title: "UbuntuにWordpressをインストールする【MariaDB+Apache】"
date: 2022-06-04T16:46:42+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Wordpress","Ubuntu","virtualbox" ]
---

手元のPCにWordpressをインストールして試したいが、OSに直にインストールするのは避けたい。

そういう時、[VirtualBoxにインストールしたUbuntu](/post/virtualbox-ubuntu-install/)へ、Wordpressをインストールすると良いだろう。

## 流れ

1. Apacheのインストール
1. MariaDBのインストールとDB・ユーザーの作成
1. PHPのインストール
1. Wordpressのインストール


## Apacheのインストール

インストール

    sudo apt install apache2

自動起動を有効化しておく。

    sudo systemctl enable apache2

動作しているかチェック

    sudo systemctl status apache2


## MariaDBのインストールとDB・ユーザーの作成

インストール

    sudo apt install mariadb-server mariadb-client

自動起動を有効化しておく。
    
    sudo systemctl enable mariadb


MariaDBに入る

    sudo mariadb

SQLを実行する。DBを作り、そのDBに対応するユーザーを作る。


    CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8;

    GRANT ALL ON wordpress.* TO wordpress@localhost IDENTIFIED BY 'ここに任意のパスワードを入力';

    FLUSH PRIVILEGES;


## PHPのインストール

    sudo apt install php7.4 php7.4-mysql


## Wordpressのインストール

    cd /var/www/html

DLと展開

    sudo wget https://ja.wordpress.org/latest-ja.tar.gz
    sudo tar xvf latest-ja.tar.gz

権限の割り当て

    sudo chown -R www-data:www-data .


`http://127.0.0.1/wordpress/` へアクセスする。ブラウザ上でWordpressの初期設定が表示されるので、先ほど作ったDBの名前とDBに対応するユーザー名とパスワードを入力する。

これでWordpressのインストールは完了である。


参照元: https://qiita.com/cherubim1111/items/b259493a39e36f5d524b

