---
title: "【Django】未認証ユーザーをログインページにリダイレクトする【LoginRequiredMixin】"
date: 2022-04-07T13:19:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","認証" ]
---


ログインしていないユーザーが特定のページにアクセスしてきた時、処理を実行せず、ログインページにリダイレクトするには、`LoginRequiredMixin`を使う。

## 前提

予め前もって、認証を実装しておく。allauthを使っても、Djangoの備え付けの認証を使っても良い。

- [【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)
- [【Django】allauth未使用でユーザー認証機能を実装した簡易掲示板【ログインとログアウトのみ】](/post/django-auth-not-allauth/)


## クラスベースのビューであればLoginRequiredMixinを多重継承する。


    from django.shortcuts import render
    from django.views import View
    
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    class IndexView(LoginRequiredMixin,View):
    
        def get(self, request, *args, **kwargs):
            return render(request,"bbs/index.html")
    
    index   = IndexView.as_view()

参照: https://docs.djangoproject.com/en/4.0/topics/auth/default/

## 関数ベースのビューの場合は、デコレータの@login_requiredを使う

関数ベースのビューの場合はデコレータの`@login_required`を使う。

    from django.shortcuts import render
    from django.views import View
    
    from django.contrib.auth.mixins import LoginRequiredMixin

    @login_required(login_url='/accounts/login/')    
    def index(request):
        return render(request,"bbs/index.html")


デコレータとは、ざっくり言ってしまえば関数に機能を追加することを意味する。

例えば、Djangoであればカスタムテンプレートタグがある。ただの関数ではテンプレートタグとして機能することはできないため、`@register.simple_tag()`をデコレータとしてセットする

[Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】](/post/django-paginator/)

