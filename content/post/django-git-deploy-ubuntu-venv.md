---
title: "【Django】GitとSSHを使ってUbuntuへデプロイする(virtualenvでPythonライブラリの管理)【hookでmigrateコマンドも】"
date: 2023-02-07T16:50:19+09:00
lastmod: 2023-02-07T16:50:19+09:00
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


## 構図と流れ


### 構図

#TODO: diagrams.net で作る


### 流れ

1. とりあえず開発者側でDjangoのプロジェクトの作成、デプロイ先で必要なパッケージのインストール
1. デプロイ先で〇〇.gitというディレクトリを作り、その中で`git init --bare `を実行
1. 開発者側はDjangoのプロジェクトディレクトリ内で`git init`を実行。`git remote add origin ユーザー名@IPアドレス:~/Documents/〇〇.git`でリモートリポジトリを追加
1. 開発者側はプッシュをする。パスワードはSSHのログイン用パスワードでOK
1. デプロイ先は、 git clone 〇〇.gitを実行する。(これはhookを使用したほうが良いかも)
1. 必要に応じて、`migrate`コマンド及び`collectstatic`コマンドを実行する。


## 作業






## 結論

scpでアップロードする形式だと、どうしてもローカルで削除したコードがデプロイ先で残留してしまう。また、アップロード先のパスを間違えたら対処に手間取る。

gitであれば、最初の設定さえ間違えなければ、あとはadd commit push とやっていくだけ。とっても簡単。

ローカルのプロジェクトを紛失しても、git cloneでホストからすぐに取ってこれる。ブランチも切れる。以前の状態に戻すこともできる。



