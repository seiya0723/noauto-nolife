---
title: "【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】"
date: 2020-11-10T14:01:19+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "Django","Ajax","Restful","上級者向け" ]
---


先日の記事にて、[DjangoでAjax(jQuery)を実装する方法](/post/django-ajax/)を解説した。

ただ、RestfulAPIを使用すれば、さらに少ないコードでAjaxを実装することができる。


## RestfulAPI、Django REST Frameworkとは

RestfulAPIとは、HTTPリクエストに応じてサーバーの処理を切り分けることができるAPIのこと。

HTTPリクエストのヘッダ部には、リクエスト送信先のURLとリクエストメソッドが含まれている。

例えば、掲示板サイトのコメント一覧ページにアクセスする時のリクエストはこうなる。

    GET /list/

一方で、コメントを投稿する場合はPOSTメソッドを使う。この時、リクエストの内部にはフォームに入力したコメントの内容が含まれている。

    POST /list/

特定のコメントを削除する場合はDELETEメソッド。削除対象のIDを指定する。

    DELETE /list/<id>/

特定のコメントを編集する場合はPUTメソッド、対象のIDと書き換える内容がリクエストに含まれている。

    PUT /list/<id>/

このように通常であれば、POST文のみで削除や編集などを行うところ、RestfulAPIでは、メソッドごとに処理を切り分け、処理を分割している。

## Restful(Django REST Framework)にするメリットとは？

Restful(Django REST Framework)にするメリットは大まかに下記。

- フロントとサーバーの分業化が容易
- コードの記述量が少なくなる
- SPA、Ajaxの実装が容易になる
- ログが見やすくなる

### フロントとサーバーの分業化が容易

例えば、編集も削除も送信も全てPOST文で実行する場合、いかにしてそれぞれの処理を切り分けましょうか？

フロントとサーバーで処理切り分け用の変数を用意する場合、フロントとサーバーで事前に情報共有する必要がある。その結果、フロントとサーバーで共有しなければならない情報が増え、開発が遅れる。


一方でRestfulの場合、事前にメソッドとURLを決めておくだけでOK。例えば、先の例だと下記のように定めて、フロント班とサーバー班で情報共有しておくだけでも開発の効率化が可能。

    GET     /
    GET     /list/
    POST    /list/
    DELETE  /list/<id>/
    PUT     /list/<id>/



### コードの記述量が少なくなる

Django REST Frameworkにはシリアライザがある。これはJSONオブジェクトの解析と同時に送信内容のバリデーションも行うことができる上、フォームを定義してtemplatesにレンダリングすることも可能。一言で言うのであれば、シリアライザはforms.pyの上位互換。

リクエストがJSON形式になるAjaxではJSONを解析しなければならない。Restfulなしだとこうなる。


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


これがRestfulありだとこうなる。シリアライザを使うことで、JSON解析('TopicSerializer()')とDB送信(`.save()`)が簡単にできる。前述のコードではできていないバリデーション(`.is_valid()`)もたったこれだけのコードで可能。

    def post(self, request, *args, **kwargs):

        serializer      = TopicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        data        = Topic.objects.all()
        context     = {"data":data}
        content_data_string     = render_to_string('bbs/comment.html', context ,request)
        json_data               = { "content" : content_data_string }

        return JsonResponse(json_data)

レンダリングをフロントに任せればさらにコード行数は短くなるだろう。

### SPA、Ajaxの実装が容易になる

JSONの解析をたった1行でやってくれるので、SPAの開発も相当楽になる。

### ログが見やすくなる

メソッドとURLがログに記録されることで、そのログは何を行ったのかが一目瞭然。例えば、送信や削除などを全てPOST文で行う場合、残るログは大体こうなる。

    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] GET /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] GET /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] POST /list/
    [XX/XX/2020 XX:XX:XX] GET /list/
    
何をしているのかはログを見ただけではわからない。バグ発生時の対処が遅れる可能性は高い。そしてログだけでは再現できないバグが発生した場合、その修正作業は尋常ではない時間を要する可能性がある。



## 実装の流れ

前置きが長くなったが、以下流れ。コードは[DjangoでAjax(jQuery)を実装する方法](/post/django-ajax/)より流用する。


1. djangorestframeworkをインストール
1. settings.pyのINSTALLED_APPSにrest_frameworkを追加
1. serializer.pyを記述
1. templates(comment.html)とJavaScript(onload.js)を修正
1. urls.pyの修正
1. views.pyの修正


※今回は`serializer.py`からフォームを生成していない点に注意。故にテキストエリアには`required`属性や`max_length`属性などが指定されていない


## djangorestframeworkをインストール

まずは下記コマンドを実行。djangorestframeworkをインストール

    pip install djangorestframework


## settings.pyのINSTALLED_APPSにrest_frameworkを追加

タイトル通り、`INSTALLED_APPS`に追加する。

    INSTALLED_APPS = [
        """省略"""
        "rest_framework",
    ]

## serializer.pyを記述

シリアライザを作る。モデルを継承して作るので、`forms.py`の書き方とほぼ同じ。

    from rest_framework import serializers
    
    from .models import Topic
    
    class TopicSerializer(serializers.ModelSerializer):
    
        class Meta:
            model = Topic
            fields  = ["comment"]
    

`serializers`を継承。使用するモデルのクラス名、フィールド名を指定する。


## templates(comment.html)とJavaScript(onload.js)を修正

続いてフロント側。送信と削除機能を実装する。

まず、`comment.html`

    {% for content in data %}
    <div id="{{ content.id }}" class="border" onclick="delete_comment('{{ content.id }}')">
        {{ content.comment }}
    </div>
    {% endfor %}

id属性とonclick属性を追加しただけ。

次、onload.jsの修正。

    $(function (){
        $("#submit").on("click", function(){ ajax_send(); });
    });
    
    function delete_comment(identifier){
    
        $.ajax({
            url         : identifier + "/",
            type        : "DELETE",
        }).done( function(data, status, xhr ) {
            $("#comment_area").html(data.content);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    
    }
    
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

新たに`delete_comment()`を追加する。実行するメソッドはDELETE。そして送信先のURLは`identifier/`。それ以外は`ajax_send`と同じ。

`identifier/`はurls.pyにて指定されていないため、次の項目で指定。

## urls.pyの修正

bbsの`urls.py`にURLを追加する。以下のように修正

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('<pk>/', views.delete, name="delete"),
    ]


views.deleteは存在しないので、次の項目で作る。

## views.pyの修正

削除用のクラス、及び既存のビューの処理を全てRestful対応化させる。

    from rest_framework import status,views,response
    from django.shortcuts import render,redirect,get_object_or_404
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .serializer import TopicSerializer
    
    import json 
    
    class BbsView(views.APIView):
        def get(self,request,*args,**kwargs):
    
            data        = Topic.objects.all()
            context     = {"data":data}
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            serializer      = TopicSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
    
            data        = Topic.objects.all()
            context     = {"data":data}
            content_data_string     = render_to_string('bbs/comment.html', context ,request)
            json_data               = { "content" : content_data_string }
    
            return JsonResponse(json_data)
    
    index   = BbsView.as_view()
    
    class BbsDeleteView(views.APIView):
    
        def delete(self, request, pk, *args, **kwargs):
    
            topic           = get_object_or_404(Topic,pk=pk)
            topic.delete()
    
            data        = Topic.objects.all()
            context     = {"data":data}
            content_data_string     = render_to_string('bbs/comment.html', context ,request)
            json_data               = { "content" : content_data_string }
    
            return JsonResponse(json_data)
    
    delete  = BbsDeleteView.as_view()

urls.pyにて指定した`pk`は`BbsDeleteView`の`delete`メソッドにて引き渡される。このpkはコメントのIDにあたり、これを元に削除処理を行う。

DB参照とレンダリングの処理はいずれも同一なので、オブジェクト化した後、呼び出そうか迷ったが、見やすくするために今回はやめておいた。


## 開発サーバーを起動して挙動を確かめる


こんなふうに表示されたらOK。送信ボタンを押したらAjax送信で即反映。投稿された内容をクリックしたら即削除。

<div class="img-center"><img src="/images/Screenshot from 2020-11-10 16-20-52.png" alt="RestfulAPIとAjaxで動く"></div>

そして、開発サーバーのログにはこのようにDELETEメソッドが使われていることがわかる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-10 16-20-57.png" alt="DELETEメソッドが記録された"></div>

これでログの追跡が容易になる。


## 結論

Django REST Frameworkにより、Ajaxで動くウェブアプリを容易に構築できる。

また、開発の規模が大きくなっても分業が可能。ログもとても綺麗で見やすい。

ちなみに、DELETEメソッドを送信したから対象が削除されるのではなく、ビューの処理によって削除される点に注意。つまりDELETEメソッドを指定しても、ビューの処理によっては普通にDBにデータを突っ込んだりできるということ(※途方もなくややこしいことになるから、メソッド通りの処理を書くことを推奨)


## 関連記事

Restful化した後、Ajaxで画像やファイル等のアップロードを行う場合は下記を参考にしたい。

[DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法](/post/drf-ajax-fileupload/)


多対多のリレーションを含む場合でも同様にRestful化が可能。ロングポーリングもセットで行えば、ほぼリアルタイムで業務上のデータを閲覧できる。

[Djangoで多対多のリレーションを含むデータをAjax(jQuery)+DRFで送信させる](/post/django-m2m-restful/)



## ソースコード

https://github.com/seiya0723/startup_bbs_restful

