---
title: "Laravel 8.x系のroute/web.phpはこう書く【Target class [Controller Name] does not exist.】"
date: 2021-12-21T16:28:45+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","tips" ]
---


## resource

こうする。

    #7.x系以前の書き方。
    #Route::resource('/topics', 'TopicsController');

    #8.x系以降の書き方。
    use App\Http\Controllers\TopicsController;
    Route::resource('/topics', TopicsController::class);
    

