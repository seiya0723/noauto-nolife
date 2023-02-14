---
title: "【Django】GitとSSHを使ってUbuntuへデプロイする(virtualenvでPythonライブラリの管理)【hookでmigrateコマンドも】"
date: 2023-02-14T13:50:19+09:00
lastmod: 2023-02-14T13:50:19+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","git","デプロイ","Ubuntu","上級者向け","追記予定" ]
---

要求される知識が非常に多いため、下記`対象読者`に該当する方のみ、閲覧を推奨します。

## 対象読者

- Linuxのコマンドがわかる
- CUIエディタ(nanoもしくはvim)が扱える
- すでにDjangoプロジェクトをUbuntuへデプロイをしたことがある
- gitを使ったことがある(ステージング→コミット→プッシュができればOK)
- SSHでUbuntuへリモートログインをしたことがある(パスワード認証ができればOK)
- virtualenvでPythonライブラリを管理したことがある

### 関連記事

- [UbuntuにSSHでリモートログインする方法【パスワード認証+公開鍵認証+scpコマンド】](/post/ubuntu-ssh/)
- [【git/GitHub】コマンドと使い方の一覧](/post/startup-git/)
- [UbuntuにDjangoをデプロイする【PostgreSQL+Nginx、Virtualenv使用】](/post/django-deploy-ubuntu-venv/)


<!--
## 構図と流れ


### 構図

#TODO: diagrams.net で作る
-->

## 流れ

1. ローカルでDjangoのプロジェクトの作成
1. ホストで必要なパッケージのインストール
1. ホストでリポジトリを作成
1. ローカルでリポジトリを作成、ホストのリポジトリを追加
1. ローカルでプッシュをする
1. ホストでリポジトリからプロジェクトをクローン
1. 必要に応じて`migrate`等のコマンドを実行


## 作業

### ローカルでDjangoのプロジェクトの作成

Djangoプロジェクトを作る。すでに作っている場合は次の項へ

    mkdir startup_bbs
    cd startup_bbs
    django-admin startproject config .


### ホストで必要なパッケージのインストール

    # 全パッケージの更新
    sudo apt update && sudo apt -y upgrade && sudo apt -y autoremove

    # デプロイに必要なパッケージのインストール
    sudo apt install python3-pip python3-dev libpq-dev postgresql postgresql-contrib nginx

    # virtualenvのインストール
    sudo pip3 install virtualenv

    # gitのインストール
    sudo apt install git 



### ホストでリポジトリを作成

Documents配下にプッシュ先のリポジトリを作る

    mkdir -p ~/Documents/myproject.git
    cd ~/Documents/myproject.git

空のリポジトリとして初期化する

    git init --bare

### ローカルでリポジトリを作成、ホストのリポジトリを追加

ローカルではDjangoのプロジェクトディレクトリ内でリポジトリを作成、コミットしておく。

    git init
    git add .
    git commit -m "first commit"

ホストのリポジトリを追加しておく。

    git remote add origin ホストのユーザー名@ホストのIPアドレス:~/Documents/myproject.git

### ローカルでプッシュをする

    git push origin master 

パスワードの入力を求められるが、SSHでパスワードログインを行っている場合、そのパスワードを入力する。

### ホストでリポジトリからプロジェクトをクローン

ホストにて、Djangoプロジェクトがプッシュされているので、クローンする。

    cd ~/Documents/
    git clone myproject.git 

`~/Documents/`の中にDjangoプロジェクトに当たる、`myproject` が作られている。後は、NginxやPostgreSQLに設定を行い、デプロイをする。

参照: [UbuntuにDjangoをデプロイする【PostgreSQL+Nginx、Virtualenv使用】](/post/django-deploy-ubuntu-venv/)


### 必要に応じて`migrate`等のコマンドを実行

プロジェクト内部へ移動、マイグレーションなどのコマンドを実行する。(任意)

    cd myproject

    python3 manage.py migrate
    python3 manage.py collectstatic
    python3 manage.py createsuperuser


## 結論

scpでアップロードする形式だと、どうしてもローカルで削除したコードがデプロイ先で残留してしまう。また、アップロード先のパスを間違えたら対処に手間取る。

gitであれば、最初の設定さえ間違えなければ、あとは`add` `commit` `push` とやっていくだけ。とっても簡単。

ローカルのプロジェクトを紛失しても、git cloneでホストからすぐに取ってこれる。ブランチも切れる。以前の状態に戻すこともできる。


