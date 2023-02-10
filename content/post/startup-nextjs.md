---
title: "Next.jsのインストール方法とプロジェクトの作成"
date: 2023-02-09T21:48:32+09:00
lastmod: 2023-02-09T21:48:32+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "next.js","JavaScript","スタートアップシリーズ" ]
---

本記事ではUbuntu22.04にインストールする。

## インストール


パッケージの更新

    sudo apt update && sudo apt -y upgrade && sudo apt -y autoremove

build-essentialのインストール

    sudo apt install build-essential


nodeのインストール

    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash –
    sudo apt install nodejs


参照元: [Ubuntu18.04にnode.jsとnpm、vue-cliをインストールする](/post/startup-npm-install/)


## プロジェクト作成

プロジェクトの作成

    npx create-next-app next-project

プロジェクトのディレクトリに移動

    cd next-project

サーバーを起動する。

    npm run dev

<div class="img-center"><img src="/images/Screenshot from 2023-02-10 15-52-21.png" alt=""></div>


## 結論

next.jsはHUGOのような静的サイトジェネレーターとしても使える上に、Djangoのようにサーバーサイドありのウェブアプリとしても扱うことができる。


参照元: https://www.hostnextra.com/kb/easy-to-install-next-js-on-ubuntu-20-04/



