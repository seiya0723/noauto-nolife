---
title: "【Django】canvasで描画した画像をAjax(jQuery)で送信【お絵かきBBS、イラストチャット、ゲームのスクショ共有などに】"
date: 2021-10-21T07:25:39+09:00
draft: false
thumbnail: "images/Screenshot from 2021-10-21 12-59-49.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","canvas","Ajax","Django","上級者向け" ]
---


例えば、チャットサイト、掲示板サイトでユーザーが描画したイラストを投稿できる形式にしたい時。

ユーザーが手元の端末でペイントツールを起動して画像を保存して、サイトに添付して貼り付けるのはやや面倒。それだけでなく、サイト独自のレギュレーション(お題に沿ってイラストを付け加える形式、指定された色しか使ってはいけないなど)がある場合、ユーザーのペイントツールでそれを強いるのは不可能に近い。

そこで、サイト上でイラストが描画できるよう、canvas要素を使用して、Ajax(jQuery)でサーバーへ送信を行う。フロントからサーバーサイドまで一貫性がなければ実現できないので、私が得意のDjangoで実現させ、ここにその方法を記す。

コードは[40分の簡易掲示板のコード](/post/startup-django/)を流用して作っている。
 
## フロントサイドのコード

### HTML

まず、HTML。Bootstrapの他に2つのJSを読み込みしている。

    {% load static %}
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        <script src="{% static 'bbs/js/script.js' %}"></script>
    
        <script src="{% static 'bbs/js/draw.js' %}"></script>
        <link rel="stylesheet" href="{% static 'bbs/css/style.css' %}">
    </head>
    <body>
    
        <h1 class="bg-primary text-white text-center">お絵かき掲示板</h1>
    
        <main class="container">
            <form id="form_area" action="{% url 'bbs:index' %}" method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <div class="my-2">
                    <canvas id="canvas" class="canvas" width="300px" height="300px"></canvas>
                    <input id="canvas_clear" class="btn btn-danger" type="button" value="クリア">
                </div>
                <input id="submit" class="form-control" type="button" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.comment }}</div>
                <div><img src="{{ topic.img.url }}" alt="投稿画像"></div>
            </div>
            {% endfor %}
        </main>
    </body>
    </html>

canvasタグには、直接width属性、height属性を付与してサイズを指定すること。間違ってもCSSからcanvasタグに対してwidthとheightを指定してはいけない(挙動がおかしくなるため)。

Ajaxで送信をするのが`script.js`、canvasに絵を描く仕組みを提供しているのが`draw.js`。

### Ajaxでcanvasを画像化させ送信する(script.js)

    window.addEventListener("load" , function (){
    
        //送信処理
        $("#submit").on("click", function(){ send(); });
    
    });
    
    function send(){
    
        let form_elem   = "#form_area";
    
        let data    = new FormData( $(form_elem).get(0) );
        let url     = $(form_elem).prop("action");
        let method  = $(form_elem).prop("method");
    
        //===================canvasの画像化処理==================================================
    
        //TODO:何も描いていない場合、そのまま送信されてしまう問題がある。
        let context = document.getElementById('canvas').getContext('2d');
        var base64  = context.canvas.toDataURL('image/png');
    
        // Base64からバイナリへ変換
        var bin     = atob(base64.replace(/^.*,/, ''));
        var buffer  = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
    
        //ファイル名は日付
        let dt          = new Date();
        let filename    = dt.toLocaleString().replace(/\/| |:/g,"");
    
        //バイナリでファイルを作る
        var file    = new File( [buffer.buffer], filename + ".png", { type: 'image/png' });
    
        data.append("img",file);
        for (let v of data.entries() ){ console.log(v); }
    
        //===================canvasの画像化処理==================================================
        
        $.ajax({
            url: url,
            type: method,
            data: data,
            processData: false,
            contentType: false,
            dataType: 'json'
        }).done( function(data, status, xhr ) {
    
            if (!data.error){
                //リダイレクト
                window.location.replace("");
            }
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    
    }


[Djangoで動画投稿時にサムネイルもセットでアップロードする【DRF+Ajax(jQuery)+canvas】](/post/django-ajax-thumbnail-upload/)にて解説したものを流用している。

送信ボタンをクリックした時、canvasの部分をPNGファイル化させ、Ajax送信時にコメントもセットで送信させる。

送信成功したら、ページを更新させ投稿した内容が表示される。

### canvasにマウスでイラストを描く(draw.js)

マウスを使ってイラストを描く部分。

    window.addEventListener("load" , function (){
        const canvas        = document.querySelector('#canvas');
        const ctx           = canvas.getContext('2d');
        const last_pos      = { x: null, y: null };
    
        //canvasの配置座標を取得
        const CANVAS_X      = canvas.getBoundingClientRect().left;
        const CANVAS_Y      = canvas.getBoundingClientRect().top;
    
        let is_drag         = false;
     
        //描画(線の始まりと終わりの座標を指定してstroke()で描画)
        function draw(x, y) {
            if (!is_drag) { return; }
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.lineWidth   = 5;
            ctx.strokeStyle = "#000000";
    
            if (last_pos.x === null || last_pos.y === null) { ctx.moveTo(x, y); }
            else { ctx.moveTo(last_pos.x, last_pos.y); }
    
            ctx.lineTo(x, y);
            ctx.stroke();
     
            last_pos.x  = x;
            last_pos.y  = y;
        }
     
        //全消し
        function clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
     
        function drag_start(event) {
            ctx.beginPath();
            is_drag     = true;
        }
     
        function drag_end(event) {
            ctx.closePath();
            is_drag     = false;
            last_pos.x  = null;
            last_pos.y  = null;
        }
     
        //イベント
        const clearButton = document.querySelector('#canvas_clear');
        clearButton.addEventListener('click', clear);
    
        canvas.addEventListener('mousedown', drag_start);
        canvas.addEventListener('mouseup', drag_end);
        canvas.addEventListener('mouseout', drag_end);
        canvas.addEventListener('mousemove', (event) => { draw(event.clientX - CANVAS_X, event.clientY - CANVAS_Y); });
        //↑クリックされた座標からcanvasの配置座標を減算、draw関数の引数として与える。.layerX、.layerYではズレる。
    
    
    });



描画の仕組み

1. マウス押下で開始位置決定
1. そのまま動くと開始位置から動いた先まで描画
1. さらに動くと、さらに動いた先まで描画
1. 2~3が繰り返され、マウスボタンを離すと描画終了

図にするとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-21 13-42-02.png" alt="描画の仕組み"></div>

実際には上記図のように緑の線が直線的ではなく、動いた瞬間にJavaScriptのイベントが発火するため、とても滑らかな線を描画するようになる。1pxでもマウスが動けばイベント発火で描画されるので、普通のペンのように扱うことができる。

参照元:https://qiita.com/Ryota-Onuma/items/61414b513979e94eaefa

参照元ではcanvasのクリック座標がおかしかったので、修正を施した。

## サーバーサイドのコード

### モデル

`models.py`にて、`ImageField`を追加する。

    from django.db import models
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        img     = models.ImageField(verbose_name="イラスト",upload_to="img/")
    
        def __str__(self):
            return self.comment
    
この他にも、`settings.py`と`urls.py`で画像送信可能なように仕立てる。詳しくは『[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)』を参照。


### フォーム

`forms.py`にて、モデルを継承したフォームクラスを定義する。

    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment","img" ]

### ビュー

`views.py`にて、Ajaxを受取り、バリデーションをした上で保存。`JsonResponse`を返却。

    from django.shortcuts import render,redirect
    from django.http.response import JsonResponse
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            json    = { "error":True }
    
            form    = TopicForm(request.POST,request.FILES)
    
            if form.is_valid():
                print("OK")
                json["error"]   = False
                form.save()
            else:
                print("NG")
    
            return JsonResponse(json)
    
    index   = BbsView.as_view()

## 実際に動かすとこうなる。

こんなふうにcanvasに描いた画像がAjaxで投稿できる。バリデーションOKであれば、リダイレクトされ、投稿内容が表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-21 12-59-49.png" alt="描いた画像の投稿ができた"></div>

## 結論

似たような内容を[動画のサムネイルを作る記事](/post/django-ajax-thumbnail-upload/)でも解説したが、今回は流用が効くようになるべくシンプルに仕立てた。

スマホでの利用も考慮すると、canvasの表示領域は300px*300pxが妥当かと思われる。

これは単にcanvasの表示領域から画像を作って、Ajaxでサーバーへ送信しているだけだから、canvasゲームのスクリーンショット共有などにも応用できる。

## ソースコード

https://github.com/seiya0723/django_ajax_canvas
