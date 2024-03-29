---
title: "【Laravel】Sqliteのデータベースファイルをワンライナーで再生成する【findコマンド+-exec評価式+alias】【migrate:fresh】"
date: 2021-09-18T08:42:15+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","tips","システム管理","bash","ubuntu" ]
---

前々から思っていた。マイグレーションミスってDBごと消してマイグレーションファイルを修正したい場合、DBのファイルを探して削除するのは面倒だと。

プロジェクトのディレクトリで下記コマンドを実行する。

    find ./database/ -name "database.sqlite" -exec rm "{}" \; -exec touch "{}" \;

bashのaliasに登録すれば上記コマンドをさらに短くできる。

    alias laravel-dbrefresh='find ./database/ -name "database.sqlite" -exec rm "{}" \; -exec touch "{}" \;'

このコマンドの注意点は2つある。

1つ目はLaravelプロジェクト直下に移動して実行すること。

2つ目は多分ありえないと思うが、カレントディレクトリの`database`ディレクトリの中にLaravelのプロジェクトを複数入れると、その中にあるdatabase.sqliteが全て削除されてしまう点である。

削除と言うデリケートなコマンドを扱う以上、注意が必要。一応、インタラクティブシェル(削除するか確認する形式)にしたほうが良いかも知れない。


## 投稿されたデータを全て削除して、マイグレーションまでをワンライナーで実現するには？

マイグレーションファイルは間違っておらず、投稿されたデータを一旦全て消して投稿し直したい場合。この場合実行するコマンドは

    php artisan migrate:fresh

これを実行すれば一発でテーブル削除とマイグレーションが実行される。

予めシーダーを用意しておけば、データの復旧も簡単にできる。



