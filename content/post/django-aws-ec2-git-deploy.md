---
title: "【Django】EC2インスタンスへgitを使ってデプロイする"
date: 2023-08-29T11:22:17+09:00
lastmod: 2023-08-29T11:22:17+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "インフラ" ]
tags: [ "django","ec2","デプロイ","git" ]
---


scpによるファイルアップロードの場合、ローカルで削除した差分ファイルがインスタンス上に取り残されてしまう。

可能であれば、gitを使ったデプロイができるようになっておきたい。

## 手順

1. インスタンスにリモートリポジトリを作る
1. ローカルにリポジトリを作る
1. リモートリポジトリとローカルリポジトリをつなげる
1. SSHの設定に.pemファイルを登録する
1. プッシュする

## インスタンスにリモートリポジトリを作る

インスタンスのデフォルトのブランチは、masterになっているのでインスタンスにて。前もってこのコマンドを実行しておく。

```
git config --global init.defaultBranch main
```

その上でリポジトリを作る。

適当なディレクトリを作り、リポジトリとして扱う。

```
mkdir -p ~/Documents/myproject.git
cd ~/Documents/myproject.git

git init --bare
```

## ローカルにリポジトリを作る

```
git init
git add .
git commit -m "first commit"
```

## リモートリポジトリとローカルリポジトリをつなげる

```
git remote add origin インスタンスのユーザー名@インスタンスのIPアドレス:~/Documents/myproject.git
```

## SSHの設定に.pemファイルを登録する

.pemファイルを .sshディレクトリ内にコピーする
```
cp ./test.pem ~/.ssh/test
```

公開鍵を作る
```
ssh-keygen -y -f ./test.pem > ~/.ssh/test.pub
```

ssh-agentに秘密鍵を登録しておく。
```
eval "$(ssh-agent -s)"

ssh-add ~/.ssh/test
```

この時点で、sshログイン時に.pemファイルを指定せずにログインできるようになる。

参照: https://alphacoder.xyz/git-push-to-an-aws-ec2-remote-using-a-pem-file/

## プッシュする

```
git push origin main 
```
インスタンスへプッシュする。

後は、クローンをして、ファイルを実体化させる

```
git clone myproject.git 
```

## 参照

- https://noauto-nolife.com/post/django-git-deploy-ubuntu-venv/
- https://alphacoder.xyz/git-push-to-an-aws-ec2-remote-using-a-pem-file/



