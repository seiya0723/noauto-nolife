---
title: "【Laravel】静的ファイルのディレクトリ作るときの注意点【publicのディレクトリ名で即404エラー】"
date: 2021-02-08T14:59:16+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","初心者向け","tips" ]
---

Laravelで静的ファイルを作る時、アプリごとにCSSとJSを仕分けしたい場合がある。しかし、作るディレクトリ名を間違えれば、たちまち404エラーが出てしまう。

本記事ではLaravelの404エラーの原因のひとつであるパスの衝突について解説する。


## Laravelで404エラーが起こる原因

例えば、ルーティングがこんな状態で

    Route::get('/', function () {
        return view('welcome');
    });
    Route::resource("/memo","MemoController");

`memo`というアプリを作ったとしよう。当然、`memo`アプリ内で使用する`CSS/JS`をひとまとめにしたいと思い、`public`ディレクトリにこんなふうな名前のディレクトリを作る

    mkdir public/memo/

これで404エラーが起こってしまう。

<div class="img-center"><img src="/images/Screenshot from 2021-02-08 15-09-38.png" alt="404エラー"></div>

なぜかと言うと、クライアントから見て、パスが重複しているから。静的ファイルを配信する http://127.0.0.1:8000/memo とアプリを表示させる http://127.0.0.1:8000/memo が重複している。だから構造上の問題で404エラーを出してしまうのだ。

## publicでディレクトリを作る時の対策

publicでディレクトリを作る時、アプリ名と同名のディレクトリを作りたいときは、パスを重複させないようにすれば良い。

つまり、作るディレクトリは

    mkdir public/memo/
    
ではなく

    mkdir public/static/memo/

とすれば良いのだ。上記のように`static`の中に各アプリのディレクトリを作り、その中にcssとjsのディレクトリを作る。これでアプリごとの静的ファイルの管理ができる。

    mkdir public/static/memo/css
    mkdir public/static/memo/js

## 結論

ちなみにこれはpublicディレクトリにシンボリックリンクを貼る、クライアントがアップロードした画像の保存先ディレクトリにも同じ事が言える。ルーティング情報と静的ファイルの配置と名前によっては重複が発生し、即404となる。

Laravelではこのように404エラーが出た時、まっさきに確認に行くのがコントローラやルーティング辺りになるだろう。しかし、ルーティングやコントローラは何も間違っていない。故に初心者の方は、このエラーに気づけない事が多い。

ブラウザ上のエラーも単に404と表示するだけで、ヒントも何もないのでハマると何時間もこの問題に費やしてしまう。Laravelのこの辺りがちょっと不親切に思う。

