---
title: "UbuntuにインストールされているPythonをアップデートする"
date: 2022-05-07T22:33:21+09:00
draft: true
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","ubuntu" ]
---

## 経緯

非同期系ライブラリのacyncioのコードを動かそうとした時。

正常に動いてくれない。公式によると、これはPythonが3.7以上でなければ動いてくれないとのこと。( https://docs.python.org/3/library/asyncio.html )

そこでPythonのバージョンを調べたところ、

<div class="img-center"><img src="/images/Screenshot from 2022-05-05 22-31-15.png" alt=""></div>

うわっ..私のPython古すぎ..!!

ということで、UbuntuにインストールされているPythonをアップデートしておく。ちなみに2022年5月現時点では、Pythonの最新安定版は3.10のようだ。([wikipediaより](https://en.wikipedia.org/wiki/History_of_Python#Table_of_versions))


## 手順

最新版でなくても良いのであれば、Ubuntuなら下記コマンドで実現できる。

    sudo apt install python3 

これで2022年5月現時点ではPython3.9がインストールされる。

もし、最新版のPytho3.10をインストールしたい時、リポジトリの追加を行った上でインストールする。

    sudo apt install software-properties-common -y
    sudo add-apt-repository ppa:deadsnakes/ppa

    sudo apt install python3.10


## 【補足1】python3と実行して、最新版Pythonを実行させるには？

前項の手順では

    python3.9

    python3.10

などと実行しないとPython3.9もしくはPython3.10が実行されない。下記コマンドで表示されるバージョンは古いまま

    python3 --version

だから、bashのエイリアスからpython3とインストールしたPythonを繋げる

    #!/usr/bin/env python3 
    alias python3='/usr/bin/python3.10' 


こうすることで、python3で実行されるPythonのバージョンは先ほどインストールした新しい物になる。


## 【補足2】Ubuntuのアップグレードをすれば、Pythonのバージョンアップもされる

この記事を書いた当時は、Ubuntu18.04を使っていた。

そのため、Pythonの更新がされないまま放置されていた。そこで、Ubuntuのアップグレードをする。

この通り、Pythonはバージョンアップされた。

<div class="img-center"><img src="/images/Screenshot from 2022-10-09 13-44-34.png" alt=""></div>

ちなみに、Ubuntuのアップグレードの際に表示されるダイアログの選択肢を誤ると、crontabやvimrcに書いた設定が全て白紙になってしまう。詳細は下記をご覧頂きたい。

[Ubuntuのアップグレード時の設定を置き換えてはいけない](/post/ubuntu-upgrade-config-replace/)

18.04から20.04へのアップグレードの作業は、およそ3時間ぐらいかかった。

その間、ブラウザやターミナルなど全てのソフトウェアは、ほぼ使用できない点に注意したい。

## 参照元

- https://stackoverflow.com/questions/43743509/how-to-make-python3-command-run-python-3-6-instead-of-3-5
- https://computingforgeeks.com/how-to-install-python-on-ubuntu-linux-system/


