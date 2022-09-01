---
title: "docker上のCentOS(NginxとPostgreSQL)にDjangoをデプロイさせる"
date: 2022-02-03T15:11:00+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","デプロイ","CentOS","docker" ]
---

docker上のCentOSにDjangoをデプロイする方法をここに記す。

## 前提知識

dockerの基本的な使い方に関しては、下記を参照。

- [UbuntuでUbuntuのdockerイメージを作るまで](/post/startup-ubuntu-docker/)

Djangoのデプロイに関しては下記を参照。

- [DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)
- [DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】](/post/django-deploy-linux/)


## CentOSのイメージ入手、コンテナの作成

    sudo docker pull centos
    sudo docker run -it centos 


## yumコマンドでインストールできない問題の対処 cannot prepare internal mirrorlist: No URLs in mirrorlist

下記コマンドを順次行い、yumコマンドでのinstallができるようにする。

    sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-Linux-*
    sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-Linux-*
    
    sudo dnf install centos-release-stream -y
    sudo dnf swap centos-{linux,stream}-repos -y
    sudo dnf distro-sync -y

参照元:https://stackoverflow.com/questions/70926799/centos-through-vm-no-urls-in-mirrorlist

## Nginx及びPostgreSQLをインストール

    yum install nginx
    yum install postgresql



近日追記予定




