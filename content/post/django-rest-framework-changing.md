---
title: "【Restful化】DjangoRestframeworkの導入・移行作業【ビュークラス継承元の書き換え、Serializerの運用】"
date: 2022-02-27T15:05:00+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","restful","ajax" ]
---

Restful化のためには、DjangoRestframeworkをインストールする必要がある。([素のDjangoでもAjaxでDELETE,PUT,PATCHメソッドの送信は可能だが、リクエストボディの読み込みに難があるため。](/post/django-rest-framework-need-ajax/))

だが、素のDjangoで開発している状態であれば、コードの一部をDRF仕様に書き換えを行う必要がある。

本記事では、[40分Django](/post/startup-django/)を元にDRF移行手続きを解説する。

## views.pyにて、ビュークラス継承元を書き換える。

`as`を使うことで、書き換える箇所は2箇所だけで済む。


    from django.shortcuts import render,redirect
    
    #TODO:ここを書き換える
    #from django.views import View
    from rest_framework.views import APIView as View
    
    from .models import Topic
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


## forms.pyからserializer.pyへ

通常、バリデーションを行う時はforms.pyにて、バリデーション用のフォームクラスを作る。

しかし、DRFではserializer.pyにて、バリデーション用のシリアライザクラスを作る。

### シリアライザクラスとは？

簡単に言ってしまえば、フォームクラスの上位互換。

バリデーション機能の他に、

- 投稿時のデータ形式が違っていても解釈してくれる
- API提供時、モデルオブジェクトからJSONを整形してレスポンスとして返却できる

などがある。

(ただし、フォームクラスと違ってフォームのテンプレートを提供していない、saveメソッドのオーバーライド時などでフォームクラスとはやや挙動が異なるため、状況によっては完全な上位互換とは言えない。機能だけ見れば上位互換と言える状態。)

### serializer.pyにてシリアライザクラスを作り、views.pyはシリアライザクラスを使用してバリデーションする。

下記を`serializer.py`とする。

    from rest_framework import serializers
    
    from .models import Topic
    
    class TopicSerializer(serializers.ModelSerializer):
    
        class Meta:
            model   = Topic
            fields  = [ "comment" ]

`views.py`は`serializer.py`内の`TopicSerializer`を`import`する。

ちなみに、シリアライザクラスを使用したバリデーションは、Ajaxを使用していない普通のPOSTリクエストでも問題ない。

    from django.shortcuts import render,redirect
    
    #from django.views import View
    from rest_framework.views import APIView as View
    
    from .models import Topic
    from .serializer import TopicSerializer
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            """
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
            """
    
            #CAUTION:ここでキーワード引数としてdataを指定する必要がある。
            serializer  = TopicSerializer(data=request.POST)
    
            if serializer.is_valid():
                print("バリデーションOK")
                serializer.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


このように書き方はフォームクラスとほぼ同じ。注意するべきは、シリアライザクラスにリクエストボディを引数として当てる時、キーワード引数としてdataを指定する(※CAUTIONの部分)

他の挙動は[フォームクラスを使用したバリデーション](/post/django-forms-validate/)と同じ。

ちなみに、こんな書き方をしてもフォームのテンプレートは用意してくれない。テンプレートのフォームは自前で書く。

    class IndexView(View):
        def get(self, request, *args, **kwargs):
            context = {}
            context["serializer"]   = TopicSerializer()

            return render(request,"bbs/index.html",context)



## 結論

これで素のDjangoと違い、Restful化がスムーズに進む。それと同時にAPIの提供も出来る。

Ajaxを送信されたとしても、シリアライザはある程度のデータ形式には対応してくれる。(jsonなどもOK)


