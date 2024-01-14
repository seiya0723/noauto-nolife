---
title: "【Bash】mkdirコマンドで作ったディレクトリに即移動(cd)するコマンドを作る【mkcdをaliasに登録】"
date: 2022-08-11T09:34:47+09:00
draft: false
thumbnail: "images/bash.jpg"
categories: [ "インフラ" ]
tags: [ "シェルスクリプト","Linux","Ubuntu","Bash" ]
---

mkdirコマンドで作ったディレクトリに即移動したい場合。

まず、このシェルスクリプトを作る。

```
#! /bin/bash

mkdir -p $1
cd $1
```

そして、aliasを追加する。sourceコマンドを使って実行させる。

```
alias mkcd="source ~/develop_tools/mkcd.sh"
```


すると、mkcd コマンドを実行すると、作ったディレクトリに即移動できる。

-p オプションもついているので、2階層以上のディレクトリも一気に作れる。

参照元:https://qiita.com/akokubu/items/d577d0d8ccc6464286c1


