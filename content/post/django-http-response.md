---
title: "Djangoで任意のHTTPレスポンス(ForbiddenやNotFoundなど)を返却する【HttpResponse subclasses】"
date: 2021-10-02T18:56:03+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

あまり需要が無いかも知れないが、状況によっては手動でHTTPResponseを指定して返却したい場合もあるだろう。

本記事ではよく使用すると思われるレスポンスをまとめる。

## HttpResponseBadRequest

    from django.http import HttpResponseBadRequest
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
            return HttpResponseBadRequest("bad")
    
    index   = BbsView.as_view()

リクエストの一部が欠落している場合など、クライアント側のエラーに表示させる。

## HttpResponseNotFound

    from django.http import HttpResponseNotFound
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
            return HttpResponseNotFound("not found")
    
    index   = BbsView.as_view()


引数内に入れた内容をクライアントのブラウザにHTMLとして表示させる

コンテンツの投稿者によって非公開にしたい場合、『このコンテンツは非公開になっています』と表現するより、他と同じ『NotFound』を返却すればそのページのURLが特定されてしまうことも無い。

## HttpResponseForbidden

    from django.http import HttpResponseForbidden
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
            return HttpResponseForbidden("forbidden")
    
    index   = BbsView.as_view()


CSRFトークンが欠落している場合に返却されるレスポンス。

ReCaptchaが間違っていたり、回答していなかった場合に返却するぐらいかと思われる。

## HttpResponseNotAllowed


    from django.http import HttpResponseNotAllowed
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
            return HttpResponseNotAllowed(["POST"])
    
    index   = BbsView.as_view()

他のレスポンスと違って、第一引数にリスト型で許可するメソッドを指定する必要がある。

クラスベースのビューを別の自作のビューから継承した時、使用しないメソッドを放置すると、継承元のメソッドのまま処理が実行されてしまうので、デフォルトのNotAllowedを返却するなどの使用方法がある。

## HttpResponseServerError

    from django.http import HttpResponseServerError
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
            return HttpResponseServerError("error")
    
    index   = BbsView.as_view()

例えば、一定時間に一定以上のアクセスを行ったクライアントに対してあえて`ServerError`を返却するなどがある。

## 結論

参照元:https://docs.djangoproject.com/en/3.2/ref/request-response/#httpresponse-objects


