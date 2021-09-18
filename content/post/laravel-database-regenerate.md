---
title: "【Laravel】Sqliteのデータベースファイルをワンライナーで再生成する【findコマンド+-exec評価式+alias】"
date: 2021-09-18T08:42:15+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","tips","システム管理","bash","ubuntu" ]
---

前々から思っていた。マイグレーションミスってDBごと消してマイグレーションファイルを修正したい場合、DBのファイルを探して削除するのは面倒だと。

そこで、bashのaliasにdatabase.sqliteを探して削除、その後生成するワンライナーコマンドを登録すればよいと思い至った。

    alias laravel-dbrefresh='find ./database/ -name "database.sqlite" -exec rm "{}" \; -exec touch "{}" \;'

このコマンドの注意点は2つある。

1つ目はLaravelプロジェクト直下に移動して実行すること。

2つ目は多分ありえないと思うが、カレントディレクトリの`database`ディレクトリの中にLaravelのプロジェクトを複数入れると、その中にあるdatabase.sqliteが全て削除されてしまう点である。

削除と言うデリケートなコマンドを扱う以上、注意が必要。一応、インタラクティブシェル(削除するか確認する形式)にしたほうが良いかも知れない。

