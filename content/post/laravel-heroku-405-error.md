---
title: "Ajax搭載したLaravelをHerokuにデプロイした時、405エラーが出る問題の解決【method not allowed】"
date: 2021-02-13T14:07:52+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","heroku","初心者向け" ]
---


Herokuにデプロイ後、Ajaxを使ったPOST文をサーバーサイドに送信しようとすると、405、即ちMethod Not Allowedがコンソールに表示される。

ルーティングには問題なくPOST文のメソッドは記述されているし、コントローラにも処理はある。何より開発サーバー上で問題なく動いていたものが、Herokuデプロイ後に動作しなくなるのはHeroku上の問題だと思い、あれこれやってみたが、一向にうまく行かない。

本記事ではこのHerokuデプロイ後のAjaxリクエストが動作しない問題について解説する。

## 問題のコード

下記がルーティング。

    Route::get('memo/', 'MemoController@index')->name('memo.index');
    Route::post('memo/', 'MemoController@search')->name('memo.search');
    Route::post('memo/mod/', 'MemoController@store')->name('memo.store');
    Route::delete('memo/mod/', 'MemoController@destroy')->name('memo.destroy');
    Route::put('memo/mod/{uuid}/', 'MemoController@update')->name('memo.update');

そして、送信するAjaxのコードがこちら。投稿処理のみ掲載。

    //投稿処理
    function store(){
    
        var data = new FormData( $("#modal_form").get(0) );
        
        $.ajax({
            url: "/memo/mod/",
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
        }).done( function(data, status, xhr ) { 
    
    
            modal_close();
    
            //sidebar.js
            mode_initialize();
            search();
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    
    }

これで投稿を実行すると、コンソールから405エラー、Method Not Allowedと言われ、投稿処理に失敗する。一見、コントローラには何の問題もなさそうだ。開発サーバーでも難なく送信できていたわけで、エラーになる要素が見当たらない。

## 解決策

結論を言うと、ルーティングのパス指定が間違っている。Laravelではパスの末尾に`/`を記述してはならない。つまり、下記ルーティングを


    Route::get('memo/', 'MemoController@index')->name('memo.index');
    Route::post('memo/', 'MemoController@search')->name('memo.search');
    Route::post('memo/mod/', 'MemoController@store')->name('memo.store');
    Route::delete('memo/mod/', 'MemoController@destroy')->name('memo.destroy');
    Route::put('memo/mod/{uuid}/', 'MemoController@update')->name('memo.update');
    
    #↓下記のようにパス末尾の/を消す
    
    Route::get('memo', 'MemoController@index')->name('memo.index');
    Route::post('memo', 'MemoController@search')->name('memo.search');
    Route::post('memo/mod', 'MemoController@store')->name('memo.store');
    Route::delete('memo/mod', 'MemoController@destroy')->name('memo.destroy');
    Route::put('memo/mod/{uuid}', 'MemoController@update')->name('memo.update');

こうすれば良い。続いて、同様にAjaxのコードも

    //投稿処理
    function store(){
    
        var data = new FormData( $("#modal_form").get(0) );
        
        $.ajax({
            url: "/memo/mod", //←/を消す
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
        }).done( function(data, status, xhr ) { 
    
    
            modal_close();
    
            //sidebar.js
            mode_initialize();
            search();
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    
    }

こうする。

## 結論

他フレームワークではパスの末尾に`/`を記述する必要があったのでLaravelでもそうしてしまったら、Herokuデプロイ後に405エラーで受け付けてくれなかった。開発用サーバー上では問題なく動いてくれているので、余計にややこしい。

ちなみに、この問題Stackoverflowからの受け売りである。英語で検索すれば大抵の問題の答えはすぐに見つかる。

https://stackoverflow.com/questions/33796358/laravel-5-1-ajax-returning-405-get-method-not-allowed-even-when-i-am-sending-a



