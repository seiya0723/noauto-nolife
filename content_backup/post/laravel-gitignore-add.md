---
title: "【Laravel】GitHubにプッシュする時.gitignoreに追加する必要のあるファイル、ディレクトリ"
date: 2021-09-18T11:11:14+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","git","セキュリティ" ]
---


GitHubにプッシュする時、.gitignoreに追加する必要のあるファイル、ディレクトリをここにまとめる。

そんなものはどうでも良いから、もともとあったものと、追加したものを含めた完全版を見せてくれと思う人は、ページ末尾の結論へ。

## 対象に追加するべき、ファイル

    *.log
    *.sqlite
    .htaccess

*.logには開発用サーバーで動かしたログが残る。*.sqliteは言わずもがなデータが残っている。

## 対象に追加するべき、ディレクトリ

    /storage
    /config

`/storage`にはビューの編集履歴が残っていた。そこには開発に使用したPCのファイルパスなども残っているので、色々と問題ありだと思う。

`/config`は設定ファイル関係をまとめたディレクトリ、.envから読み込みする仕掛けになっているので、基本ハードコードする必要はないが、うっかりハードコードしてしまったら漏れるので、追加しておいたほうが良いだろう。


## 結論

結果的に、.gitignoreはこうなる(と思われる)。


    /node_modules
    /public/hot
    /public/storage
    /storage/*.key
    /vendor
    .env
    .env.backup
    .phpunit.result.cache
    Homestead.json
    Homestead.yaml
    npm-debug.log
    yarn-error.log


    *.log
    *.sqlite
    .htaccess
    /storage
    /config


他にも追加する必要のあるものが、あるかも知れないが、本当にバージョン管理から排除する必要があるのか判定できない。Laravelは複雑だ。

また、プロジェクト直下の各ディレクトリにも.gitignoreがあるので、それと重複する可能性がある。

参照元: https://stackoverflow.com/questions/25748132/what-to-include-in-gitignore-for-a-laravel-and-phpstorm-project




