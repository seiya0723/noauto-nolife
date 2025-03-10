---
title: "Linuxでコマンドラインからクリップボードにコピーする【UbuntuもOK】"
date: 2022-03-30T09:13:28+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "linux","Ubuntu","tips" ]
---

とてつもなく長いコードをクリップボードにコピーして、誰かと共有したい時、エディタのカーソルを上に持っていって下まで下げてコピーするのはとても面倒。

だから、コマンド一発でファイルの内容全てをコピーする。xselを使って。


    sudo apt install xsel

これでOK。後はコピペしたいファイルを用意して、下記コマンドを実行する。

    cat ./index.html | xsel --clipboard --input

これでindex.htmlの中身が全部コピーできた。bashrcにエイリアスで登録しておくと、すぐに呼び出せて便利。

bashrcに下記を追加しておく。

    alias clipcopy='xsel --clipboard --input'

呼び出す時はこうする。

    cat ./index.html | clipcopy


## SSHでリモートログインした端末に対してclipcopy を実行するには？

予め -X オプションを使ってX11を使ってログインをする。

```
ssh -X user@remote_host
```

その上で、clipcopyコマンドを使う。

```
cat ./index.html | clipcopy
```

もしリモートログインをする対象がラズパイなどの低スペックであり、X11を使うことが難しい場合は

```
ssh user@raspberrypi 'cat ./index.html' | clipcopy
```

このようにssh接続をした上で、コマンドを実行。標準出力をclipcopyしておく。

この場合、SSHサーバーであるラズパイではなく、SSHクライアント側にclipcopy コマンドを用意しておく。

ただし、この方法は毎度毎度パスワードを打つ必要が出てくる。そこでパスフレーズなしの公開鍵認証を使うと便利。


