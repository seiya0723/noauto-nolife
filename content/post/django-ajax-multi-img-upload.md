---
title: "【Django】Ajaxで複数枚の画像を一回のリクエストでアップロードする。"
date: 2022-03-21T18:25:17+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","ajax","上級者向け" ]
---


## 経緯

例えば、1つのデータに対して、複数枚の画像を記録したい場合がある。

ECサイトの商品がその例で、1つの商品に対して、複数枚の画像を記録する必要がある。

しかも、商品に対して記録する画像の枚数が10枚以上になる可能性もあり、これを1つのモデルに画像フィールド10個などとしているようではDBの構造上の問題に発展する。

だからこのような場合は、商品モデルと商品画像モデルの1対多のリレーションを組むべきである。

問題は、商品を記録するとき、商品の画像も同時にアップロードして、まとめて記録すること。フォームが2つに分かれているようでは使い勝手は非常に悪いだろう。

そこで、本記事では商品と複数枚の画像をまとめてアップロード・記録できるように仕立てた。本記事ではAjaxを使用しているが、データ形式としてFormDataを使用しているので、Ajaxでなくても理論上は正常に動作すると思われる。(未検証)


## モデル

まずモデル。TopicモデルとTopicImageモデルの2つを1対多のリレーションを組んで構築する。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def images(self):
            #return TopicImage.objects.filter(topic=self.id).order_by("-dt")  #上から順に 654321
    
            return TopicImage.objects.filter(topic=self.id).order_by("dt")   #上から順に 123456
    
        def __str__(self):
            return self.comment
    
    
    class TopicImage(models.Model):
        
        dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
        topic       = models.ForeignKey(Topic,verbose_name="トピック",on_delete=models.CASCADE)
        image       = models.ImageField(verbose_name="画像",upload_to="bbs/topic_image/comment")
    
        def __str__(self):
            return self.topic.comment

Topicは自分に登録されている画像を取り出すため、imagesメソッドを作った。self.idから紐付いている画像を検索し、モデルオブジェクト(複数)を返却する。

TopicImageはアップロードされた画像の並び替えを意識するため、投稿日時を記録した。

## JavaScript

Ajaxではあるが、formタグからアップロードしたときと同様の挙動にするため、FormData形式でアップロードする。

    window.addEventListener("load" , function (){
    
        $(document).on("click", "#submit", function(){ submit(); });
    
        $(document).on("input", ".image_input", function(){ 
            $("#image_input_area").append('<input class="image_input" type="file" name="image">');    
        })
    
    });
    
    
    function submit(){
    
        let form_elem   = "#form_area";
    
        let data    = new FormData( $(form_elem).get(0) );
        let url     = $(form_elem).prop("action");
        let method  = $(form_elem).prop("method");
    
        for (let v of data ){ console.log(v); }
    
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


## HTML

inputタグに画像をセットしたら次のinputタグが作られるようになっている。

    {% load static %}
    
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="{% static 'js/script.js' %}"></script>
    
    
        <script src="{% static 'js/ajax.js' %}"></script>
    
    </head>
    <body>
    
        <main class="container">
            <form id="form_area" action="" method="POST" enctype="multipart/form-data">
                {% csrf_token %}
                <textarea id="textarea" class="form-control" name="comment"></textarea>
    
                <!--TODO:後はこの部分をJSで増やしたり減らしたりする。-->
                <div id="image_input_area">
                    <input class="image_input" type="file" name="image">
                </div>
    
                <input id="submit" type="button" value="送信">
            </form>
    
            <div id="content_area">{% include "bbs/content.html" %}</div>
    
        </main>
    </body>
    </html>


## ビュー


ビューは送信された同じname属性のデータを1つずつ取り出すことで、複数枚の画像を一度のリクエストで処理できるようになっている。

ビュークラスの継承元はDRFのビューでも素のDjangoのビューでもどちらでも正常に動く。


    from django.shortcuts import render
    
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .forms import TopicForm,TopicImageForm
    
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            data    = { "error":True }
            form    = TopicForm(request.POST)
    
            #ここでコメントを保存
            if not form.is_valid():
                print("Validation Error")
                return JsonResponse(data)
    
            topic   = form.save()
    
    
            #ここで複数指定した画像を追記。
            images  = request.FILES.getlist("image")
    
            for image in images:
    
                upload_image_file   = { "image":image }
                upload_image_name   = { "topic":topic.id,"image":str(image) }
    
                form    = TopicImageForm(upload_image_name,upload_image_file)
    
                if form.is_valid():
                    print("バリデーションOK")
                    form.save()
                else:
                    print("バリデーションNG")
                    print(form.errors)
    
            context             = {}
            context["topics"]   = Topic.objects.all()
    
            data["error"]       = False
            data["content"]     = render_to_string("bbs/content.html",context,request)
    
            return JsonResponse(data)
    
    index   = IndexView.as_view()


`.getlist()`を使うことで、同じname属性のデータのオブジェクトをリストにして取得できる。これを一つ一つループして取り出し、バリデーションして保存している。


## 動かすとこうなる。

こんなふうにちゃんと指定した順番通りで画像が記録されていく。

<div class="img-center"><img src="/images/Screenshot from 2022-03-21 18-16-06.png" alt=""></div>


## 結論

これで1つのデータに対しての画像の投稿が無制限になる。

ECサイトの商品モデルに対して1対多で商品画像モデルを作れば、商品画像を大量にセットして、詳細な説明ができるだろう。

## ソースコード

https://github.com/seiya0723/django_ajax_multi_img_upload

