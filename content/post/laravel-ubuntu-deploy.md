---
title: "LaravelをUbuntuにデプロイする【Nginx+PostgreSQL】"
date: 2021-04-13T19:09:40+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Ubuntu","デプロイ" ]
---

## 構成について

タイトルの通り、下記構成にてデプロイを行う

Laravel
Ubuntu 18.04
Nginx
PostgreSQL


### なぜPostgreSQLなのか？(MySQLではないのか？)

MySQLは使わない。なぜなら、Laravelの`timestamp`型と`MySQL`が組み合わさると[2038年問題](https://ja.wikipedia.org/wiki/2038%E5%B9%B4%E5%95%8F%E9%A1%8C)が発生するから。

コード側を合わせるという方法もあるが、今回はデプロイが主目的であるため、安全なPostgreSQLでデプロイする。

https://qiita.com/ucan-lab/items/99ee14ad6bb24614980c


## デプロイまでの流れ









