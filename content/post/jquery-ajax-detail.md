---
title: "【保存版】Ajax(jQuery)の仕組みと仕様"
date: 2022-07-15T11:42:54+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "サーバーサイド" ]
tags: [ "JavaScript","jQuery","Ajax" ]
---

本記事は、たびたび忘れがちなAjaxのパラメータや引数などの意味を思い返すための備忘録である。


```
    let form_elem   = "#form_area";

    let data    = new FormData( $(form_elem).get(0) );
    let url     = $(form_elem).prop("action");
    let method  = $(form_elem).prop("method");


    $.ajax({
        url: url,           // リクエストの送信先
        type: method,       // 送信するリクエストのメソッド
        data: data,         // 送信するデータ(FormDataオブジェクト型)
        processData: false, // dataに指定した内容をURLエンコードして送信(?page=2などの形式)にするかの指定。FormDataオブジェクトの場合はfalseを指定
        contentType: false, // デフォルトでは"application/x-www-form-urlencoded"になっている。このままではURLエンコードで送信されてしまうので、falseを指定
        dataType: 'json'    // レスポンスはJSONを指定
    }).done( function(data, status, xhr ) {
        // dataはレスポンスの内容、
        // statusはレスポンスのステータス [success, notmodified, nocontent, error, timeout, abort, parsererror]のいずれかが返却される。(参照元: https://qiita.com/otsukayuhi/items/31ee9a761ce3b978c87a )
        // xhrはXMLHttpRequestオブジェクト (参照元: https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest ) 


        //Ajaxのリクエストに対してレスポンスが返ってきた時の処理

    }).fail( function(xhr, status, error) {
        //errorはエラーの内容が表示される。

        console.log(status + ":" + error );

        //Ajaxのリクエストに対してレスポンスが返ってこなかった時
    });
```


XMLHttpRequestオブジェクトに関しては、素のJavaScriptを使ったAjaxの記事を見るとわかる。

[素のJavaScriptのXMLHttpRequest(Ajax)で通信する【jQuery不使用】](/post/django-xmlhttprequest-ajax-not-use-jquery/)


```
    const request = new XMLHttpRequest();
```

この`request`がXMLHttpRequestオブジェクトである。これを使って、指定したURLとメソッドへAjaxを送信することができる。





