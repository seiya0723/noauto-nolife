---
title: "【Ubuntu】ディスクの読み込みスピードをチェックする【sudo hdparm -tT デバイス名】"
date: 2022-11-03T15:56:52+09:00
lastmod: 2022-11-03T15:56:52+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","システム管理","コマンド" ]
---

これで、ディスクの読み込み速度が調べられる。

    sudo hdparm -tT デバイス名


まず、デバイス一覧を下記コマンドで調べる。

    sudo fdisk -l


デバイスのパスを指定する

    sudo hdparm -tT /dev/sdb

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 16-03-36.png" alt=""></div>

やはり、SSD(`/dev/sda`)とHDD(`/dev/sdb`と`/dev/sdc`)では二倍近い読み込み速度の差があるようだ。

## 結論

[sambaをインストール](/post/ubuntu-samba/)して、ファイルサーバーを作る時に使うとよいだろう。

ディスク速度とネットワークの速度、どちらがボトルネックになっているかある程度はわかる。

その上で、RAID0を組むか、SSDを導入するか、10ギガビットイーサネットを導入するか検討すれば良い。


