---
title: "【HTML】ダウンロードのダイアログを表示させたい場合、aタグにはdownload属性を付与する"
date: 2022-03-10T21:53:58+09:00
draft: false
thumbnail: "images/html5.jpg"
categories: [ "フロントサイド" ]
tags: [ "html","tips" ]
---

小ネタ。

例えば、ファイルを共有するウェブアプリを作る時、ファイルをリンクタグでダウンロードする仕様に仕立てる。

しかし、それが画像やPDF等のブラウザで表示できるファイルの場合、ダウンロードのダイアログが表示されず、ファイルそのものが表示されてしまう。

    <a href="sample.pdf">ダウンロードする</a>

そこで、aタグにdownload属性を付与する。

    <a href="sample.pdf" download>ダウンロードする</a>

これでダウンロードのダイアログが表示される。

