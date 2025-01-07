---
title: "FormDataをformタグではなく、オブジェクトにキーと値をセットした上でAjax送信"
date: 2021-08-14T11:48:15+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "JavaScript","jQuery","Ajax","Django" ]
---

タイトルの説明。

通常、Ajaxでサーバーにリクエストを送信する時、下記のようにFormDataクラスを使用して送信する。


    const form_elem   = "#form_area";
    const data        = new FormData( $(form_elem).get(0) );
    const url         = $(form_elem).prop("action");
    const method      = $(form_elem).prop("method");

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

しかし、送信したいデータがいつもこのようにformタグで囲まれているとも限らない。

そこで、FormDataクラスに引数を入れずにオブジェクトを作り、オブジェクトにキーと値をセットしてAjax送信する。


## FormDataクラスに引数を入れず、オブジェクトにキーと値をセットする。

下記のようにすれば、引数なしのFormDataから作られたオブジェクトにキーと値をセットできる。

    const data    = new FormData();
    data.set("comment","これは.set()によって追加されました");

    console.log(data);

なお、FormDataオブジェクトのメソッドには`.set()`の他に`.append()`がある。

`.set()`は同じキーの場合は上書きされるが、`.append()`の場合は追加になる。

他にもキーを指定して削除する`.delete()`があるので、下記リンクを参考。

https://developer.mozilla.org/ja/docs/Web/API/FormData

### オブジェクト内のキーと値の確認

FormDataオブジェクトにセットされたキーと値は`for of`を使えば参照できる。

    for (const v of data ){ console.log(v); }
    for (const v of data.entries() ){ console.log(v); }

いずれも出力される内容は同じである。


## 403エラーが出る。CSRFトークンはどうする？

ここで上記コードに倣ってAjaxリクエストを実行してもエラーが起こる。CSRFトークンがリクエストボディの中に含まれていないから403エラーが出てしまうのだ。

そこで、上記と同様に適当な場所からCSRFトークンの値を抜き取り、キーと値をセットして送信すればよい。もしくはDjangoであれば、Ajax送信時にCookieからトークンをセットしてくれる、下記スクリプトを予め実行しておく。


    //Ajax実行前にセッションIDを送信するスクリプト
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    

