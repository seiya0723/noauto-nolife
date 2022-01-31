---
title: "Django Rest Frameworkにて、APIを提供する"
date: 2022-01-28T15:12:00+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","restful","api" ]
---

Serializerクラスのオブジェクトを返却することで、簡単にAPIを提供することができる。

また、投稿されたデータのバリデーションもSerializerを使えば良いのでとても楽。Ajaxも処理してくれるので、HTMLのフォームを提供するフォームクラスが不要であれば、Serializerに変換しても問題はない。

## DRFのシリアライザを使用してAPIを作る

40分簡易掲示板にDELETE、PUTメソッドを追加し、読み書き編集削除の機能を1つのビューで再現させる。

### ビュー

    from rest_framework.views import APIView
    #from django.views import View
    
    #APIで使うレスポンスオブジェクトとステータスコード
    from rest_framework.response import Response
    from rest_framework import status
    
    
    from django.shortcuts import render
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .serializer import TopicSerializer


    #省略


    #上記IndexViewをAPI対応にしたApiIndexViewを作る。
    class ApiIndexView(APIView):
    
        def get(self, request, *args, **kwargs):
    
            #トピックの一覧を全て返却する。ただし、形式はJsonとステータスコードをセットで返却する。
            topics      = Topic.objects.all()
    
            #TopicSerializerを経由して、JSON形式に変換。モデルオブジェクト複数であればmany=Trueも指定する。
            serializer  = TopicSerializer(instance=topics, many=True)
    
            #ステータスコードは下記URLから選ぶ
            #https://www.django-rest-framework.org/api-guide/status-codes/
            
            #シリアライズされたデータ(JSON)とステータスコードを同時に返却する
            return Response(serializer.data, status.HTTP_200_OK)
    
    
        def post(self, request, *args, **kwargs):
            print("POST")
    
            serializer      = TopicSerializer(data=request.data)
    
            if serializer.is_valid():
                print("バリデーションOK")
                serializer.save()
                #JSONとステータスコードを同時に返却する
                return Response(serializer.data, status.HTTP_201_CREATED)
            else:
                print("バリデーションNG")
                #バリデーションNGなら、この時点でレスポンスを返却する
                return Response(request.data, status.HTTP_400_BAD_REQUEST)
    
        def delete(self, request, *args, **kwargs):
    
            topic   = Topic.objects.filter(id=kwargs["pk"]).first()
    
            if topic:
                print("削除")
                topic.delete()
                return Response(status.HTTP_204_NO_CONTENT)
            else:
                return Response(status.HTTP_404_NOT_FOUND)
    
    api_index   = ApiIndexView.as_view()
    
    
    
    """
    下記を実行してみる。DELETE以外はボディとステータスコードが返却される。
    curl -X GET "http://localhost:8000/api/index/" -w " %{http_code}\n"
    curl -X POST -d "comment=テスト" "http://localhost:8000/api/index/" -w " %{http_code}\n"
    curl -X DELETE "http://localhost:8000/api/index/1/" -w " %{http_code}\n"
    """

### config/urls.py


    from django.contrib import admin
    from django.urls import path,include
    
    from bbs import views as bbs_views
    
    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include("bbs.urls")),
    
        #CAUTION:DRFではURLの冒頭をapiにしなければAPIとして提供されない。出来ればこの指定はconfigのurls.pyに書くべき
        path('api/index/', bbs_views.api_index, name="api_index"),
        path('api/index/<pk>/', bbs_views.api_index, name="api_index"),
    
    ]


## Serializerと標準モジュールのjson、JsonResponseはどう違う？

Serializerはバリデーションができる。受け取ったデータの型が異なっていたとしても適切な型に変換した上でバリデーションOKを出す。

更に、Serializerはdata属性にjsonのデータが格納されている。それをそのままレスポンスとして返却することで、jsonのレスポンスが実現できる。Responseではステータスコードの指定もできるので、受け取りしたAPI側はこのステータスコードを元に処理を分岐できる。

## 認証はどうする？

DjangoRESTFramework単体では、Djangoがデフォルトで装備しているCookie認証(管理サイトにアクセスする際に使用している認証方式と同等)が限界である。

故に、認証時にはCSRFトークンもセットにして、認証のメソッドであるPOSTメソッドのリクエストを送信しなければならない。もし、トークンを使用した認証を行うのであれば、別途`djoser`というライブラリが必要になる。もしくは自前で作るしかない。

ちなみに、Cookie認証であれば、ビュークラスはLoginRequiredMixinを多重継承することで認証状態をチェックできる。ログイン完了後、以降のセッションをキープさせ、リクエストを送信し続ければ良い。

## ソースコード

https://github.com/seiya0723/startup_bbs_restful_api

## 参照元

- 現場で使えるDjangoRESTFrameworkの教科書
- https://github.com/encode/rest-framework-tutorial
- https://www.django-rest-framework.org/tutorial/quickstart/
- https://qiita.com/kimihiro_n/items/86e0a9e619720e57ecd8


