---
title: "【HUGO】最新版をインストールして、サイトを作り、テーマを当ててビルドするまで"
date: 2022-03-22T08:39:10+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "web全般" ]
tags: [ "hugo","初心者向け","ubuntu" ]
---

## 手順

- GitHubから最新版のインストーラを入手
- サイトを作る
- 記事を作る
- テーマをインストールする
- HUGOサーバー(開発用サーバー)を起動する
- ビルドする

## GitHubから最新版のインストーラを入手

https://github.com/gohugoio/hugo/releases

上記サイトから、Latestと書かれてあるバージョンのインストーラーをDLする。Ubuntu 20.04の場合は`hugo_0.95.0_Linux-64bit.deb`をDLすると良いだろう。

Windowsであれば`hugo_0.95.0_Windows-64bit.zip`をDLして中のインストーラを実行する。


## サイトを作る

ターミナル(コマンドプロンプト)を開いて、

    hugo new site [サイト名]

と入力すれば、カレントディレクトリにサイト名で指定したディレクトリを作ってくれる。この中にサイトの構築に必要なファイル一式が揃っている。

もし、hugoコマンドが動いてくれない場合は、OSを再起動してもう一度上記コマンドを試す。

## 記事を作る

    hugo new ./content/post/[記事名].md

とすれば記事を作ってくれる。後はこのファイルを編集するだけ

## テーマをインストールする

サイトディレクトリの中にthemesというディレクトリがある。この中にテーマ(サイトの外観)を入れる。

<div class="img-center"><img src="/images/Screenshot from 2022-03-22 13-25-17.png" alt=""></div>

テーマは自作することもできるが、最初はHUGOの公式から提供されているテーマを使うほうが良いだろう。

### 最新版v0.95(2022年3月時点)で使えるテーマ

HUGOはたびたび後方互換性を失うバージョンアップを行っているため、テーマによっては動かないことがある。

以下は最新版(v0.95)で動作するテーマの一部である。

- https://themes.gohugo.io/themes/mainroad/
- https://themes.gohugo.io/themes/hugo-theme-anubis/
- https://themes.gohugo.io/themes/hugo-clarity/
- https://themes.gohugo.io/themes/toha/
- https://themes.gohugo.io/themes/hugo-theme-cleanwhite/

大抵、Updatedが最近の日付になっているテーマは動くっぽい。

テーマによってはSCSS等を使用している事があるので、バージョン以外の理由で使えないこともある。

また、古いバージョンのテーマでもERRORの部分を修正するだけで使える。


### 好みのテーマがない場合は？

既存のテーマは改変自由なので、似ているテーマをDLして一部を編集して作ると良いだろう。

## HUGOサーバー(開発用サーバー)を起動する

    hugo server 

このコマンドを実行すると、http://localhost:1313/ に開発用サーバーを起動してくれる。要するにプレビューである。

テーマを実装して、記事を作成していれば、上記リンクにアクセスするだけでサイトの内容を確認できる。

## ビルドする

    hugo 

このコマンドを実行すると書いた記事を元にサイトをビルドしてくれる。publicというディレクトリに出力される。

このpublicのファイル一式をサーバーにアップロードするだけで、静的サイトジェネレータで作ったサイトが公開できる。

具体的な公開の方法は下記記事にかかれてある。

[Netlifyと静的サイトジェネレーターHUGOで1ヶ月約100円でブログ運営をする方法【独自ドメイン使用】](/post/startup-netlify/)




