---
title: "【シェルスクリプト】git clone した後、クローンしたディレクトリへ移動する"
date: 2023-12-23T15:23:05+09:00
lastmod: 2023-12-23T15:23:05+09:00
draft: false
thumbnail: "images/git.jpg"
categories: [ "others" ]
tags: [ "tips","git","作業効率化","シェルスクリプト","linux" ]
---

`git clone`コマンドを実行してクローンした後、cdコマンドでディレクトリ移動するのがめんどくさい。

そこで、git clone とcd コマンドを1つにまとめたシェルスクリプトを用意した。

```
#! /bin/bash

# $1 https://github.com/seiya0723/django-auth/tree/main/accounts
echo $1

# ここでtree以降は切り捨てる。
repo=$(echo "$1" | sed s/tree.*//g)

# 移動対象のディレクトリを取り出す。
destination=$(echo ./"$1" | sed "s/tree\/\w*\///g" | sed "s/https:\/\/github.com\/\w*\///g" )


git clone $repo
cd $destination

```


例えば、特定のディレクトリ(tree/main/accounts)を指定している場合、そのディレクトリへ移動するようにしている。

しかし、シェルスクリプト上でcdコマンドを実行しようとしても、サブシェルで行われているため、シェルスクリプト終了時に元のディレクトリに戻ってしまう。

そこで、このシェルスクリプトを起動する際には、以下のようにsource コマンドで実行する。

```
source ./gitclone.sh
```

ちなみに、どこでも実行できるよう、このシェルスクリプトをbashのエイリアスに登録しておく。

```
alias gitcd="source ./gitclone.sh"
```


