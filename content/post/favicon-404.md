---
title: "サイトのアイコンを指定して、Favicon 404 NotFound問題を解決する【フリー素材使用】"
date: 2021-12-09T11:53:51+09:00
draft: false
thumbnail: "images/html5.jpg"
categories: [ "フロントサイド" ]
tags: [ "初心者向け","tips","HTML" ]
---

F12キーを押してコンソールを開き、JavaScriptの挙動を確かめる時。目につくのが、favicon.ico NotFoundという赤字の警告。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 12-06-47.png" alt="アイコンがない"></div>

この警告はサイトのアイコンを設定していないことによって発生する。つまり、このブログのようにアイコンを設定すれば、警告は出ないということだ。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 12-07-09.png" alt="アイコン設定"></div>

## アイコンを設定する。

HTMLの`head`タグ内に下記を記入する。

    <link href="img/favicon.ico" rel="icon">

まず、アイコンのファイル名は必ず`favicon.ico`とする。画像ではあるが、`link`タグで読み込みを指定する。`rel`属性には`icon`を指定する。

## favicon.icoのファイルが入手可能なフリー素材サイト

favicon.icoは自前で作っても良いが、作るのが面倒という場合は、フリー素材があるので、そちらからDLしてセットすれば良いだろう。

そこで、本項ではフリー素材サイトを紹介する。

### 絵文字をそのままアイコンに使える favicon.io

あまり実用性が無いかも知れないが、絵文字をそのままアイコンに使える。画像をアイコンに変換したり、テキストをアイコンに変換するジェネレーターなどもある。

https://favicon.io/

### 1000以上のアイコンが掲載されている freefavicon.com

私のブログのトンカチはここから拝借している。

https://www.freefavicon.com/freefavicons/icons/

### ゲームにも使えるアイコン opengameart.org/

ゲーム関係のフリー素材を提供しているサイト。アイコンも豊富。例えば、下記など。

https://opengameart.org/content/cc0-food-icons

[マッピング](/post/leaflet-marker-original-icon/)にも使うことができる。トップページは下記。

https://opengameart.org/



