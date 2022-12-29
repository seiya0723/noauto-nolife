---
title: "【Docker】公式チュートリアルを起動して使い方を学ぶ【docker run --name tutorial -d -p 80:80 docker/getting-started】"
date: 2022-12-27T16:18:10+09:00
lastmod: 2022-12-27T16:18:10+09:00
draft: false
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "docker","初心者向け" ]
---


dockerをインストールしたものの、使う機会に恵まれない、そもそも運用難易度高すぎで未だにVirtualBoxを使っている。

そういう状況なので、docker公式のチュートリアルを動かすことにした。


## 公式のチュートリアルを起動する

以下コマンドでOK

```
docker run --name tutorial -d -p 80:80 docker/getting-started
```

コマンドの意味は以下の通り
```
docker [作成+実行] [コンテナ名はtutorialとする] [バックエンドで起動] [ポートは80番(PC側で80番へアクセスすると仮想上の80番へアクセスされる)] [起動対象のイメージ(チュートリアル)]
```

Ubuntuの場合は管理者権限が必要なので、冒頭にsudoが付くが、以降のコマンドも管理者権限が必要であれば、適宜sudoをつける。

正常に起動したら、 http://localhost/tutorial/ にチュートリアル用のページが公開される。


## 前項のコンテナを停止・削除する


### 停止

`--name tutorial`でコンテナ名を命名したのであれば、下記コマンドで停止できる

```
docker stop tutorial 
```
もし、命名していない場合は、
```
docker ps -a
```
を実行してコンテナを一覧表示させ、NAMESに書かれてある名前を指定すると良い。

### 削除

コンテナを削除するには
```
docker rm tutorial
```
とコンテナ名を指定してrmコマンドを打つ。

## コンテナの一覧表示

動いているコンテナだけ表示させたい場合は

```
docker ps
```
動いていないコンテナも全て表示させたい場合は`-a`オプション(おそらくallの意味)をつける
```
docker ps -a 
```


## dockerイメージの一覧表示と削除

一覧表示
```
docker image ls
```

削除
```
docker image rm [イメージ名]
```


## docker composeを使った起動・停止

dockerのコンテナ作成から起動までを下記コマンドで実現できるが、これではコマンドが長い。

```
docker run --name tutorial -d -p 80:80 docker/getting-started
```

dockerでは複数のコンテナを起動したりすることになるので、Docker Composeを使って実行するコマンドを必要最小限にするのが定石。

まず、`docker-compose.yaml`ファイルを作り、内容を下記とする。

```
version: '3'
services:
 tutorial:
  image: docker/getting-started
   ports:
    - '80:80'
```


カレントディレクトリに上記ファイルがある状態で、
```
docker compose up -d 
```


コマンドを打つ。古いdockerを使っており、Ubuntuの場合は予め下記コマンドでdocker-composeをインストールしておく。
```
apt install docker-compose
```
その上で
```
docker-compose up -d
```
を実行する。

これにより下記コマンドを実行した時と同じように起動する事ができる。
```
docker run --name tutorial -d -p 80:80 docker/getting-started
```

### 【余談】YAMLの記法について

ちなみに`yaml`公式(?)によると、タブキーではなく半角スペースで、.ymlではなく.yamlとするべきと書かれてある。

https://shuzo-kino.hateblo.jp/entry/2014/03/01/223733

しかし、.ymlでも動くしタブキーでも問題なく動く。

```
version: '3'
services:
    tutorial:
        image: docker/getting-started
        ports:
            - '80:80'
```





## 結論



## 参照元

https://www.docker.com/101-tutorial/

