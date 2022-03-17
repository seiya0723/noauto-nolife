---
title: "【Stripe】Djangoにクレジットカード決済機能を実装させる"
date: 2022-02-03T08:08:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","Stripe","スタートアップシリーズ","上級者向け" ]
---

DjangoでECサイトや課金ゲームサイト等を展開しようと考えているのであれば、避けて通ることができないのがカード決済。

Stripeというカード決済代行会社を利用することで、決済処理を手軽に実装させることができる。

本記事ではその一例を紹介する。

## 共通設定

まず、stripeライブラリをインストールする

    pip install stripe 


settings.pyにて下記をセットしておく。Stripeの秘密鍵は.gitignoreに指定したファイルに書くなど対策をしておく。

    from .local_settings import *
    """
    STRIPE_API_KEY          = "sadadadadadada"
    STRIPE_PUBLISHABLE_KEY  = "asdasdasdadsas"
    """

ハードコードするのであれば基本共有はしないようにする。

## 最新版のやり方

最新版はApplePayに対応しているなど、レガシー版に比べて決済方法が充実している。

### 流れ

1. Djangoが秘密鍵をセットし、Stripeの決済セッションを作る
1. Djangoは公開鍵とセッションIDをテンプレートにに引き渡してレンダリング
1. クライアントは決済ボタンを押して、カード情報を入力する
1. 成功時、指定したページにリダイレクトされる。(この時にDjangoのモデルにデータを格納する等をする。)

### ビュー


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    import stripe
    from django.conf import settings
    from django.urls import reverse_lazy

    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            context = {}
    
            #ここでStripeのセッションを作る、暗号化用の公開鍵とセッションIDを引き渡し、決済処理を顧客にさせる。
            # https://dashboard.stripe.com/account から企業名を入れていないとエラーが出る点に注意
            # 自分の名前をローマ字で入れておく。
    
            #セッションを開始するため、秘密鍵をセットする。
            stripe.api_key = settings.STRIPE_API_KEY
    
            session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    
                    #顧客が購入する商品(実践ではここにカートに入れた商品を格納)
                    line_items=[{
                        'price_data': {
                            'currency': 'jpy',
                            'product_data': {
                                'name': 'T-shirt',
                                },
                            'unit_amount': 2000,
                            },
                        'quantity': 1,
                        }],
                    
                    mode='payment',
    
                    #決済成功した後のリダイレクト先
                    success_url=request.build_absolute_uri(reverse_lazy("bbs:checkout")) + "?session_id={CHECKOUT_SESSION_ID}",

                    #決済キャンセルしたときのリダイレクト先
                    cancel_url=request.build_absolute_uri(reverse_lazy("bbs:index")),
                    )
    
            print(session)
    
            #この公開鍵を使ってテンプレート上のJavaScriptにセットする。顧客が入力する情報を暗号化させるための物
            context["public_key"]   = settings.STRIPE_PUBLISHABLE_KEY
    
            #このStripeのセッションIDをテンプレート上のJavaScriptにセットする。上記のビューで作ったセッションを顧客に渡して決済させるための物
            context["session_id"]   = session["id"]
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    
    
    class CheckoutView(View):
    
        def get(self, request, *args, **kwargs):

        stripe.api_key = settings.STRIPE_API_KEY

        #セッションIDがパラメータに存在するかチェック。なければエラー画面へ
        if "session_id" not in request.GET:
            return redirect("bbs:index")

        #ここでセッションの存在チェック(存在しないセッションIDを適当に入力した場合、ここでエラーが出る。)
        try:
            session     = stripe.checkout.Session.retrieve(request.GET["session_id"])
            print(session)
        except:
            return redirect("bbs:index")


        #ここで決済完了かどうかチェックできる。(何らかの方法でセッションIDを取得し、URLに直入力した場合、ここでエラーが出る。)
        try:
            customer    = stripe.Customer.retrieve(session.customer)
            print(customer)
        except:
            return redirect("bbs:index")


        #この時点で、セッションが存在しており、なおかつ決済している状態であることがわかる。
        #TODO:実践ではここで『カート内の商品を削除する』『顧客へ注文承りましたという趣旨のメールを送信する』『注文が入った旨を関係者にメールで報告する』等の処理を書く。


        print("決済完了")


        #TODO:出来ればこのページは注文完了のレンダリングを
        return redirect("bbs:index")

    checkout    = CheckoutView.as_view()


実践では成功した時、失敗したときのリダイレクト先は、直に書かず、`reverse_lazy`を使って逆引きをすれば良いだろう。

https://docs.djangoproject.com/en/4.0/ref/urlresolvers/


### テンプレート

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
            <button id="checkout-button" type="button">決済</button>
    
        </main>
    
    
    <!-- Stripeクラスを使うため、CDNをインストールしておく。 -->
    <script src="https://js.stripe.com/v3/"></script>
    <script>
    
        //ここにStripeの公開鍵をセットする。
        var stripe = Stripe( "{{ public_key }}" );
    
        //決済ボタン押したときのイベント(Stripeへ決済処理する)をセットする。
        var checkoutButton = document.getElementById('checkout-button');
    
        checkoutButton.addEventListener('click', function() {
            stripe.redirectToCheckout({
              sessionId: '{{ session_id }}'
            }).then(function (result) {
                //失敗したときの処理
            });
        });
    
        console.log("{{ session_id }}");
    
    </script>
    
    </body>
    </html>



### 動かすとこうなる

サーバーを起動し、決済ボタンを押す。すると、下記のStripeが提供しているカード入力画面が出てくる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-05 09-20-08.png" alt=""></div>

カード番号はテストとして用意されている`4242 4242 4242 4242`を入力する。カード所有者、メールアドレス、有効年月とCVCは適当で。

決済が完了したら、クライアントは、`success_url`で指定した場所にリダイレクトされる。サイト管理者はStripeアカウントから、支払いを確認できる。`payment_intent`が記録されている。

<div class="img-center"><img src="/images/Screenshot from 2022-02-05 09-16-23.png" alt=""></div>

StripeのセッションIDもイベントデータから個別に確認できる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-05 09-28-32.png" alt=""></div>

テストのカード番号に関しては下記を参照。

https://stripe.com/docs/testing

## レガシー版のやり方

### 流れ

1. 属性に公開鍵をセットしたStripeのJSが発動(ここでstripe側が公開鍵の有効性を確認している)
1. カード番号を入力してカードの有効確認。stripeTokenにセットされDjangoにPOST文が送られる
1. 下記のCheckoutViewのPOSTメソッドの処理が実行される。
1. 公開鍵に対応した秘密鍵とトークンをセット。(自サイトの公開鍵を使用して決済を試みている事をチェックする)
1. stripe.Charge.createが実行。決済処理が実行される。

### ビュー

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    import stripe
    from django.conf import settings
    
    stripe.api_key = settings.STRIPE_API_KEY
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            context = {}
    
            context["topics"]   = Topic.objects.all()
    

            #顧客がチェックアウトセッションを作るようにHTML側で仕立てる
            context['data_key'] = settings.STRIPE_PUBLISHABLE_KEY
            context['data_amount']      = 30000 
            context['data_name']        = "テスト決済"
            context['data_description'] = "ご注文を決済します"
            context['data_currency'] =  'JPY'
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    
    
    class CheckoutView(View):
    
        def post(self, request, *args, **kwargs):
            stripe.api_key = settings.STRIPE_API_KEY
            token = request.POST['stripeToken']
    
            #決済処理
            try:
                #トークンを元に決済を実行する
                charge = stripe.Charge.create(
                    amount= 30000,
                    currency='JPY',
                    source=token,
                    description='テスト決済完了',
                )
                context = { "charge":charge }
    
                print("決済完了")
    
            except stripe.error.CardError as e:
    
                #決済が失敗した場合の処理
                print("失敗しました。")
    
            return redirect("bbs:index")
    
    
    checkout    = CheckoutView.as_view()


### テンプレート

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
            <form action="{% url 'bbs:checkout' %}" method="POST">
                {% csrf_token %}
                <script
                    src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                    data-key="{{ data_key }}"
                    data-amount="{{ data_amount }}"
                    data-name="{{ data_name }}"
                    data-currency="{{ data_currency }}"
                    data-description="{{ data_description }}"
                    data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
                    data-locale="auto">
                </script>
                <button>決済</button>
            </form>
    
        </main>
    </body>
    </html>


## 参照元

- https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=checkout
- https://stripe.com/docs/payments/checkout/migration#api-products

