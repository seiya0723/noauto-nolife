---
title: "別のUbuntuにデータを輸送する"
date: 2022-08-15T18:20:02+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "開発環境","Ubuntu","私見","追記予定" ]
---


別のPCのUbuntuにデータを全て輸送する必要があったりする。

そういう時、手順をまとめておかないと手直しに返って時間がかかる。

よって、必要なデータ移行作業をここに列挙しておく。


## 準備編

前もって、下記をやっておく(任意)

- [サーバー版Ubuntu 20.04のインストールから設定、SSHログインまで【固定IPアドレス、タイムゾーン、bashrcなど】](/post/startup-ubuntu2004-server/)
- [【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定](/post/ubuntu1804-settings/)
- [Linuxでコマンドラインからクリップボードにコピーする【UbuntuもOK】](/post/linux-commandline-clipboard/)


## OS編

### Bashの設定とコマンドの入力履歴を輸送する

コマンド履歴の日付フォーマットやaliasなどの記録を全てコピーして新しいUbuntuに適応させる

以下、Bash設定

    cat ~/.bashrc | clipcopy

以下、コマンド入力履歴


### crontabの設定を輸送する

    cat /etc/crontab | clipcopy




### OSに直インストール済みのPythonライブラリを記録する










## アプリ編

### 移行後も必要になるアプリ・コマンドの一覧

コマンドの履歴からgrepで絞り込んで確認すれば良いが、一回コマンドを打つだけで移行完了の状態にしたいので、まとめておく。

- wakeonlan
- xsel

上記をまとめると下記コマンドを実行すると良いということがわかる。







### Vimの設定とプラグインを輸送する

vimrcとプラグイン、拡張子ごとにデフォルトで表示させるコードの設定を輸送する


### gitコマンドの設定を輸送する






### Firefoxのデータを輸送する

プロファイルを特定して、新しいUbuntuに貼り付ける

URLバーに`about:profiles`を入力する。

参照元:https://support.mozilla.org/ja/kb/profile-manager-create-and-remove-firefox-profiles




### ThunderBirdのデータを輸送する

同じく、プロファイルを特定して、新しいUbuntuに貼り付ける



### Chromeのデータを輸送する

FirefoxやThunderBirdと同様に設定関係を含むプロファイルを輸送


### Chromiumのデータを輸送する




### VirtualBoxの仮想マシンを輸送する







## ネットワーク編

### IPアドレスとMACアドレスを控える


### ネットワーク設定を記録する

例のファイルに記録するあれ(UbuntuのCUIの時にIPアドレス設定で使うファイル)








