---
title: "【Django】デフォルトの認証機能を網羅し、カスタムユーザーモデルとメール認証、メール検証(確認)も実装する【脱allauth】"
date: 2024-07-06T11:25:41+09:00
lastmod: 2024-07-06T11:25:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","カスタムユーザーモデル","認証" ]
---


[【Django】デフォルトの認証機能を網羅し、カスタムユーザーモデルとメール認証も実装させる【脱allauth】](/post/django-auth-not-allauth-add-custom-user-model/)


こちらの記事では、メールの検証(アカウント作成後、登録したメールアドレスへ、確認用のURLを送る工程)が行われていない。

allauthでは実装済みのため、デフォルトの認証で完全に補完するためにも実装した。



## 解説


### モデル

カスタムユーザーモデルへ、メール検証済みか否かを判定するブーリアンフィールドを追加しておく。


```
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.contrib.auth.validators import UnicodeUsernameValidator

from django.utils import timezone

from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail

import uuid


#ここ( https://github.com/django/django/blob/main/django/contrib/auth/models.py )から流用
class CustomUser(AbstractBaseUser, PermissionsMixin):

    username_validator  = UnicodeUsernameValidator()

    # 主キーはUUIDとする。
    id          = models.UUIDField( default=uuid.uuid4, primary_key=True, editable=False )
    username    = models.CharField(
                    _('username'),
                    max_length=150,
                    unique=True,
                    help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
                    validators=[username_validator],
                    error_messages={
                        'unique': _("A user with that username already exists."),
                    },
                )

    first_name  = models.CharField(_('first name'), max_length=150, blank=True)
    last_name   = models.CharField(_('last name'), max_length=150, blank=True)

    # メールアドレスは入力必須でユニークとする
    email       = models.EmailField(_('email address'), unique=True)

    is_staff    = models.BooleanField(
                    _('staff status'),
                    default=False,
                    help_text=_('Designates whether the user can log into this admin site.'),
                )

    is_active   = models.BooleanField(
                    _('active'),
                    default=True,
                    help_text=_(
                        'Designates whether this user should be treated as active. '
                        'Unselect this instead of deleting accounts.'
                    ),
                )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)



    email_verified = models.BooleanField(verbose_name="メール確認済み",default=False)



    objects     = UserManager()

    EMAIL_FIELD = 'email'

    # メールアドレスを使ってログインさせる。(管理ユーザーも)
    #USERNAME_FIELD = 'username'
    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        #abstract = True #←このabstractをコメントアウトする

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)

```


追加したフィールド。

```
email_verified = models.BooleanField(verbose_name="メール確認済み",default=False)
```




### ビュー




```
from django.shortcuts import render, redirect
from django.conf import settings
from django.urls import reverse_lazy
from django.http import HttpResponseNotAllowed, HttpResponse

from django.contrib.auth.views import LoginView,LogoutView,PasswordChangeView,PasswordChangeDoneView,PasswordResetView,PasswordResetDoneView,PasswordResetConfirmView,PasswordResetCompleteView
from django.views.generic import CreateView
from django.views import View

from django.core.mail import send_mail

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.mixins import LoginRequiredMixin

from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .forms import SignupForm


# DjangoのPasswordリセットトークンジェネレーターを流用し、メールアドレスの確認用トークンを作る。
class ActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.id}{timestamp}{user.is_active}"

activation_token = ActivationTokenGenerator()


class SignupView(CreateView):
    
    form_class      = SignupForm
    success_url     = reverse_lazy("login")
    template_name   = "registration/signup.html"

    # 認証済みの状態でリクエストした時、LOGIN_REDIRECT_URL へリダイレクトさせる
    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(settings.LOGIN_REDIRECT_URL)
        return super().dispatch(request, *args, **kwargs)


    # ここで、アカウント作成時に、メール確認を行う。
    def form_valid(self, form):
        user = form.save()

        uid             = urlsafe_base64_encode(force_bytes(user.id))
        token           = activation_token.make_token(user)

        subject         = "メールの確認をしましょう。"
        message         = f"http://{ self.request.get_host() }{ reverse_lazy('activate', kwargs={'uidb64':uid, 'token':token} ) }"

        # TODO:ここでDjango側のメールアドレスを指定しておく。
        from_email      = "huga@gmail.com"
        recipient_list  = [ user.email ]

        send_mail(subject, message, from_email, recipient_list)

        return HttpResponse("メールへ確認用のURLを送りました。")

signup  = SignupView.as_view()


# メールの確認用URLをチェックするビュークラス
class ActivateView(View):

    def get(self, request, *args, **kwargs):
        try:
            uid     = force_str(urlsafe_base64_decode(kwargs["uidb64"]))
            user    = get_user_model().objects.get(pk=uid)
        except:
            return HttpResponse("メールの確認用URLに問題があります。")

        if not activation_token.check_token(user, kwargs["token"]):
            return HttpResponse("メールの確認用URLに問題があります。")

        # メール確認完了(このフィールドを追加しておく。)
        user.email_verified = True
        user.save()

        return HttpResponse("メールの確認ありがとうございます。")

activate    = ActivateView.as_view()


# メールの確認用URLを再度生成するビュー(URLの含んだメールを紛失した時用)
class RegenerateTokenView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        
        uid             = urlsafe_base64_encode(force_bytes(request.user.id))
        token           = activation_token.make_token(request.user)

        subject         = "メールの確認をしましょう。"
        message         = f"http://{ self.request.get_host() }{ reverse_lazy('activate', kwargs={'uidb64':uid, 'token':token} ) }"

        # TODO:ここでDjango側のメールアドレスを指定しておく。
        from_email      = "huga@gmail.com"
        recipient_list  = [ request.user.email ]

        send_mail(subject, message, from_email, recipient_list)

        return HttpResponse("メールへ確認用のURLを送りました。")

regenerate_token    = RegenerateTokenView.as_view()


class CustomLoginView(LoginView):

    # 認証済みの状態でリクエストした時、LOGIN_REDIRECT_URL へリダイレクトさせる
    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(settings.LOGIN_REDIRECT_URL)
        return super().dispatch(request, *args, **kwargs)

login   = CustomLoginView.as_view()

# LogoutViewのGETメソッドを無効化する。(すでにDjango4.1で非推奨。5.0で削除される見通し)
# https://docs.djangoproject.com/ja/4.2/topics/auth/default/#django.contrib.auth.views.LogoutView
class CustomLogoutView(LogoutView):
    def get(self, request, *args, **kwargs):
        return HttpResponseNotAllowed(permitted_methods=['POST'])

logout  = CustomLogoutView.as_view()


password_change             = PasswordChangeView.as_view()
password_change_done        = PasswordChangeDoneView.as_view()
password_reset              = PasswordResetView.as_view()
password_reset_done         = PasswordResetDoneView.as_view()
password_reset_confirm      = PasswordResetConfirmView.as_view()
password_reset_complete     = PasswordResetCompleteView.as_view()
```


今回は、メール検証を済んでいない場合でもログインは許可した。

理由は、


- URLさえ分かってしまえば、未ログインユーザー(第三者)も検証できてしまうため
- django-allauthも同様に、メール検証が済んでいなくてもログインはできる仕様になっているため


この2点からである。

もし、ログインを許さない場合は、LoginViewの処理を書き換えるなど適宜編集をする。



### URL設定


```
from django.urls import path

from . import views

# ここでapp_nameを指定してしまうと、テンプレート、ビューのすべてのURL逆引きを修正する必要があるため、あえて指定しない
#app_name    = "accounts"
urlpatterns = [ 
    path("signup/", views.signup, name="signup"),

    # 書き方を統一させるため前もってas_view化しておく。(一部オーバーライドしている。)
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("password_change/", views.password_change, name="password_change"),
    path("password_change/done/", views.password_change_done, name="password_change_done"),
    path("password_reset/", views.password_reset, name="password_reset"),
    path("password_reset/done/", views.password_reset_done, name="password_reset_done"),
    path("reset/<uidb64>/<token>/", views.password_reset_confirm, name="password_reset_confirm"),
    path("reset/done/", views.password_reset_complete, name="password_reset_complete"),

    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('regenerate_token/', views.regenerate_token, name='regenerate_token'),
]
```


### admin.py

管理サイトから、メールの検証状態をチェックするため、編集をした。


```
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CustomUser

class CustomUserAdmin(UserAdmin):

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'email_verified')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    #管理サイトから追加するときのフォーム
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'email_verified')
    search_fields = ('username', 'first_name', 'last_name', 'email')

admin.site.register(CustomUser, CustomUserAdmin)
```

## 結論

今回は、実装を優先したため簡素にした。

以下は、実践では修正が必要と思われる。


- HttpResponse を返さず、テンプレートをレンダリングする
- トークン再発行のビューはgetメソッドではなくpostメソッドで対応する


とりわけ、トークンの再発行のビューは、実践ではメールアドレスを指定して、そのメールアドレスにトークンを送る形式になっているため、それに合わせる。


## ソースコード

https://github.com/seiya0723/django-auth-mail-verify


