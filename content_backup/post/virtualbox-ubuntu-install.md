---
title: "VirtualBoxにUbuntuをインストールする"
date: 2021-06-19T16:49:00+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "ubuntu","virtualbox","システム管理" ]
---


作ったウェブアプリをデプロイする時、実機のLinuxサーバーでも良いが、VirtualBox上のLinux系OSのいずれかにデプロイして試験運用するのも良いだろう。

そこでその前段階としてVirtualBoxにUbuntuをインストールさせる。

## 用意する物

- Ubuntuのisoファイル
- VirtualBoxのインストーラー(パッケージファイル)
- メモリ4GB以上の空きがあり、なおかつ20GB以上のストレージの空きがあるPC


Ubuntuのisoファイルは[Ubuntu JapaneseTeam](https://www.ubuntulinux.jp/japanese)からDLすると良いだろう。サポートの長いLTSをDLすると良い。

VirtualBoxのインストーラーは[公式から](https://www.virtualbox.org/wiki/Downloads)からDLする。WindowsもしくはMacであればそのままダブルクリックで実行、ダイアログの指示に従ってインストールすれば良い。


## 仮想マシンの新規作成とリソース割り当て

VirtualBoxのインストールが終わったら、仮想マシンの新規作成を行う。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 14-39-00.png" alt="新規作成"></div>

新規作成画面では、メモリの割り当てを4GB行い、名前を決めて、Ubuntu64bit版を指定する。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 14-46-05.png" alt="初期設定"></div>

ストレージは20GB、物理ハードディスクになるストレージは固定を指定。作成を押す。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 14-50-33.png" alt="ストレージ設定"></div>

できあがった枠に、Ubuntu20.04のisoを読み込むように指定する。先ほど作った枠を選び、設定を押す。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 14-54-01.png" alt="設定"></div>

ストレージ、コントローラの空を選ぶ、光学ドライブのCDのアイコンをクリックする。仮想光学ディスクファイルを選択をクリック。先ほどDLしたUbuntuのisoファイルを選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 14-57-03.png" alt="isoファイルを選ぶ"></div>

下記のように設定できればOK

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 15-03-08.png" alt="isoファイルが設定できた。"></div>

ローカルIPアドレスを割り当てたいのであれば、ネットワーク、アダプター1から割り当てのプルダウンメニューを押し、ブリッジアダプターを選ぶ。OKを押して設定完了

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 15-07-07.png" alt="ブリッジアダプター"></div>

緑の起動ボタンを押す。Ubuntuのインストーラが起動するので指示に従ってUbuntuをインストールすれば良い。

## Ubuntuのインストール

Ubuntuをインストール

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 15-10-25.png" alt="Ubuntuをインストール"></div>

日本語キーボードを選んで、最小インストールにチェックしてインストール開始。(通常だと表計算ソフト等不要なものまでインストールされるため)

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 15-12-52.png" alt="最小インストール"></div>

ディスクを削除してインストール。仮想領域の20GBが削除されるだけなので大丈夫。

リージョンは東京を選択。適当な名前とパスワードを指定する。後はインストール完了まで待つ。

<div class="img-center"><img src="/images/Screenshot from 2021-06-21 15-17-45.png" alt=""></div>

終わるまで大体10分ぐらいはかかる。

## GuestAdditionCDをインストール

デバイスからGuestAdditionCDイメージを挿入をクリック。ターミナルを起動し、GuestAdditionCDの中にある、VBoxLinuxAdditions.runを管理者権限で起動。

    sudo ./VBoxLinuxAdditions.run

デバイスからクリップボードの共有、ファイルのドラッグアンドドロップをいずれも双方向に選択。再起動して完了。これでゲストとホスト間でデータの共有が容易になる。

## 結論

VirtualBoxはOS内にOSを立ち上げるという仕組み上、その性能はホストOSを超えることはない。そのため、性能が必要なウェブアプリなどでは実機にデプロイするに越したことはないだろう。

とは言え、実機のLinuxサーバーがいつでも用意できるとは限らない。VirtualBoxのUbuntuへのデプロイは代替案のひとつとして考慮するべきであろうと思う。

後は、日本語のディレクトリを英語に変更すれば良いだろう。

[【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定](/post/ubuntu1804-settings/)


