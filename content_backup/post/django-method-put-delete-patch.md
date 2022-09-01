---
title: "【Django】PUT、PATCH、DELETEメソッドのリクエストを送信する【Django REST Framework】"
date: 2022-01-24T13:18:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","ajax","restful" ]
---

## 前提

まず前提として、PUT、PATCH、DELETEのメソッドはHTMLのformタグから送信することはできない。

例外として、Laravelでは下記のようにしてformタグでDELETEメソッドを送信するが、Djangoではそれは通用しない。これから解説するDjango Rest Frameworkを使用しても。

    <form action="{{ route('topics.destroy',$topic->id) }}/" method="POST" style="display:inline-block;">
        {{ csrf_field() }}
        {{ method_field("delete") }}
        <button class="btn btn-outline-danger" type="submit">削除</button>
    </form>

このmethod_fieldの部分はこう解釈される。同じことをDjangoでやっても通用はしない。おそらくLaravelの場合は裏でnameと値を判定して分岐していると思われる。

    <input type="hidden" name="_method" value="delete" />

## では、DjangoでPUT,PATCH,DELETEメソッドを送信するにはどうすればよいか。

参照元:https://stackoverflow.com/questions/5162960/should-put-and-delete-be-used-in-forms

答えは1つ。Ajax(jQuery)を使用する。methodとしてDELETE、PUT、PATCHを指定すればよい。

送信ボタンを押した時、下記Ajaxを発動させ、deleteメソッドを送信する。ただし、メソッドはHTMLの要素から取得するのではなく、ハードコードしなければならない。


    let form_elem   = "#form_area";
    let data        = new FormData( $(form_elem).get(0) );
    let url         = $(form_elem).prop("action");
    let method      = "DELETE";
    
    $.ajax({
        url: url,
        type: method,
        data: data,
        processData: false,
        contentType: false,
        dataType: 'json'
    }).done( function(data, status, xhr ) { 
        //Done
    }).fail( function(xhr, status, error) {
        //Fail
    }); 


## curlでPUT,PATCH,DELETEメソッドを送信するには？

    curl -X DELETE "http://127.0.0.1:8000/"

これでDELETEメソッドが送信できる。

## サンプルコード

1年と半年ぐらい前にも似たようなことをしていた。

[【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】](/post/django-ajax-restful/)のビューを更に最適解に近づけたものが下記。

https://github.com/seiya0723/startup_bbs_restful_custom


