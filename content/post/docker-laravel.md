---
title: "dockerでLaravelを動かしてみる"
date: 2022-08-29T17:04:09+09:00
draft: true
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "docker","laravel","PHP" ]
---


なぜか、Laravelが動作しなくなったので、docker上でLaravelを動かすことにした。

[UbuntuでUbuntuのdockerイメージを作るまで](/post/startup-ubuntu-docker/)も参照に


今回使用するLaravelのイメージは下記

https://hub.docker.com/r/systemsdk/docker-nginx-php-laravel

これをプルして、手元のPCのdocker上で起動する。

    docker pull systemsdk/docker-nginx-php-laravel


下記コマンドを実行して、プルされたことを確認する。

    sudo docker images

下記が表示された。

    REPOSITORY                           TAG       IMAGE ID       CREATED       SIZE
    systemsdk/docker-nginx-php-laravel   latest    fb2b48ca4db7   6 weeks ago   855MB
    mysite-sample                        1.0       3bc665083fc4   2 years ago   869MB
    ubuntu                               18.04     ccc6e87d482b   2 years ago   64.2MB

下記コマンドでコンテナを作り、アタッチすることができる。

    sudo docker run -it fb2b48ca4db7


