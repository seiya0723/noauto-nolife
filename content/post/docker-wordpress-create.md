---
title: "【所要時間3分未満】dockerでWordpressの環境を構築する【docker-compose.ymlを書いて実行するだけ】"
date: 2022-12-29T22:53:36+09:00
lastmod: 2022-12-29T22:53:36+09:00
draft: false
thumbnail: "images/wordpress.jpg"
categories: [ "インフラ" ]
tags: [ "docker","Wordpress","環境構築" ]
---

以前、UbuntuにWordpressをインストールする手順を解説した。

[UbuntuにWordpressをインストールする【MariaDB+Apache】](/post/startup-wordpress-ubuntu/)

しかし、このやり方はもう古いというか遅すぎるらしい。

なぜなら今はdockerが開発の主流だから。

わざわざMariaDBをインストールして、Apacheをインストールして..とやっているようでは環境構築だけで1日が終わる。

dockerであれば3分以内でWordpress環境が作れる。



<span style="color:red;">※もしお急ぎの場合は、補足2もしくは3のymlを使用することをおすすめします。</span>


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


## 【補足1】このdockerのWordpressのデータを初期化するには？

まず、先ほどのdocker-compose.ymlを動かした時点で、dockerボリュームにDBのデータが作られている。DBのデータにWordpressの情報が格納されている。

下記コマンドを実行して確認できる。

```
docker volume ls
```

<div class="img-center"><img src="/images/Screenshot from 2023-01-02 09-41-49.png" alt=""></div>

つまり、初期化したいのであれば、これを消す必要が有るということだ。

ちなみにdockerのボリュームとはデータを永続保存するためのもの。コンテナに保存をしたとしてもコンテナを削除した時に同時に消える

参照: https://qiita.com/gounx2/items/23b0dc8b8b95cc629f32

しかしボリュームに保存されているデータは、コンテナを削除しても消えない。だから初期化したい場合はボリュームを消す必要が有る。

docker-composeを実行した時、下記のような文言が出力されたと思う。

```
Creating volume "wordpress_db_data" with default driver
Creating wordpress_db_1 ... done
Creating wordpress_wordpress_1 ... done
```

つまり、このWordpressのボリュームは`wordpress_db_data`ということになる。

だから、これを消すには下記コマンドを打つ。ただ、前もってコンテナを停止・削除しておいたほうが良いだろう。


```
docker stop wordpress_wordpress_1 wordpress_db_1
docker rm wordpress_wordpress_1 wordpress_db_1
```

続いて、ボリュームの削除をする。

```
docker volume rm wordpress_db_data
```

これで初期化される。下記サイトではリンク切れになったボリュームの削除コマンドも掲載されていた。

参照: https://qiita.com/Ikumi/items/b319a12d7e2c9f7b904d

```
docker volume ls -qf dangling=true | xargs -r docker volume rm
```

上記コマンドをによると、`wordpress_db_data`ともう一つ別のボリュームが作られている模様。

ちなみに、ボリューム名は
```
volumes:
    db_data:
```
とイメージ名等から来ていると思われる。



## 【補足2】このWordpressのポート番号を書き換えるには？

まず、先ほどの方法でボリュームを削除し、コンテナの停止・削除を行った上で、ymlを以下のように書き換える。

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
       - "8080:80"
     restart: always
     environment:
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wordpress
       WORDPRESS_DB_PASSWORD: wordpress
volumes:
    db_data:
```


これを起動させる

```
sudo docker-compose up -d
```

その上で http://127.0.0.1:8080/ へアクセスしてみる。

正常にポート番号を変えることができた。ちなみに、コンテナの停止・削除をした上で、ymlを書き換えてdocker-composeしただけではポート番号を変えることはできない。

なぜなら、WordpressのDBにサイトのポート番号まで記録されているから。ボリュームまで消さない限り、ポート番号を変えることはできないようだ。

あるいは、Wordpressの管理サイトからポート番号を変更した後、コンテナの停止・削除をした上でdocker-composeをすればうまく行くとだろうと思う(未検証)


## 【補足3】普段はコンテナ停止しておきたいけど、必要な時だけ起動したい場合は？

ポート番号の重複から、普段は停止しておき、必要な時だけ起動したい場合もあるだろう。

そういう時は、前項のymlをさらに修正してこうする。

```
version: '3' 

services:
   db: 
     image: mysql:5.7
     volumes:
       - db_data:/var/lib/mysql
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
       - "8080:80"
     environment:
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wordpress
       WORDPRESS_DB_PASSWORD: wordpress

volumes:
    db_data:
```

まず`restart: always`を消す。

後は停止する時と起動するときのコマンドをbashのエイリアスにでも登録しておくとよいだろう。

```
docker stop wordpress_wordpress_1 wordpress_db_1
```

```
docker start wordpress_wordpress_1 wordpress_db_1
```

## 【補足4】ファイルアップロードの上限を変更するphp.iniを編集するには？

このコマンドで、Wordpressのコンテナの中に入ることができる。

```
docker exec -ti wordpress_wordpress_1 bash
```

その状態で順次以下のコマンドを実行する。

```
cd /usr/local/etc/php


apt update && apt upgrade
atp install vim


rm php.ini-development
mv php.ini-production php.ini

vi php.ini
```

やっていることは、php.iniの編集のためにvimをインストールしている。内容を下記に修正する。

```
memory_limit = 1024M
post_max_size = 800M
upload_max_filesize = 750M
max_execution_time = 360
expose_php = Off
```

その上で、dockerを停止、起動する。

ちなみに、Wordpressのテーマには、最低限index.phpとstyle.cssが必要になる。そのため、前もってzipにそれが含まれていることを確認するべし。


参照: https://www.massolit-media.com/tech-writing/wordpress-and-docker-customize-a-container/


## 結論

こんなふうにマッハでWordpress環境が作れるのであれば、今後ますますWordpress案件はレッドオーシャンになるんだろうなあって思った。(※もっともデザインとコネでいくらでも活路は開けると思われるが)

それと同時にdockerの開発環境構築の威力は凄まじいので、是非とも使いこなせるようになりたいところだ。

もうVirtualBoxに依存した環境構築は辞めにしたい。

## 参照元

https://docs.docker.jp/compose/wordpress.html
