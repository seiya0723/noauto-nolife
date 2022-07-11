---
title: "【Django】自前でLoginRequiredMixinのような物を作るには、dispatchメソッドを使う【多重継承】"
date: 2022-07-11T12:06:17+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---

[LoginRequiredMixin](/post/django-login-required-mixin/)のように、ビューが実行される前に何かの処理を実行したい場合。

dispatchメソッドに処理を書くと良いだろう。ただ、全てのビュークラスにdispatchメソッドを書いているようでは手間がかかる。

そこで、多重継承して利用できるように仕立てる。つまり、LoginRequiredMixinのような物を自前で作るのだ。

## ソースコード

下記のようにdispatchメソッドを含んだクラスを作って、多重継承させる。


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    class TestMixin:
        def dispatch(self, request, *args, **kwargs):
    
            print("#2:ここにMixinの処理")
    
            #HttpResponseを返却する。
            return super().dispatch(request, *args, **kwargs)
    
    
    class IndexView(TestMixin,View):
    
        def dispatch(self, request, *args, **kwargs):
    
            print("#1:IndexViewのdispatch")
    
            return super().dispatch(request, *args, **kwargs)
    
        def get(self, request, *args, **kwargs):
    
            print("#3:あああ")
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


dispatchメソッドはビューが実行される時に必ず実行される特殊なメソッド。getでもpostでも必ず実行される。

ただし、HttpResponseオブジェクトを返却しなければならない。

## LoginRequiredMixinのコード

今回のコードはDjangoのGitHubから参考に作った。

https://github.com/django/django/blob/main/django/contrib/auth/mixins.py#L67

    class LoginRequiredMixin(AccessMixin):
        """Verify that the current user is authenticated."""
    
        def dispatch(self, request, *args, **kwargs):
            if not request.user.is_authenticated:
                return self.handle_no_permission()
            return super().dispatch(request, *args, **kwargs)
    

## 実践


### django-allauthでメールの確認をしていない場合はメールの確認ページへリダイレクトさせる

[メールの確認](/post/django-allauth-why-not-verify-email/)をしていない場合、ビューの処理を行わず、メール確認のページにリダイレクトさせる。


    #前略#

    from allauth.account.admin import EmailAddress

    class EmailAddressConfirmMixin:
    
        def dispatch(self, request, *args, **kwargs):
    
            if not EmailAddress.objects.filter(user=request.user.id,verified=True).exists():
                print("メールの確認が済んでいません")

                return redirect("account_email")
    
            #HttpResponseを返却する。
            return super().dispatch(request, *args, **kwargs)
    
    class IndexView(EmailAddressConfirmMixin,View):

        #省略#



このEmailAddressConfirmMixinのif文でログインしていない場合。

`account_email`にリダイレクトされる。ただ、ログインしていない状態で`account_email`にアクセスすると、ログインページにリダイレクトされる。

そのため、これだけで実質LoginRequiredMixin以上の機能を有している。


### AccessMixinを継承して追記する(カスタムLoginRequiredMixin)

多重継承が増えると、見づらくなる。

そこでLoginRequiredMixinを継承して機能を追加する。

    from allauth.account.admin import EmailAddress
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    class EmailAddressConfirmMixin(LoginRequiredMixin):
    
        def dispatch(self, request, *args, **kwargs):
    
            print("LoginRequiredMixinより先に実行される。")
    
            if not EmailAddress.objects.filter(user=request.user.id,verified=True).exists():
                print("メールの確認が済んでいません")
                return redirect("account_email")
    
            #HttpResponseを返却する。
            return super().dispatch(request, *args, **kwargs)
    

ただ、この場合、継承するLoginRequiredMixinよりも先に実行されるため、ほとんど意味はない。

以下のコードが良いだろう。


    from django.contrib.auth.mixins import AccessMixin
    
    class EmailAddressConfirmMixin(AccessMixin):
    
        def dispatch(self, request, *args, **kwargs):
    
            if not request.user.is_authenticated:
                return self.handle_no_permission()
    
            if not EmailAddress.objects.filter(user=request.user.id,verified=True).exists():
                print("メールの確認が済んでいません")
                return redirect("account_email")
    
            #HttpResponseを返却する。
            return super().dispatch(request, *args, **kwargs)
    
    class IndexView(EmailAddressConfirmMixin,View):
    
        def get(self, request, *args, **kwargs):
    

LoginRequiredMixinと同様にAccessMixinを継承して作っている。


