---
title: "【Django】Ajax(jQuery)でロングポーリングを実装させる【チャットサイトの開発に】"
date: 2022-04-28T16:06:12+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","ajax","コスト削減" ]
---

Ajaxを使えば、ページを部分的に更新させることができる。

そして、setTimeoutを使うことで、指定した時間おきにページを部分的に更新することができる。

ただ、Ajaxによるリクエストとレスポンスを繰り返している(ただのポーリング)ようでは、ウェブサーバーに負担が掛かってしまう。

クラウドサーバーなどは死活問題で、負荷が増えると課金してサーバーの強化などを考慮しなければならない。

そこで、リクエストとレスポンスを繰り返すのではなく、リクエストを受け取り、一定期間DBをチェック、最新版が存在するか一定時間が過ぎればレスポンスを返すように仕立てる。

これをロングポーリングと言う。本記事では[40分Django](/post/startup-django/)にAjaxを搭載し、一定期間DBをチェックするロングポーリング仕様の作り方を解説する。

## models.py

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
        
        #ロングポーリングを実現させるためには、order_byは必須。並び替えを機能させるために、投稿日時を記録するフィールドを追加しておく。
    
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
        comment = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment
    

投稿日時のフィールドを追加する。これがないと投稿日を最新順でソートして、最新の投稿を比較することができなくなるからだ。

IntegerFieldであればidでも良いが、UUIDFieldを使用する場合、使い物にならない。


## forms.py


    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]
    
    #ロングポーリング用のフォームクラス
    class TopicFirstForm(forms.Form):
    
        #Topicのidに基づく
        first   = forms.IntegerField(required=False)
    

最新のデータを比較するためのフォームクラスを作っておく。


## views.py

    from django.shortcuts import render
    
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .forms import TopicForm,TopicFirstForm
    
    import time
    
    class IndexView(View):
        
        def render_content(self,request):
            topics          = Topic.objects.order_by("-dt")
            context         = { "topics":topics }
    
            return render_to_string("bbs/content.html",context,request)
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.order_by("-dt")
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            data    = { "error":True }
            form    = TopicForm(request.POST)
    
            if not form.is_valid():
                print(form.errors)
                return JsonResponse(data)
    
            form.save()
    
            data["error"]   = False
            data["content"] = self.render_content(request)
    
            return JsonResponse(data)
    
        def delete(self, request, *args, **kwargs):
            
            data    = { "error":True }
    
            if "pk" not in kwargs:
                return JsonResponse(data)
    
            topic   = Topic.objects.filter(id=kwargs["pk"]).first()
    
            if not topic:
                return JsonResponse(data)
    
            topic.delete()
    
            data["error"]   = False
            data["content"] = self.render_content(request)
    
            return JsonResponse(data)
    
    index   = IndexView.as_view()
    
    
    # ロングポーリング
    class RefreshView(View):
    
        def get(self, request, *args, **kwargs):
    
            data    = { "error":True }
    
            form    = TopicFirstForm(request.GET)
            
            #誰も何も投稿していない場合、firstに来る値は何もないので、必ずバリデーションエラーになってしまう。
            #未投稿の状況でもロングポーリングをさせるには、nullを許可する必要が有ると思われる。←required=Falseで対処
            if not form.is_valid():
                print(form.errors)
                return JsonResponse(data)
    
            cleaned         = form.clean()
    
            first_id        = None
            if "first" in cleaned:
                first_id    = cleaned["first"]
    
    
            #30回ループする。(1秒おきにDBにアクセスする)
            #CHECK:このループは最大で30秒間レスポンスを返さないことを意味しているので、ブラウザのタイムアウトを考慮して調整する必要が有る。
            for i in range(30):
    
                topic   = Topic.objects.order_by("-dt").first()
    
                #topicが存在しており、そのtopicがかつての最新のものと違う場合、ループを抜ける。
                if topic:
                    if topic.id != first_id:
                        break
                else:
                    #かつての最新の投稿がNoneではない場合、削除されたことを意味するので、この場合もループを抜ける
                    if first_id != None:
                        break
    
                time.sleep(1)
                #print("ロングポーリング中")
    
    
            topics  = Topic.objects.order_by("-dt")
            context = { "topics":topics }
    
            data["error"]   = False
            data["content"] = render_to_string("bbs/content.html",context,request)
    
            return JsonResponse(data)
    
    refresh = RefreshView.as_view()
    

今回は最大で30秒間レスポンスを返却しない仕様に仕立てた。

あんまり長い間ループしすぎると、ブラウザがタイムアウトと判定して、レスポンスが正常に返却できず更新されない。

とは言え、これで少なくともウェブサーバーに送られるリクエストを30分の1にすることができる。

## templates

部分的に更新されるHTMLはcontent.html

全体はindex.html

### index.html

    {% load static %}
    
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        {# Ajaxを送信する時、ヘッダにCSRFトークンをセットする。 #}
        <script src="{% static 'js/ajax.js' %}"></script>
        <script src="{% static 'js/script.js' %}"></script>
    </head>
    <body>
    
        <main class="container">
            <form id="form_area" action="" method="POST">
                <textarea id="textarea" class="form-control" name="comment"></textarea>
                <input id="submit_form" type="button" value="送信">
            </form>
    
            <div id="content_area">{% include "bbs/content.html" %}</div>
    
        </main>
    </body>
    </html>
    

### content.html

    {% for topic in topics %}
    
    {% if forloop.first %}
    <input id="first" type="hidden" value="{{ topic.id }}" name="first">
    {% endif %}
    
    
    <div class="border">
        <div>{{ topic.dt }}</div>
        <div>{{ topic.comment }}</div>
        <form action="{% url 'bbs:single' topic.id %}">
            <input class="btn btn-outline-danger trash" type="button" value="削除">
        </form>
    </div>
    {% empty %}
    <input id="first" type="hidden" value="" name="first">
    
    
    {% endfor %}
    

最新の投稿のIDをレンダリングしておく。これをAjaxで送信し、ビューに比較することでロングポーリングが成立する。


## script.js

    window.addEventListener("load" , function (){
    
        //イベントをセットする要素が動的に変化する場合、documentからイベントを指定する
        $(document).on("click","#submit_form", function(){ submit_form(); });
        $(document).on("click",".trash", function(){ trash(this); });
    
        refresh();
    });
    
    function submit_form(){
    
        let form_elem   = "#form_area";
    
        let data    = new FormData( $(form_elem).get(0) );
        let url     = $(form_elem).prop("action");
        let method  = $(form_elem).prop("method");
    
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
    
    function trash(elem){
    
        let form_elem   = $(elem).parent("form");
        let url         = $(form_elem).prop("action");
    
        $.ajax({
            url: url,
            type: "DELETE",
            dataType: 'json'
        }).done( function(data, status, xhr ) { 
    
            if (data.error){
                console.log("ERROR");
            }
            else{
                $("#content_area").html(data.content);
            }
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    }
    
    
    function refresh(){
    
        let value   = $("#first").val();
        let key     = $("#first").prop("name");
    
        query       = "?" + key + "=" + value;
    
        $.ajax({
            url: "refresh/" + query ,
            type: "GET",
            dataType: 'json'
        }).done( function(data, status, xhr ) { 
    
            if (data.error){
                console.log("ERROR");
            }
            else{
                $("#content_area").html(data.content);
            }
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }).always( function(){
    
            //成功しても失敗しても実行されるalways
            console.log("refresh");
    
            //ロングポーリング(サーバー内で回すよう)に仕立てるので、リクエストの送信はほぼ即時で問題ない
            setTimeout(refresh, 500);
    
        });    
    }
    

削除機能も実装されている。

ロングポーリングを実装させたので、setTimeoutの待ち時間はもはやなくても良いだろうが、バリデーションエラーの可能性もあるので、一定時間待ったほうが良いだろう。


## 実際に動かすとこうなる。

静止画なのでよくわからないが、動く。

<div class="img-center"><img src="/images/Screenshot from 2022-04-28 16-49-24.png" alt=""></div>

リクエスト総数は大幅に削減できる。

<div class="img-center"><img src="/images/Screenshot from 2022-04-28 16-50-51.png" alt=""></div>

これでウェブサーバーは救われる。

## このコードの問題点

### 比較する先頭のデータ以外が削除された時、即更新されない

現状、先頭のデータのIDだけを比較しているので、先頭以外が削除された時、即更新がされない。

これは編集機能を実装させた時にも影響が出るだろう。もっとも、チャットに削除や編集の機能は不要と思われるが。

もし、今回のコードに削除の機能がオミットされるのであれば、条件式はもっとシンプルになると思われる。


## 結論

まだまだ作りたてなので、洗練されていない感があるが、一応これでロングポーリングが実現された。

後はチャットサイトらしく、ユーザー名を表示させたり、画像をアップロードさせたりすると良いだろう。

下記にチャットサイトを開発する際に役に立つであろう記事を列挙する。

### 画像をアップロードさせる

こんな難易度の高すぎる記事を読んでいる人向けにあえて解説するまでもないが、一応リンクを張っておく。

[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)

### お絵かきチャットとして機能させる

お絵かきチャットは、今回のロングポーリングによって、多大な恩恵を受けることができると思われる。

[【Django】canvasで描画した画像をAjax(jQuery)で送信【お絵かきBBS、イラストチャット、ゲームのスクショ共有などに】](/post/django-canvas-send-img-by-ajax/)


画像のアップロードは通信容量を圧迫する。スマホなどの通信容量制限が掛かっている場合、従来のポーリング仕様のコードではあっという間に制限に到達する可能性が有る(ただし、実際にはブラウザのキャッシュとして画像を残している場合がある)

しかも既にこの記事のコードはAjaxで書かれているので、実装は容易いだろう。

後は、色とペイントツールを充実させることで本格的なお絵かきチャットとして運営できる。

### カスタムユーザーモデルとallauthを実装させる

チャットサイトとして運営をするのであれば、状況によって認証機能は必要に迫られる。

ユーザーモデルにアイコンを記録するフィールドを追加するだけで、もう電話やビデオ通話ができないLINEのような、メッセンジャー系ウェブアプリになるだろう。

[【Django】allauthを使用し、カスタムユーザーモデルを搭載させ、SendgridのAPIでメール認証をする簡易掲示板【保存版】](/post/django-allauth-custom-user-model-sendgrid/)

### 不適切な言葉を禁止する

チャットはリアルタイム性が求められる。掲示板のように投稿内容を管理者が承認して、その上で表示といったことは不可能。

だからこそ、不適切な言葉の使用を規制するには、バリデーションで判定をする必要がある。

[【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】](/post/django-models-origin-validators/)

### 課金機能の実装

Stripeを使用することでカードを使用しての課金機能の実装ができる。

本格的にサイトを運営するときには欲しい機能ではある

[【Stripe】Djangoにクレジットカード決済機能を実装させる](/post/startup-django-stripe/)

## ソースコード

https://github.com/seiya0723/django_long_polling
