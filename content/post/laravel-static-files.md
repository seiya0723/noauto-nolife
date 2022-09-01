---
title: "【Laravel】CSSやJS等の静的ファイルを読み込む【public/static/】"
date: 2021-11-30T10:26:12+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","初心者向け" ]
---


静的ファイルの読み込みができれば、JSやCSSだけでなくサイトの画像を前もって用意することができる。

本記事では予めプロジェクトに配置したCSSやJSを読み込み、表示させる方法を解説する。


## publicディレクトリ内にstaticディレクトリを作る

まず、静的ファイル関係を記録するディレクトリを作成する。

Laravelにはpublicというディレクトリが用意されており、通常はそこにCSSやJS等を保管する。ただ、直接`public`ディレクトリに保存するのではなく、予めstaticディレクトリを作り、その配下にさらに用途ごとにディレクトリ分けする構造が望ましいだろう。

<div class="img-center"><img src="/images/Screenshot from 2021-11-11 15-32-48.png" alt="ディレクトリ構造"></div>


## bladeテンプレートから読み込む

assetを使用すれば読み込みができる。

    <link rel="stylesheet" href="{{ asset('static/common/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('static/common/js/script.js') }}">

これだけでOK。特別な設定は不要。

## 注意点

ルーティングで割り当てられたパスと同じディレクトリ名を作ると404エラーになってしまう。そのため、ルーティングとはかぶらないように、予めstaticディレクトリをpublicディレクトリ内に作る必要がある。

詳細は下記記事を参照。

[【Laravel】静的ファイルのディレクトリ作るときの注意点【publicのディレクトリ名で即404エラー】](/post/laravel-public-dirname-caution/)




