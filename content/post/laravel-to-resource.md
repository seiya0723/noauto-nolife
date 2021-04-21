---
title: "Laravelで--resourceで作ったコントローラのルーティングを解体する"
date: 2021-04-20T16:26:25+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","tips","初心者向け" ]
---

例えば、コントローラーを以下のように作るとする。

    php artisan make:controller TopicsController --resource

これで、Restfulに必要な`create`や`store`等のアクションが自動的に作られるのだが、後からアクションを追加削除しようとした時、ルーディングに追加削除をする必要がある。

その時、このように書かれてあると、ルーティングの書き換えは難しい。そこで、本記事は`--resource`で作ったコントローラのルーティングをバラす。

    Route::resource('/topics', 'TopicsController');

## resourceのルーティング解体

こうなる。


    #Route::resource('/topics', 'TopicsController');

    # ↑と↓は等価


    Route::get('/topics', 'TopicsController@index')->name('topics.index');
    Route::get('/topics/create', 'TopicsController@create')->name('topics.create');
    Route::post('/topics', 'TopicsController@store')->name('topics.store');
    Route::get('/topics/{id}', 'TopicsController@show')->name('topics.show');
    Route::get('/topics/{id}/edit', 'TopicsController@edit')->name('topics.edit');
    Route::put('/topics/{id}', 'TopicsController@update')->name('topics.update');
    Route::delete('/topics/{id}', 'TopicsController@destroy')->name('topics.destroy');


## 結論

開発初期の段階であれば、`--resource`で作ってもアクションは足りるから問題はないが、本格的に作り込み始めるとアクションはいずれ足りなくなる。不要なアクションも増える。

そんなときはルーティング情報をばらしてしまえば良い。これで不要な物は削除して、必要なものを追加しやすくなる。

