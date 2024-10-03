---
title: "【Django】django-otpで多要素認証(二要素認証)を実現させる【GoogleAuthenticator】"
date: 2024-10-01T18:22:44+09:00
lastmod: 2024-10-01T18:22:44+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django" ]
---


Djangoは、デフォルトでもユーザー名とパスワードによるログインを用意している。

しかしユーザー名とパスワードが知られてしまえば、誰でも簡単にログインできてしまう。

そこで、ユーザー名やパスワードなどの「記憶情報」だけでなく、ワンタイムパスワードなどを使い「所持情報」による認証もする。

この「記憶情報」と「所持情報」の2つの要素による認証を、二要素認証という。(多要素認証ともいう)

https://ja.wikipedia.org/wiki/多要素認証

本記事では、多要素認証(二要素認証)を [django_otp](https://github.com/django-otp/django-otp/) を使って実現させる。

コードは、[【Django】デフォルトの認証機能を網羅し、カスタムユーザーモデルとメール認証、メール検証(確認)も実装する【脱allauth】](/post/django-auth-not-allauth-add-custom-user-model-mail-verify/) から流用している。

## django_otp の流れ


1. アカウントを登録する
1. ログインをする
1. TOTPデバイスを登録する(例:GoogleAuthenticatorなど)
1. TOTPデバイスに表示される6桁の番号を入力する
1. 認証完了


一般的な多要素認証と同じ流れである。

アカウントを作ってログイン。今回はメール検証もセットで行っている。

TOTP(Time based One Time Password)デバイスを登録する。スマホに事前にGoogleAuthenticatorなどのアプリをインストールしておく。

ブラウザ上にQRコードが表示されるので、それをスマホで読み取りする。

スマホのTOTP用のアプリ(GoogleAuthenticator)には、6桁の番号が表示される。

<div class="img-center"><img src="/images/IMG_6668.png" alt=""></div>

ログイン時に検証時に番号を入力して、多要素認証が実現できる。

## 導入

```
pip install django_otp
```

## settings.py 編集とマイグレーション

INSTALLED_APPS に以下の4つを加える。

```
INSTALLED_APPS = [ 

    # 省略 # 

    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
    'django_otp.plugins.otp_email',

    # 省略 # 
]
```

MIDDLEWARE に`'django_otp.middleware.OTPMiddleware',`を追加する。

```
MIDDLEWARE = [ 

    # 省略 #

    'django_otp.middleware.OTPMiddleware',
]
```


最後に、マイグレーションをする

```
python manage.py migrate 
```

## ビュー

```
from django.shortcuts import render,redirect
from django.views import View

from django.http import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin


import django_otp
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.qr import write_qrcode_image


class IndexView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):

        if request.user.is_verified():
            print("OTP 検証済み")
        else:
            print("OTP 未検証")
            return redirect("bbs:verify_otp")

        return render(request, "bbs/index.html")

index   = IndexView.as_view()


class OtpView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        return render(request, "bbs/otp.html")

    def post(self, request, *args, **kwargs):

        # デバイスを追加する。
        device = TOTPDevice.objects.create(user=request.user, name='default', confirmed=False)

        # write_qrcode_image を使うことで、QRコードを生成できる。
        response = HttpResponse(content_type='image/svg+xml')
        write_qrcode_image(device.config_url, response)

        return response

otp   = OtpView.as_view()

# トークンを検証する。
class VerifyOtpView(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):
        otp_device = TOTPDevice.objects.filter(user=request.user).first()
        
        if otp_device is None:
            print("otp デバイスなし")
            return redirect("bbs:otp")

        return render(request, "bbs/verify_otp.html")


    def post(self, request, *args, **kwargs):

        otp_device = TOTPDevice.objects.filter(user=request.user).first()
        
        if otp_device is None:
            # otpデバイスがないので、追加してもらう
            print("otp デバイスなし")
            return redirect("bbs:otp")

        # OTPのトークンを検証
        if otp_device.verify_token(request.POST.get('otp_token')):
            # 以後、request.user.is_verified() で判定できる。

            otp_device.confirmed = True
            otp_device.save()

            # OTPのログインをする
            django_otp.login(request, otp_device)


            # OTPが正しければ認証成功
            return redirect("bbs:index")  # 認証成功時のリダイレクト先


        # OTPが間違っていればエラーメッセージを表示
        print("otpが違います。")
        return redirect("bbs:verify_otp")

verify_otp = VerifyOtpView.as_view()
```

### OTP検証済みか否かは、`request.user.is_verified()` で判断できる。

通常、ログインをしているかどうかは、 `request.user.is_authenticated()` で判断ができる。だが、OTP検証済みであるかの判定は含まれていない。

そこで、`request.user.is_verified()` を使う。

OTP検証済みであれば、そのままページ表示。未検証であれば、検証用のページへリダイレクトさせる。

ちなみに、LoginRequiredMixinも、ログインをしているかどうかの判定しかしていないので、django_otp を実装した後は、LoginRequiredMixinもOTP検証をしたかのオーバーライドも必要だ。

### OtpView でデバイスを追加、QRコードを表示する

postメソッドで、TOTPDevice を追加している。

TOTPDevice は django_otp に含まれるモデルで、ユーザーモデルと1対多のリレーションを組んでいる。

https://github.com/django-otp/django-otp/blob/master/src/django_otp/plugins/otp_totp/models.py#L22

現状、無制限にTOTPDeviceをつくる仕様になっている。これでは、部外者が勝手にTOTPDeviceを作り、検証をすることもできる。

TOTPDevice追加時に制限を課したり、メールで通知をするなどのセキュリティ対策が必要だ。

### VerifyOtpView でOTPの検証をする

getメソッドでは6桁の番号を入力するフォームを表示する

postメソッドではその検証をする。

`.verify_token()` でOTPの検証ができる。検証後は、`django_otp.login()` でログインをする。

これで、`request.user.is_verified()` がTrueになる。

## テンプレート

### templates/bbs/otp.html

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>

    <form action="" method="post">
        {% csrf_token %}
        <input type="submit">
    </form>

</body>
</html>
```
postメソッドを送るだけである。これにより、postメソッド側はQRコードをレスポンスする。

### templates/bbs/verify_otp.html

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>
    <form action="" method="post">
        {% csrf_token %}
        <input type="text" name="otp_token">
        <input type="submit">
    </form>
</body>
</html>
```

検証をするフォームを表示している。

本来6桁しか入力できないようにしたいが、簡素に実装するため省いた。

## URL設定

```
from django.urls import path
from . import views

app_name    = "bbs"
urlpatterns = [
    path("", views.index, name="index"),
    path("otp/", views.otp, name="otp"),
    path("verify_otp/", views.verify_otp, name="verify_otp"),
]
```

各ビューをそのままURL登録しているだけである。

## 結論

これにより、多要素認証を実現することができた。

ただ、今回のコードはあくまでも実装をしただけであり、実運用までは想定していない。

現状のコードではまだ問題があるため、次の項で解説する。

## 現状の問題

すでにいくらか上がっているが、現状の問題をまとめる。

### 1人のユーザーにつき、追加できるTOTPデバイスを制限するべき

1人のユーザーにつき、無制限にTOTPデバイスの追加が可能である。

これはつまり、メールアドレスとパスワードがあれば、誰でもTOTPデバイスの登録をして、多要素認証を突破できてしまうことになる

### TOTPデバイス追加時にメール通知をするべき

今回、メール認証をしているため、TOTPデバイス追加時には、メールで知らせるべきである。

### LoginRequiredMixin で、OTP検証を含めるべき

LoginRequiredMixin はOTP検証をしていない。

単にLoginRequiredMixinを多重継承しただけでは、OTP検証をしてもしなくてもビューが実行されてしまう。

### OTP検証の部分は、accountsアプリに含めるべき

今回、見やすくするため、あえてアプリディレクトリの中にOTPのビューを含めたが、本来認証を扱っているaccountsアプリで管理するべきである。

## ソースコード

https://github.com/seiya0723/django-auth-mail-verify-otp



