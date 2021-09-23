---
title: "【Django】デプロイ後に管理サイトを管理者以外がアクセスできないようにする【UUID+MIDDLEWAREによるURL複雑化とIPアドレス制限】"
date: 2021-09-22T21:55:24+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","セキュリティ","システム管理" ]
---

Djangoの管理サイトのURLはデフォルトでは、`admin/`となっている。そのため、誰でも簡単に管理サイトにアクセスできる。しかもIDとパスワードのフォームしか表示されていないので、総当りすればいずれ突破されてしまう。

だからこそ、アクセス制限と推測されないURLというものが重要になってくる。本記事ではなるべくシステムに依存せず、Djangoのみで管理サイトの保護が完結する方法を記す。

## 方法論

以下の2つを両立させる。

- UUIDをadminのURLに割り当てる
- MIDDLEWAREでIPアドレスの制限を行う

UUIDが重複する可能性は限りなく低い。故に推測されないURLとして非常に有用。pythonのインタラクティブシェルからUUIDを生成してすぐに割り当てる。

DjangoのMIDDLEWAREはDjangoに送られたリクエストが全て通る仕組みになっている。それを利用して、クライアントのグローバルIPアドレスを許可されたものから参照し、含まれていれば通す、そうでないなら拒否すれば良い。

ただ、各所にUUIDとIPアドレスをハードコードしてしまうと、いざ書き換えが必要になった時に大変なので、`settings.py`にUUIDとIPアドレスをまとめ、`urls.py`と`MIDDLEWARE`はそれらを`import`して参照する。

## settings.py

settings.pyに下記を追加。

    ADMIN_PATH      = "b3b3bc25-360a-465f-83b9-0c81f8c0f9d2"
    ALLOWED_ADMIN   = [ "XXX.XXX.XXX.XXX" ]

自分のグローバルIPアドレスは確認くんなどで調べる。UUIDの生成に関しては[uuidgenコマンド](/post/uuid-generate/)か、Pythonの標準モジュールのuuidを使用する。

## config/urls.py

`config`内にある`urls.py`を書き換え。

    from django.contrib import admin
    from django.urls import path
    
    #↓追加
    from django.conf import settings
    
    urlpatterns = [
        path('', include("tube.urls")),
        path( settings.ADMIN_PATH + '/', admin.site.urls), #←修正
    ]
    
文字列型なので、+でくっつけるだけでOK

## MIDDLEWARE

adminのビューに書いても良いが、Djangoの中に埋め込まれているので、MIDDLEWAREに含ませる。

    from django.conf import settings
    from django.http import HttpResponseForbidden
    
    class AdminProtect:
        def __init__(self, get_response):
            self.get_response = get_response
    
        def __call__(self, request):
    
            url         = request.get_full_path()
            
            #DEBUGがFalseであり、管理サイトに対するアクセスである
            if settings.ADMIN_PATH in url and not settings.DEBUG:

                #送信元のIPアドレスを手に入れる
                ip_list = request.META.get('HTTP_X_FORWARDED_FOR')
                if ip_list:
                    ip  = ip_list.split(',')[0]
                else:
                    ip  = request.META.get('REMOTE_ADDR')

                #送信元IPが許可IPアドレスリストに含まれていない場合はForbiddenを返す。
                if ip not in settings.ALLOWED_ADMIN:
                    return HttpResponseForbidden()

            response    = self.get_response(request)
    
            return response


DEBUGモードである間は、この管理サイトのIP除外は適用しないほうが良いだろう。なぜならローカルで開発している時、ローカルサーバー(runserver)がIPアドレスを判定しようにもローカルのIPアドレスなので必ず拒否されてしまうからだ。

`settings.py`のMIDDLEWAREに上記クラスを追加して完了。

## 結論

もし、自分のグローバルIPアドレスが変わった時には、SSHでログインしてsettings.pyの許可IPを書き換えれば良い。

UUIDのURLに関しても、ブックマークをすれば良いだろう。ないとは思うが、自分以外のIPから管理サイトへアクセスした痕跡がログに残っていれば、UUIDを再生成して、どこから管理URLが漏れたか調べたほうが良い。

また、この方法であれば、管理する人が複数人であったとしても、IPアドレスを追加するだけで簡単に対処できる。ただし、ソーシャルエンジニアリングの可能性もあるので、他管理者からの許可IPの追加要求に関しては慎重になったほうが良い。

他にもこのMIDDLEWAREとUUIDを組み合わせたセキュリティを過信すること無く、管理サイトのIDとパスワードは予測されないものにする。セキュリティに完璧はありえないからだ。

