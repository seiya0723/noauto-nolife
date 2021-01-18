---
title: "DjangoでAjax(jQuery)を実装する方法【非同期通信】【Restful不使用版】"
date: 2020-11-05T12:05:15+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "ajax","django","上級者向け" ]
---


ウェブアプリケーションでAjax(非同期通信)が使えるようになれば、ページ内の一部の要素のみを更新させることができる。

それすなわち、

- 通信量の大幅な削減
- ページのちらつき低減
- SPA(シングルページアプリケーション)の開発可能
- ロングポーリングを使用した永続的な接続が可能(→オンラインチャットなどに転用可能)

など、様々な恩恵が得られる。

Ajaxの実装は実質templatesとviews.pyの編集のみと非常にシンプル。ただ、資料が限定されているため、一定の事前知識が求められる点に注意。

今回は https://github.com/seiya0723/startup_bbs をAjax対応に修正させる。

ちなみに、本記事のコードをRestful化したものは下記を参考に。

[【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】](/post/django-ajax-restful/)


## CSRFトークン送信用スクリプト

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

## テンプレート修正

`index.html`は先のコードを読み込み、Ajax送信用スクリプトを読み込み、コメントの表示箇所を独立させる。

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
        <script src="{% static 'bbs/js/onload.js' %}"></script>
    </head>
    <body>
    
        <main class="container">
            <form>
                {% csrf_token %}
                <textarea id="comment" class="form-control" name="comment"></textarea>
                <input id="submit" type="button" value="送信">
            </form>
    
            <div id="comment_area">
                {% include "bbs/comment.html" %}
            </div>
    
        </main>
    </body>
    </html>
    

投稿されたコメントの表示箇所は`comment.html`として独立させ、下記を入力。`views.py`から呼び出してレンダリングさせるためだ。

    {% for content in data %}
    <div class="border">
        {{ content.comment }}
    </div>
    {% endfor %}


onload.jsは送信ボタンが押されたときのAjax送信処理を実行している。

    $(function (){ 
    
        $("#submit").on("click", function(){ ajax_send(); }); 
    
    });
    
    function ajax_send(){
        
        var user_param   = { comment   : $("#comment").val() };
    
        $.ajax({
            url         : "", 
            contentType : 'application/json; charset=utf-8',
            type        : "POST",
            data        : JSON.stringify(user_param),
        }).done( function(data, status, xhr ) { 
            $("#comment_area").html(data.content);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    
    }

それからstaticファイルを読み込むので、settings.pyに下記を追加しておく。

    STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]

## view.pyの修正

`views.py`は受け取ったAjaxのリクエストをさばけるようにする。json形式で送信されるので、それを`json.loads`で解釈する。

    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            data    = Topic.objects.all()
            context = { "data":data }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            request_post    = json.loads(request.body.decode("utf-8"))
    
            if "comment" in request_post:
    
                posted  = Topic( comment = request_post["comment"] )
                posted.save()
    
                data    = Topic.objects.all()
                context = { "data":data }
    
                content_data_string     = render_to_string('bbs/comment.html', context ,request)
                json_data               = { "content" : content_data_string }
    
                return JsonResponse(json_data)
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()

## 開発サーバーを起動して挙動確認

    python3 manage.py runserber 127.0.0.1:8000


下記画像のようになればOK

<div class="img-center"><img src="/images/Screenshot from 2020-11-06 10-44-25.png" alt="Ajaxリクエストを送信して文字列の送信が可能"></div>

画面遷移が無いので、連続でPOSTメソッドを送信することができる。

後はJS側で修正すれば、リアルタイムで情報を更新することが可能になる。リアルタイム性が求められるチャットなどで転用できる。


## 結論

今回はフォームによるバリデーションを実装しなかったが、基本的にAjaxの実装は`views.py`と`templates`辺りの修正だけで事は足りる。

事前にCSRFトークンを送信しなければならないので、POST文を実行する場合はトークン送信用スクリプト実装を忘れずに。

【関連記事】[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)


## ソースコード

https://github.com/seiya0723/startup_bbs_ajax


