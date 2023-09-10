---
title: "【Django】Stripeでサブスクリプション決済を行う"
date: 2023-04-22T15:47:44+09:00
lastmod: 2023-04-22T15:47:44+09:00
draft: false
thumbnail: "images/screenshot_2023-04-24_15-02-05.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","Stripe","上級者向け" ]
---


1回限りの決済を行いたい場合は、下記。

[【Stripe】Djangoにクレジットカード決済機能を実装させる](/post/startup-django-stripe/)

対象読者は、カスタムユーザーモデルと認証機能(django-allauthも可)をすでに実装済みとする。

参照: [【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)

## Stripeにてサブスクリプション商品を作る

まず、Stripeにてサブスクリプション商品を作る。下記リンク、商品ページへアクセス。

https://dashboard.stripe.com/test/products?active=true

商品を追加ボタンを押す。

<div class="img-center"><img src="/images/Screenshot from 2023-04-24 14-18-53.png" alt=""></div>

商品情報に商品名と価格を指定

<div class="img-center"><img src="/images/Screenshot from 2023-04-24 14-29-05.png" alt=""></div>

商品を保存ボタンをクリックして保存。

<div class="img-center"><img src="/images/Screenshot from 2023-04-24 14-31-15.png" alt=""></div>

`API_ID`(上記画像の赤で伏せた部分)を控えておく。


## settings.py

先ほどの商品のAPIキーと、StripeのAPIキーを入れる。

```
STRIPE_API_KEY          = ""
STRIPE_PUBLISHABLE_KEY  = ""
STRIPE_PRICE_ID         = ""
```

`STRIPE_PRICE_ID`に先ほどの商品の`API_ID`を入れる。


## views.py

セッションの作成から、Stripeへの購入確認などの処理を書いていく。

```
from django.shortcuts import render, redirect
from django.views import View

from users.models import CustomUser

from django.contrib.auth.mixins import LoginRequiredMixin
from django.conf import settings

from django.urls import reverse_lazy

import stripe
stripe.api_key  = settings.STRIPE_API_KEY


class IndexView(LoginRequiredMixin,View):
    def get(self, request, *args, **kwargs):

        return render(request, "bbs/index.html")

index   = IndexView.as_view()

class CheckoutView(LoginRequiredMixin,View):
    def post(self, request, *args, **kwargs):

        # セッションを作る
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': settings.STRIPE_PRICE_ID,
                    'quantity': 1,
                },
            ],
            payment_method_types=['card'],
            mode='subscription',
            success_url=request.build_absolute_uri(reverse_lazy("bbs:success")) + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.build_absolute_uri(reverse_lazy("bbs:index")),
        )

        return redirect(checkout_session.url)

checkout    = CheckoutView.as_view()

class SuccessView(LoginRequiredMixin,View):
    def get(self, request, *args, **kwargs):

        # パラメータにセッションIDがあるかチェック
        if "session_id" not in request.GET:
            print("セッションIDがありません。")
            return redirect("bbs:index")

        # そのセッションIDは有効であるかチェック。
        try:
            checkout_session_id = request.GET['session_id']
            checkout_session    = stripe.checkout.Session.retrieve(checkout_session_id)
        except:
            print( "このセッションIDは無効です。")
            return redirect("bbs:index")

        # 有効であれば、セッションIDからカスタマーIDを取得。ユーザーモデルへカスタマーIDを記録する。
        user            = CustomUser.objects.filter(id=request.user.id).first()
        user.customer   = checkout_session["customer"]
        user.save()

        print("有料会員登録しました！")

        return redirect("bbs:index")

success     = SuccessView.as_view()


# サブスクリプションの操作関係
class PortalView(LoginRequiredMixin,View):
    def get(self, request, *args, **kwargs):

        if not request.user.customer:
            print( "有料会員登録されていません")
            return redirect("bbs:index")

        # ユーザーモデルに記録しているカスタマーIDを使って、ポータルサイトへリダイレクト
        portalSession   = stripe.billing_portal.Session.create(
            customer    = request.user.customer,
            return_url  = request.build_absolute_uri(reverse_lazy("bbs:index")),
            )

        return redirect(portalSession.url)

portal      = PortalView.as_view()
```

それぞれurls.pyに登録しておく。

- IndexView: CheckoutViewへPOSTするボタン、サブスク契約済みの場合はPortalViewへGETするリンクを配置
- CheckoutView: セッションを作り、Stripeの決済ページへリダイレクトする
- SuccessView: 決済を確認し、カスタマーIDをユーザーモデルに登録
- PortalView: セッションを作り、Stripeのポータルページへリダイレクトする。

ポータルページとは、契約済みのサブスクリプションを確認・解約するためのページのこと。


## urls.py


```
from django.urls import path
from . import views

app_name    = "bbs"
urlpatterns = [ 
    path("", views.index, name="index"),
    path("checkout/", views.checkout, name="checkout"),
    path("success/", views.success, name="success"),
    path("portal/", views.portal, name="portal"),

]
```

## templates/bbs/index.html

カスタマーIDの有無をチェックして、表示させるボタンを変更する。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>

{% if request.user.customer %}
<div>
    <a class="button" href="{% url 'bbs:portal' %}">有料会員登録設定をする</a>
</div>
{% else %}
<form action="{% url 'bbs:checkout' %}" method="post">
    {% csrf_token %}
    <input type="submit" value="有料会員登録する">
</form>
{% endif %}

</body>
</html>
```

## 動かすとこうなる。

有料会員登録のボタンをクリックすると、Djangoのビューでセッションが作られ、Stripeの決済ページへリダイレクト(下記画像)される。

<div class="img-center"><img src="/images/screenshot_2023-04-24_15-02-05.png" alt=""></div>

ここでクレジットカード番号を入力し、決済完了をすると、ユーザーモデルのcustomerにカスタマーIDが記録される。

カスタマーIDがある場合は、ポータルサイトへのアクセス(下記画像)ができるようになる。

<div class="img-center"><img src="/images/screenshot_2023-04-24_15-01-25.png" alt=""></div>

ここでサブスクリプションの解除が可能。

## 結論

サブスクリプション処理は、前もって商品を作っておく必要が有る。

処理内容も[1回限りの決済処理](/post/startup-django-stripe/)とは違う点に注意。

Djangoでセッションを作ってStripeへ誘導する点はいずれも同じ。


## ソースコード

カスタムユーザーモデルとDjango-allauthを使用している。

https://noauto-nolife.com/post/startup-django-stripe-subscription/


