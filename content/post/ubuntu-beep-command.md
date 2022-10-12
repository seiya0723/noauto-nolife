---
title: "Ubuntuにbeepコマンドをインストール【crontabで時報を作る】"
date: 2022-10-11T16:46:19+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","システム管理","crontab","modprobe" ]
---

## インストール

    sudo apt install beep

## 動かす

`-f`は周波数つまり音の高さ、`-l`はミリ秒指定で音の長さを指定できる。

    beep -f 5000 -l 2000

## 動かないとき

下記コマンドを実行、

    sudo vi /etc/modprobe.d/blacklist.conf

これを

    # ugly and loud noise, getting on everyone's nerves; this should be done by a
    # nice pulseaudio bing (Ubuntu: #77010)
    blacklist pcspkr

こうする。

    # ugly and loud noise, getting on everyone's nerves; this should be done by a
    # nice pulseaudio bing (Ubuntu: #77010)
    #blacklist pcspkr

そして、読み込み直す。

    sudo modprobe pcspkr


## crontabで1時間おきにbeepを鳴らす。

時報として使う事ができる。動かすのは8時から18時まで

    00 8-18 * * *   user   beep -f 880 -l 300


