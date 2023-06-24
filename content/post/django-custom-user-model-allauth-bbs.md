---
title: "【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】"
date: 2022-07-30T08:46:59+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","allauth","上級者向け" ]
---

手元のディレクトリ内で雛形が分散していたので、自分用に作った。

コードは[40分Django簡易掲示板](/post/startup-django/)から。allauthはsettings.pyにID認証を、ユーザーモデルはDjangoのGitHubから何も書き加えていないモデルをそのまま流用した。

[以前はfirst_nameとlast_nameを1つのhandle_nameにした](/post/django-custom-user-model-uuid/)が、今回は元に戻した。

雛形をすぐにDLして書き換えができるようにGitHubに公開する。

## usersアプリを作成

    python3 manage.py startapp users



## users/models.py

ほぼ流用。handle_nameは元のfirst_nameとlast_nameに分割


    from django.db import models
    
    from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
    from django.contrib.auth.validators import UnicodeUsernameValidator
    
    from django.utils import timezone
    
    from django.utils.translation import gettext_lazy as _
    from django.core.mail import send_mail
    
    import uuid
    
    
    #ここ( https://github.com/django/django/blob/main/django/contrib/auth/models.py#L334 )から流用
    class CustomUser(AbstractBaseUser, PermissionsMixin):
    
        username_validator  = UnicodeUsernameValidator()
    
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
    
        email       = models.EmailField(_('email address'), blank=True)
    
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
    
        objects     = UserManager()
    
        EMAIL_FIELD = 'email'
        USERNAME_FIELD = 'username'
        REQUIRED_FIELDS = ['email']
    
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


## users/forms.py

    from django.contrib.auth.forms import UserCreationForm
    from .models import CustomUser
    
    class SignupForm(UserCreationForm):
        class Meta(UserCreationForm.Meta):
            model   = CustomUser
            fields  = ("username", )
    
会員登録時に入力するのはデフォルトのユーザーネームのみ。

デフォルトの状態で、会員登録時に使用するフォームクラス、[UserCreationForm](https://github.com/django/django/blob/main/django/contrib/auth/forms.py#L84)を継承して作る。


## users/admin.py

    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin
    from django.utils.translation import gettext_lazy as _
    
    from .models import CustomUser
    
    class CustomUserAdmin(UserAdmin):
    
        fieldsets = (
            (None, {'fields': ('username', 'password')}),
            (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
            (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
            (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        )
    
        #管理サイトから追加するときのフォーム
        add_fieldsets = (
            (None, {
                'classes': ('wide',),
                'fields': ('username', 'password1', 'password2'),
            }),
        )
    
    
        list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
        search_fields = ('username', 'first_name', 'last_name', 'email')
    
    admin.site.register(CustomUser, CustomUserAdmin)
    

[UserAdmin](https://github.com/django/django/blob/main/django/contrib/auth/admin.py#L44)を継承して作る

こちらもHandle_nameはfirst_nameとlast_nameに分割して、元に戻した。

## config/settings.py

最後に、settings.pyにてカスタムユーザーモデルを読み込みする設定を施す。

    INSTALLED_APPS = [ 
    
        #==中略==
    
        'users.apps.UsersConfig',
    ]
    AUTH_USER_MODEL = 'users.CustomUser'
    ACCOUNT_FORMS   = { "signup":"users.forms.SignupForm"}


`AUTH_USER_MODEL`は認証時に使用するユーザーモデル

`ACCOUNT_FORMS`はアカウント新規作成時のフォームを指定しておく。


## 結論

allauthもsettings.pyにID認証で書き込んでいるだけなので、後はLoginRequiredMixinをビュークラスの引数に追加したり、1対多や多対多のリレーションを組んで、書き込みにユーザー名を表記させたり、投稿に対するコメントを実装させれば良いでしょう。

もし、このコードにSendgridを使用したメール送信機能を実装させたい場合は下記記事を参照。

[【Django】allauthを使用し、カスタムユーザーモデルを搭載させ、SendgridのAPIでメール認証をする簡易掲示板【保存版】](/post/django-allauth-custom-user-model-sendgrid/)


## 全体のソースコード

https://github.com/seiya0723/startup_bbs_custom_usermodel_allauth



