---
title: "【所要時間3分未満】dockerでWordpressの環境を構築する【docker-compose.ymlを書いて実行するだけ】"
date: 2022-12-29T22:53:36+09:00
lastmod: 2022-12-29T22:53:36+09:00
draft: false
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "docker","Wordpress","環境構築" ]
---

以前、UbuntuにWordpressをインストールする手順を解説した。

[UbuntuにWordpressをインストールする【MariaDB+Apache】](/post/startup-wordpress-ubuntu/)

しかし、このやり方はもう古いというか遅すぎるらしい。

なぜなら今はdockerが開発の主流だから。

わざわざMariaDBをインストールして、Apacheをインストールして..とやっているようでは環境構築だけで1日が終わる。

dockerであれば3分以内でWordpress環境が作れる。


## docker-compose.ymlを作る

まず、docker-compose.ymlを作る。内容は下記。

```
version: '3'

services:
   db:
     image: mysql:5.7
     volumes:
       - db_data:/var/lib/mysql
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: somewordpress
       MYSQL_DATABASE: wordpress
       MYSQL_USER: wordpress
       MYSQL_PASSWORD: wordpress

   wordpress:
     depends_on:
       - db
     image: wordpress:latest
     ports:
       - "8000:80"
     restart: always
     environment:
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wordpress
       WORDPRESS_DB_PASSWORD: wordpress
volumes:
    db_data:
```

続いて、このファイルを作ったディレクトリで次のコマンドを打つ

```
docker-compose up -d
```

権限がない場合は適宜sudoをつける。


これを動作させるだけでブラウザから( http://localhost:8000 )へアクセスすると、Wordpressのダッシュボードへ行ける(初回は設定とログイン画面)

<div class="img-center"><img src="/images/Screenshot from 2022-12-29 23-07-13.png" alt=""></div>

8000番はよく使うので、8500とかにすればポート番号の重複が無くなると思った。

## 結論

こんなふうにマッハでWordpress環境が作れるのであれば、今後ますますWordpress案件はレッドオーシャンになるんだろうなあって思った。

それと同時にdockerの開発環境構築の威力は凄まじいので、是非とも使いこなせるようになりたいところだ。

もうVirtualBoxに依存した環境構築は辞めにしたい。

## 参照元

https://docs.docker.jp/compose/wordpress.html
