---
title: "DjangoでAjax(jQuery)を実装、送信と同時に投稿内容を確認する【Django Rest Framework不使用版】"
date: 2021-11-13T07:05:15+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "ajax","django","上級者向け" ]
---

ウェブアプリケーションでAjaxが使えるようになれば、ページ内の一部の要素のみを更新させることができる。

それすなわち、

- 通信量の大幅な削減
- ページのちらつき低減
- SPA(シングルページアプリケーション)の開発可能
- ロングポーリングを使用した永続的な接続が可能(→オンラインチャットなどに転用可能)

など、様々な恩恵が得られる。

Ajaxの実装は実質テンプレートとビュー、[静的ファイル](/post/django-static-file-settings/)の編集のみと非常にシンプル。

今回は[40分Django](https://github.com/seiya0723/startup_bbs)をAjax対応に修正させる。

## 静的ファイルの編集

まず、Ajaxを送信するためのJavaScriptを書いた静的ファイルを用意する必要がある。静的ファイルの読み込みに関しては下記を参照する。

[【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】](/post/django-static-file-settings/)

### CSRFトークン送信用スクリプト(ajax.js)

まず、Ajaxを実装する際に障害になるのが、CSRFのトークン送信問題。普通にAjaxを実装しただけではCSRFトークンが送信されず、エラーが出てしまう。

そこで、Ajax通信実行時、JSを使ってCSRFトークンをHTTPヘッダに追加する必要がある。それがこのコード。

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

https://docs.djangoproject.com/en/3.1/ref/csrf/#ajax

今回はこれを`ajax.js`として、staticディレクトリ内に保存する。

### Ajax送信用スクリプト(script.js)

`script.js`は送信ボタンが押されたときのAjax送信処理を実行している。

    window.addEventListener("load" , function (){
        $("#submit").on("click", function(){ submit(); });
    });
    
    function submit(){
    
        let form_elem   = "#form_area";
    
        let data    = new FormData( $(form_elem).get(0) );
        let url     = $(form_elem).prop("action");
        let method  = $(form_elem).prop("method");
    
        //送信するデータの確認
        for (let v of data ){ console.log(v); }
        for (let v of data.entries() ){ console.log(v); }
    
        $.ajax({
            url: url,
            type: method,
            data: data,
            processData: false,
            contentType: false,
            dataType: 'json'
        }).done( function(data, status, xhr ) { 
    
            if (data.error){
                console.log("ERROR");
            }
            else{
                $("#content_area").html(data.content);
                $("#textarea").val("");
            }
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    }


## テンプレート修正

### ベースのHTML(index.html)

`index.html`は先のCSRFトークン送信用スクリプト、Ajax送信用スクリプトを読み込み、コメントの表示箇所を独立させる。

    {% load static %}
    
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="{% static 'bbs/js/ajax.js' %}"></script>
        <script src="{% static 'bbs/js/script.js' %}"></script>
    </head>
    <body>
    
        <main class="container">
            <form id="form_area" action="" method="POST">
                {% csrf_token %}
                <textarea id="textarea" class="form-control" name="comment"></textarea>
                <input id="submit" type="button" value="送信">
            </form>

            <div id="content_area">{% include "bbs/content.html" %}</div>
        </main>

    </body>
    </html>
    

### 投稿されたコメントエリアをレンダリングするHTML(content.html) 

投稿されたコメントの表示箇所は`content.html`として独立させ、下記を入力。`views.py`から呼び出してレンダリングさせる。

    {% for topic in topics %}
    <div class="border">
        {{ topic.comment }}
    </div>
    {% endfor %}


## forms.pyの作成

`forms.py`の作り方は下記を参照。

[【Django】forms.pyでバリデーションをする【モデルを継承したFormクラス】](/post/django-forms-validate/)

中身は普通のモデルを継承したフォームクラス。Ajaxにするからといって特別な対応をする必要はない。

    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]


## view.pyの修正


    from django.shortcuts import render
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            json    = { "error":True }
            form    = TopicForm(request.POST)
    
            if not form.is_valid():
                print("Validation Error")
                return JsonResponse(json)
    
            form.save()
            json["error"]   = False
    
            topics          = Topic.objects.all()
            context         = { "topics":topics }
            content         = render_to_string("bbs/content.html",context,request)
    
            json["content"] = content
    
            return JsonResponse(json)
    
    index   = BbsView.as_view()

`views.py`のPOSTメソッドでは受け取ったAjaxのリクエストを処理する。

`JsonResponse`はAjaxにjsonを返却するための関数。`render_to_string`はレンダリング結果のHTMLを文字列にするための関数。つまり、POSTメソッドの流れはこうなる。


1. ユーザーからAjaxでPOSTメソッドを受け取る
1. ビューのPOSTメソッドの処理開始
1. フォームクラスでバリデーション
1. バリデーションOKならDBへ保存
1. DBに格納されているデータを全て読み込み
1. 読み込みした結果で`content.html`へ部分的にレンダリング
1. 部分的にレンダリングした結果をjsonにしてJavaScriptへ返す
1. JavaScriptはその結果がエラーでなければ部分的なレンダリング結果を書き換える。

これにより、投稿したら画面全体が切り替わること無く、部分的に更新される。


## 動かすとこうなる。

開発用サーバーを起動。

    python3 manage.py runserber 127.0.0.1:8000

下記画像のようになればOK

<div class="img-center"><img src="/images/Screenshot from 2020-11-06 10-44-25.png" alt="Ajaxリクエストを送信して文字列の送信が可能"></div>

画面遷移が無いので、連続でPOSTメソッドを送信することができる。

後はJS側で修正すれば、リアルタイムで情報を更新することが可能になる。リアルタイム性が求められるチャットなどで転用できる。

## 結論

Ajaxが実用できれば、送信のたびに画面全体が切り替わることがなくなるので、細かい修正を繰り返したり、動画などのコンテンツを再生しながらのコメント投稿が実現できる。

JavaScript側で一定時間経ったら再度Ajaxを送信する仕掛けにすれば、画面放ったらかしでも自動的に最新情報が表示されるようになる。チャットやトレード等の情報の共有にリアルタイム性を求めるのであれば必須の技術である。

【関連記事】[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)


