---
title: "Ubuntuにreactをインストールして動作確認する"
date: 2022-11-05T15:43:47+09:00
lastmod: 2022-11-05T15:43:47+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "Ubuntu","react","JavaScript","環境構築","初心者向け" ]
---


Ubuntu20.04にインストールしている

## npmのインストール

    sudo apt install npm

## reactのインストール

    sudo npm -g install create-react-app

バージョンの確認

    create-react-app --version


## プロジェクトを作り、開発用サーバーを起動する

    create-react-app myproject

プロジェクトを作る。

    cd myproject
    npm start

開発用サーバーを起動すると自動的にブラウザが立ち上がる。`127.0.0.1:3000`が表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-11-06 11-49-50.png" alt=""></div>

## 結論

これでインストール完了である。

本格的にReactの開発をする前に、モダンなJavaScriptの知識も確認しておきたい。

[Reactに必要なJavaScript構文【ES2015(ES6)のテンプレート文字列、アロー関数、スプレッド構文、letとconstなど、脱jQueryにも有効】](/post/react-essential-javascript/)

## 参照元

- https://qiita.com/rspmharada7645/items/25c496aee87973bcc7a5
- https://tutorialcrawler.com/ubuntu-debian/ubuntu%E3%81%ABreactjs%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95/



