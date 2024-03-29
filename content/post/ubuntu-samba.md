---
title: "UbuntuにSambaをインストールしてファイルサーバー化させる"
date: 2022-08-27T10:04:40+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu" ]
---

本記事はプライベート用として運用するため、セキュリティは全く考慮していない。

本記事に倣って作ったファイルサーバーは、LAN内の端末であれば、いずれも自由に読み書きできてしまうので注意。

## インストールする

    sudo apt install samba

## 共有ディレクトリを作る

今回はホームディレクトリに作った

    mkdir ~/share
    chmod 777 ~/share

## 設定する

    sudo vi /etc/samba/smb.conf

を開いて、末尾に下記を記入。UserNameには任意のユーザー名を指定

    [share]
    
    path = /home/UserName/share
    browseable = yes 
    writable = yes 
    guest ok = yes 
    guest only = yes 
    create mode = 0777

## 再起動

    sudo systemctl restart smbd 


## アクセスする

Nautilusを起動して、パス欄に下記を記入

    smb://192.168.11.200/share/


## HDDを共有フォルダにマウントする

続いて、HDDを共有フォルダにマウントする。まず、ディスク一覧を確認

    sudo fdisk -l

今回の私の環境下では`/dev/sda`と`/dev/sdb1`がHDDということがわかった

それらのディスクを先ほど作った共有ディレクトリのパスにマウントする

予めディレクトリを作った上でマウントしたほうが良いだろう。


    mkdir ~/share/sda/

    sudo mount /dev/sda ~/share/sda

## アンマウントする

間違えてマウントした場合はアンマウントする。dfコマンドでデバイスを特定

    df

マウントしているデバイスを特定したら、アンマウントコマンドを実行

    sudo umount /dev/sda/

ビジー状態になっている場合、サービス名`smbd`を終了させるとアンマウントできる

    sudo systemctl stop smbd

先のコマンドでマウントし直して、サービスを再起動させる

    sudo systemctl restart smbd


## 起動時にディスクをマウントさせる

`/etc/fstab`に起動時にマウントするように書いておく。

    /dev/sda         /home/UserName/share/sda   ext4    defaults        0 0
    /dev/sdb1        /home/UserName/share/sdb1  ext4    defaults        0 0

UUIDを指定してマウントしたい場合、各ディスクのUUIDを確認して

    sudo blkid /dev/sda1
    sudo blkid /dev/sdb

このように指定する。

    UUID=b7f7e47d-adee-4991-8631-65963bda99e2       /home/UserName/share/sda     ext4   defaults        0 0
    UUID=117b5be9-cc41-4670-b2f4-57413506025c       /home/UserName/share/sdb1    ext4   defaults        0 0


ちなみに、最後の5列目と6列目はdumpコマンドでバックアップ対象になるかどうか、起動時にfsckコマンドでチェックを行う際の順序を指定している
    
- 参照1: https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/756fstabnum.html
- 参照2: https://qiita.com/kakkie/items/768fa330f1e1832b702c

## 補足

### iOSのVLCアプリでアクセスできない

ネットワークからファイルサーバーの名前が表示されているので、ユーザーに『Anonymous』と入力すれば入れる。

これはVLCアプリの問題。
