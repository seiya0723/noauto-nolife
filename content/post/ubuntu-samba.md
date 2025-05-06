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

※ この記事の方法は非推奨です。マウントする箇所が /mnt/ になっておらず、権限もフルアクセスです。

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


### 新品のディスクを接続した直後の場合、マウントはできない

新品のディスクをそのままマウントしようとした場合、

```
mount: /share/sda: wrong fs type, bad option, bad superblock on /dev/sda, missing codepage or helper program, or other error.
       dmesg(1) may have more information after failed mount system call.
```

こんな感じのエラーが出てくる。

まず、ディスクのファイルシステムを作成する必要がある。

```
lsblk
```

これで接続されたディスクを確認

```
$ lsblk

NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda           8:0    0  1.8T  0 disk 
nvme0n1     259:0    0  1.8T  0 disk 
├─nvme0n1p1 259:1    0    1G  0 part /boot/efi
└─nvme0n1p2 259:2    0  1.8T  0 part /
```


fdiskを起動し、インタラクティブシェルに入る。
```
sudo fdisk /dev/sda
```


- n : 新しいパーティション
- p : プライマリ
- 1 : パーティション番号
- Enter 2回押し
- w : 書き込み

```
$ sudo fdisk /dev/sda

Welcome to fdisk (util-linux 2.39.3).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS (MBR) disklabel with disk identifier 0x52fbf621.

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 1
First sector (2048-3907029167, default 2048): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-3907029167, default 3907029167): 

Created a new partition 1 of type 'Linux' and of size 1.8 TiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

続いて、ext4 でフォーマットする。

```
sudo mkfs.ext4 /dev/sda1
```

その上で、先のマウントのコマンドを打つ。

```
sudo /dev/sda1/ ~/share/disk1
```

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

    /dev/sda         /home/UserName/share/sda   ext4    defaults,nofail       0 0
    /dev/sdb1        /home/UserName/share/sdb1  ext4    defaults,nofail       0 0

UUIDを指定してマウントしたい場合、各ディスクのUUIDを確認して

    sudo blkid /dev/sda1
    sudo blkid /dev/sdb

このように指定する。

    UUID=b7f7e47d-adee-4991-8631-65963bda99e2       /home/UserName/share/sda     ext4   defaults,nofail       0 0
    UUID=117b5be9-cc41-4670-b2f4-57413506025c       /home/UserName/share/sdb1    ext4   defaults,nofail       0 0


ちなみに、最後の5列目と6列目はdumpコマンドでバックアップ対象になるかどうか、起動時にfsckコマンドでチェックを行う際の順序を指定している
    
- 参照1: https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/756fstabnum.html
- 参照2: https://qiita.com/kakkie/items/768fa330f1e1832b702c

## 補足

### iOSのVLCアプリでアクセスできない

ネットワークからファイルサーバーの名前が表示されているので、ユーザーに『Anonymous』と入力すれば入れる。

これはVLCアプリの問題。
