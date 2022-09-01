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


