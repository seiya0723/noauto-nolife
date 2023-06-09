---
title: "【Ubuntu】Localをインストールする【WordPressのローカル環境構築】"
date: 2023-06-05T10:03:34+09:00
lastmod: 2023-06-05T10:03:34+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Ubuntu","環境構築","Wordpress" ]
---


LinuxへのWordpressの開発環境の構築はdockerでもできるが、ややdockerの知識が必要。

そこで、簡単にWordpressの開発環境の構築ができるlocalを使用する。

## インストール

https://localwp.com/releases/

上記ページから各OSごとのインストーラーが用意されている。

今回はUbuntuなので、.debファイルをDLする。

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-06-39.png" alt=""></div>

DL後、下記コマンドを実行



```
sudo apt install ~/Downloads/local-6.7.2-linux.deb
```

## インストール後

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-09-28.png" alt=""></div>

規約に同意する。

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-10-30.png" alt=""></div>

バツボタン、Nothanksでトップページへ

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-11-39.png" alt=""></div>

Create new siteでサイトの新規作成

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-12-06.png" alt=""></div>

サイト名を指定

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-12-21.png" alt=""></div>

パスワードとユーザー名を指定

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-13-40.png" alt=""></div>


testsiteが作られる。Open Siteをクリックすると、作ったサイトが見れる。

<div class="img-center"><img src="/images/Screenshot from 2023-06-05 10-12-38.png" alt=""></div>

## 結論

dockerだとdocker-composeを書いて、動かす必要がある。

非エンジニア向けにこれを説明するのはかなり酷。dockerのバージョン管理などもあるので、動かなくなることも。

localであれば、GUIで操作できるので、開発環境の構築はとっても簡単。

何より、WindowsやMacだけでなく、Debian系OS(Ubuntuなど)に加え、Redhat系OSまで対応しているので、誰でも気軽に使えるだろう。




