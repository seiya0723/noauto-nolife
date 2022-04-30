---
title: "【Django】未認証ユーザーをログインページにリダイレクトする【LoginRequiredMixinもしくは@login_required】"
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


## 結論

これでLoginRequiredMixinが多重継承されたクラスベースのビュー、もしくは@login_requiredデコレータが搭載されたビュー関数が実行された時、認証状態をチェックして、未認証状態であればログインページへリダイレクトする。

### 【補足1】GETは未認証OKで、POSTメソッドは未認証NGにしたい場合はどうする？

閲覧はOKで、投稿は禁止というサイトを作りたい場合もあるだろう。動画投稿サイトやSNSなどがそうだ。

その場合、今回のビュー全体に対して認証状態の可否をチェックし、リダイレクトする方式は通用しない。そこで、各メソッドの冒頭で、認証状態をチェックする条件分岐を追加すると良いだろう。

    class IndexView(View):
    
        def get(self, request, *args, **kwargs):

            return render(request,"bbs/index.html")

        def post(self, request, *args, **kwargs):
            # TODO:ここで認証状態をチェックする。


            if request.user.is_authenticated:
                print("認証済み")
            else:
                print("未認証")


            return redirect("bbs:index")
    
    index   = IndexView.as_view()

requestオブジェクトのuser(ユーザーモデル)の中には、`.is_authenticated`属性がある。これは認証済みであればTrueを未認証であればFalseを返す。

