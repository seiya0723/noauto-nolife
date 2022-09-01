---
title: "Laravel 8.x系のroute/web.phpはこう書く【Target class [Controller Name] does not exist.】"
date: 2021-12-20T16:28:45+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","tips" ]
---

Laravel7.x系はサポートが切れているので早めにLaravel8.x系にしたいところ。

ルーティングの記法が変わっているので確認しましょう。

## --resourceの場合

こうする。

    #7.x系以前の書き方。
    #Route::resource('/topics', 'TopicsController');

    #8.x系以降の書き方。
    use App\Http\Controllers\TopicsController;

    Route::resource('/topics', TopicsController::class);

冒頭で予めコントローラをuseしておく。
    

## コントローラのアクションと逆引き用の名前を指定する場合。

こうする。

    #7.x系以前の書き方。
    #Route::get('/topics', 'TopicsController@index')->name('topics.index');

    #8.x系以降の書き方。
    use App\Http\Controllers\TopicsController;

    Route::get('/topics', [TopicsController::class, 'index'])->name('topics.index');

先ほどと同じように冒頭で予めコントローラをuseしておく。

## 結論

下記記事にLaravel8.x系のルーティングを追記した。

[Laravelで--resourceで作ったコントローラのルーティングを解体する](/post/laravel-to-resource/)
