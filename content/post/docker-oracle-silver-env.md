---
title: "UbuntuのDockerでOracle DB SQL Silverの試験勉強の環境を整える"
date: 2025-04-27T14:20:24+09:00
lastmod: 2025-04-27T14:20:24+09:00
draft: false
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "SQL","データベース","docker" ]
---

至急、Oracle DB SQL Silverの試験を受ける必要が出てきた。

そこで、すでにあるUbuntuのdockerで、OracleDBの環境を整えていく。


## 前提

dockerのバージョンは以下の通り、

```
Docker version 26.1.3, build 26.1.3-0ubuntu1~22.04.1
```

Oracle公式が提供しているdockerのイメージは下記。

https://hub.docker.com/r/gvenzl/oracle-xe

Oracle社のエンジニア、G. Venzl 氏から提供されている。

## dockerのイメージをPullする

現時点での最新版は、21.3.0 なので、以下のコマンドでpull できる。

```
docker pull gvenzl/oracle-xe:21.3.0
```

ただし、Dockerグループに入っていない場合、Dockerデーモンを操作する権限がないため、先のコマンドの先頭に sudo が必要な場合がある。

もし、毎度毎度sudo をつけたくないのであれば、

```
sudo usermod -aG docker $(whoami)
```

このコマンドで現ユーザーをdockerグループに入れておく。

## コンテナを作成する

```
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -p 5500:5500 \
  -e ORACLE_PASSWORD=oracle \
  gvenzl/oracle-xe:21.3.0
```


コンテナ名はoracle-xe 、ポート番号は1521 でホスト側からアクセスできるようになる。

パスワードはorale としたが、ここは自由に決めて問題はない。

使用するイメージは先程pullしてきた、`gvenzl/oracle-xe:21.3.0`


コンテナ内で使用されているデフォルトのユーザー名は、SYSとSYSTEM の2つ。

実行すると
```
71f46b34bfe46970a3b5c9f21fcdd166bc85427d1f5699ad4a8f56225e2ec4a2
```
このようにコンテナIDが帰ってくる。



### 【補足】dockerの起動中のコンテナ一覧・コンテナの停止と起動・所持しているコンテナの一覧の確認


#### 起動中のコンテナの一覧

```
docker ps
```

#### コンテナの停止と起動

```
docker start コンテナ名(今回は--option で oracle-xeとした。)
```

```
docker stop コンテナ名
```

今回、 --restart always オプションは入れていないので、OSを再起動したら、手動で
```
docker start oracle-xe 
```
とする必要がある。

#### 所持しているコンテナの一覧

```
docker ps -a
```

これで停止中のコンテナも含めて表示される。

コンテナ名を忘れてしまったときに使う。


## SQLクライアントのインストール

OracleへのログインはSQLクライアントのインストールが必要。

### DBeaver のインストール

GUIであればDBeaver を使う。

```
sudo apt install dbeaver 
```
もしパッケージが見つからない場合は、

https://dbeaver.io/download/ ここから.debファイルをDLしてインストールする。(おそらく、`sudo apt install dbeaver-ce`とコミュニティエディションのほうが良さげ？)

Ctrl+N で新規作成。DBeaverからデータベース接続をクリック。

<div class="img-center"><img src="/images/Screenshot from 2025-04-27 14-58-16.png" alt=""></div>

Oracleを指定。

<div class="img-center"><img src="/images/Screenshot from 2025-04-27 14-58-34.png" alt=""></div>

Database にXEを指定。 パスワードにoracle を指定して、終了。


<div class="img-center"><img src="/images/Screenshot from 2025-04-27 14-59-36.png" alt=""></div>


<!-- 

### SQLPlus のインストール

CUIであれば SQLPlus が良いだろう。

https://www.oracle.com/database/technologies/instant-client/downloads.html

ここからDLできる。

RPMファイルしか提供されていないため、alien を使って.debファイルに変換をする必要がある。

https://download.oracle.com/otn_software/linux/instantclient/2370000/oracle-instantclient-sqlplus-23.7.0.25.01-1.el9.x86_64.rpm

まずはここからDL。DLしたRPMファイルを.debに変換する。

```
sudo alien -d ./oracle*.rpm
```

dpkgを使ってインストールをする。 ←できなかった。そもそもalien から失敗している。

-->


## サンプルのデータ(スキーマ)をインストールする

https://github.com/oracle-samples/db-sample-schemas

このGitHubのリポジトリをDLして、中身展開。 human_resorces に入って以下コマンドを実行。

```
docker cp hr_code.sql oracle-xe:/tmp/
docker cp hr_create.sql oracle-xe:/tmp/
docker cp hr_install.sql oracle-xe:/tmp/
docker cp hr_populate.sql oracle-xe:/tmp/
docker cp hr_uninstall.sql oracle-xe:/tmp/
```


dockerコンテナに直接入り、sqlplus コマンドを打つ。

```
docker exec -it oracle-xe bash
sqlplus sys/oracle@localhost:1521/XE as sysdba
```

```
@/tmp/hr_install.sql
```

パスワードを聞かれるので、`hr`と入力、ユーザー名はそのままEnterを押す。

上書きするか確認されるのでYesを押す。


```
Installation
-------------
Verification:

Table         provided     actual
----------- ---------- ----------
regions              5          5
countries           25         25
departments         27         27
locations           23         23
employees          107        107
jobs                19         19
job_history         10         10

Thank you!
--------------------------------------------------------
The installation of the sample schema is now finished.
Please check the installation verification output above.

You will now be disconnected from the database.

Thank you for using Oracle Database!

Disconnected from Oracle Database 21c Express Edition Release 21.0.0.0.0 - Production
Version 21.3.0.0.0
```

こんなふうに表示されればOK


```
SELECT username FROM all_users WHERE username = 'HR';
```
このSQLでHRスキーマが入ったか確認する。入っていれば以下のように表示される。

```
SQL> SELECT username FROM all_users WHERE username = 'HR';

USERNAME
--------------------------------------------------------------------------------
HR

SQL> 
```

DBeaver からはこんなふうに確認できる。反映されない場合は再起動する。

<div class="img-center"><img src="/images/Screenshot from 2025-04-27 16-06-49.png" alt=""></div>

<div class="img-center"><img src="/images/Screenshot from 2025-04-27 16-06-45.png" alt=""></div>




