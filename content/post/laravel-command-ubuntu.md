---
title: "laravelコマンドをUbuntuで実行可能にする方法"
date: 2021-01-28T14:52:39+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Ubuntu","bash" ]
---


laravelで新しいプロジェクトを生成するとき、

    composer create-project --prefer-dist laravel/laravel [プロジェクト名]

このように実行するのだが、とても長い。

    laravel new [プロジェクト名]

そこで上記コマンドを実行しようとしてもlaravelコマンドがインストールされていないと言う。laravelコマンドを使えるようにするにはまずはcomposerからのインストールが必要。

    composer global require "laravel/installer"

そしてその上で、`~/.bashrc`にてパスを通す。`~/.bashrc`の末端に下記を追記。

    export PATH="$PATH:/home/[ユーザー名]/.config/composer/vendor/bin"

これでlaravelコマンドが実行できる。ただ、PHPのバージョンが7.3以上じゃないとlaravelコマンドを使ってのプロジェクト生成が出来ない点にご注意。

その上、冒頭のcompoeserコマンドは[プロジェクト名]の後にlaravelのバージョンを指定することができるが、laravelコマンドではバージョン指定ができない。未指定であれば、最新版がインストールされる。

    composer create-project --prefer-dist laravel/laravel [プロジェクト名] [バージョン指定]


