---
title: "CloudinaryでPDF等の画像や動画以外のファイルをアップロードし、共有する方法【blocked for delivery】"
date: 2021-09-30T09:11:38+09:00
draft: false
thumbnail: "images/heroku.jpg"
categories: [ "インフラ" ]
tags: [ "Heroku","セキュリティ","cloudinary" ]
---

どうやらPDF等の画像や動画以外の一部のファイルは配信拒否されてしまうらしい。セキュリティ対策の一貫として行われているそうな。

しかし、PDFを共有する前提のウェブアプリであればただの足かせでしか無いし、ユーザー認証や管理者が管理をきちんとしていればセキュリティ的な事案はある程度は低減できる。

本記事ではCloudinaryを使用してPDFを配信する方法を記す。

## 対策

対策は至ってシンプル。Cloudinaryに保存をする前にファイル名の拡張子(`.pdf`)を削除する。それだけ。クライアント側で拡張子を削除してアップロードしても良い。

CloudinaryはMIMEではなく、ファイル拡張子によって公開するかしないかを判定している模様。そのため、ファイル拡張子を消してしまえば、どんなファイルでも公開される(と思われる)。

ただ、これだとクライアントがDLする時にファイルの拡張子が消されたままDLしてしまう。拡張子を知らない人によってはPDFとして開くことができないので、DL前にJavaScriptなどで`.pdf`の拡張子をセットしてDLさせるようにしたほうが良いだろう。

その時、MIME値がわからなければJavaScriptは間違った拡張子をセットしてしまう可能性があるので、MIME値によって後付する拡張子を変える仕組みにしたほうが良いかも知れない。

## 結論

ちなみに、Cloudinaryのアカウント側から、PDFの公開設定を変えるなどの方法は見当たらなかった。クライアントがアップロードした`.pdf`のファイルは一般公開はされないものの、Cloudinaryのアカウント側からDLすることはできる。

このCloudinaryの仕様はセキュリティ対策としては中途半端な気がする。ファイル拡張子を消してアップロードしてしまえば意味はなく、開発者の負担になるだけなので、ぜひともこの仕様は排除してもらいたい。

参照元:https://stackoverflow.com/questions/69219596/cannot-access-pdf-using-public-url-uploaded-on-cloudinary

また、`.zip`ではこの拡張子を消してアップロードする方法は通用しない。Cloudinary運営によると利用者によっては不正なファイルを圧縮して配布する可能性があるため、問い合わせをすれば`.zip`の公開はできるが、利用方法を尋ねられる。

参照元:https://support.cloudinary.com/hc/en-us/articles/360016480179-PDF-or-ZIP-files-appearing-in-Media-Library-but-download-URLs-return-an-error-

Cloudinary上では圧縮ファイルの公開はできないと考えても良さそうだ。そんな時はもうAWSを使うしかなさそう。


