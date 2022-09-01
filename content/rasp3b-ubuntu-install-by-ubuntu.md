---
title: "Ubuntu18.04を使ってRaspberryPi3Bにサーバー版Ubuntu22.04をインストールする"
date: 2022-08-24T08:58:03+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Raspberry Pi","Ubuntu","インフラ" ]
---


公式のRaspberry Pi OSはサーバーとして機能させるには不必要なものがあまりにも多すぎる。

ここは普段使い慣れているUbuntuをインストールしたい。

ということで、Ubuntu18.04からRaspberry Piにサーバー版をインストールさせる


## 必要なもの

- ラズパイ3B本体
- MicroSD(64GBぐらいが理想)
- MicroSDとUSBの変換器(PCにMicroSDのコネクタがある場合は不要)



## インストーラーの用意


    https://www.raspberrypi.com/software/

上記サイトから Download for Ubuntu for x86 を選んでインストーラーをDL。

DLされたdebファイルを実行してインストールする。


    sudo apt install rpi-imager

もしくは、下記を実行してインストール


    sudo snap install rpi-imager

<div class="img-center"><img src="/images/Screenshot from 2022-08-24 09-04-21.png" alt=""></div>


## OSの選択

インストールしたimagerを起動して、OSを選ぶを選択。

Other general-purpose OSからubuntuを選び、Ubuntu22.04 Server 64bit版を選択する。(ラズパイ3Bのメモリは1GBしか無いので32bit版でも良い)

<div class="img-center"><img src="/images/Screenshot from 2022-08-24 09-05-55.png" alt=""></div>

なお、Ubuntu22.04は現時点(2022年8月)時点でラズパイZeroにも対応している。

100円ショップ等で購入したMicroSDとUSBの変換器を使用してMicroSDをPCに接続。ストレージとして選んで書き込む。(PCにMicroSDのコネクタがある場合は変換器不要)

書き込む。

<div class="img-center"><img src="/images/Screenshot from 2022-08-24 09-13-11.png" alt=""></div>

後は、できあがったMicroSDをラズパイに挿して起動させるだけ。

起動直後はユーザー名Ubuntu、パスワードUbuntuになっており、パスワードの変更を求められるので、予めパスワードを作っておく。

## その後

Ubuntuインストール直後にすることをやると良いだろう。

とりわけ、IPアドレスの固定とSSHのインストールはやっておいたほうが良い。

下記はUbuntuのバージョンもエディションも違うが、参考程度に。

- [サーバー版Ubuntu 20.04のインストールから設定、SSHログインまで【固定IPアドレス、タイムゾーン、bashrcなど】](/post/startup-ubuntu2004-server/)
- [【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定](/post/ubuntu1804-settings/)


