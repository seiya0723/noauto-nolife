---
title: "UbuntuでUbuntuのdockerイメージを作るまで"
date: 2022-02-03T11:22:31+09:00
draft: false
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","docker","スタートアップシリーズ" ]
---


## インストール

    sudo apt install docker.io

これでインストールできる。


## 用語解説

### イメージ

イメージとは、OSのとある状態をセーブした物。実機にOSをインストールする時、必要になるイメージディスクと思えば話が早い。

例えば、Ubuntuをインストールした直後の状態を再現したい場合、UbuntuのイメージをdockerHubのUbuntuリポジトリからDLしてコンテナを作る。

### コンテナ

コンテナとは、イメージを元に作った仮想環境。複数作ることができる。VirtualBoxを使っている場合は仮想マシン=コンテナと思えば話が早い。

コンテナを作った後、コンテナに入る(アタッチ)することで操作できる。コンテナ内で操作をした後、保存(コミット)することができる。コミットしたコンテナはイメージを作ることができる。

こうして、仮想環境の共有が容易になる。

## UbuntuのイメージをDLする

dockerコマンドは管理者権限がないと動かないため、sudoをつける。

    sudo docker pull ubuntu

pullしてUbuntuのdockerイメージをDLする。GitHubと扱いが似ている。

下記コマンドを実行して、UbuntuがあればOK

    sudo docker images 

## Ubuntuのイメージからコンテナを作る

下記コマンドを実行すれば、コンテナを作り、コンテナにアタッチすることができる。

    sudo docker run -it ubuntu

ターミナルのユーザー名がrootになればOK。そのまま必要なアプリなどをインストールする。

## コンテナにアタッチ、デタッチする

デタッチ(離脱)するにはCtrlキーを押しながらPキーを押し、その後すぐにQキーを押す。これでコンテナを稼働した状態でデタッチできる。

アタッチする場合は

    sudo docker ps -a

を実行して、表示されるdockerコンテナ一覧から、コンテナIDを特定し、

    sudo docker attach [コンテナID]

と書くか、

    sudo docker attach [コンテナ名]

と指定すればアタッチできる。

## コンテナを終了させる

コンテナを終了させるには、コンテナにアタッチしている場合は

    exit

と打てば良い。VirtualBoxと違ってshutdownコマンドは存在しないため、shutdownは発動しない。

デタッチしている状態の場合は、

    sudo docker stop [コンテナIDもしくはコンテナ名]

## コンテナを起動させる

    sudo docker start [コンテナIDもしくはコンテナ名]


## コンテナ・イメージを削除する

コンテナを削除するには

    sudo docker rm [コンテナIDもしくはコンテナ名]

イメージを削除するには、

    sudo docker rmi [イメージID]


## コンテナからイメージを作る

    sudo docker commit [コンテナID] [任意のイメージの名前] 

後はこのイメージをdockerhub等を使用して配布するだけである。


## コンテナとホストでファイルをやり取りする

コンテナからホストへファイルを転送する。

    sudo docker cp [転送したいローカルファイル] [コンテナID]:[転送先のファイルパス]

ホストからコンテナへファイルを転送する

    sudo docker cp [コンテナID]:[転送先のファイルパス] [転送したいローカルファイル]

特に再帰的にコピーするオプションを付けなくても、ディレクトリごと指定してコピーすることができる。


