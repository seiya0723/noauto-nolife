---
title: "DjangoでUUIDを主キーとし、first_nameとlast_nameを1つにまとめたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】"
date: 2021-02-15T15:47:57+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","allauth","セキュリティ","認証" ]
---

Djangoでユーザーを作ったとき、デフォルトでは数値型オートインクリメントの主キーになる。

身内だけで使う小さなウェブアプリであれば大した問題にはならないと思うが、基本主キーが数値型かつオートインクリメントであれば、簡単に予測されてしまう。セキュリティリスクは最小限に留めるためにも、なるべく主キーはUUID型にしたい。

そこで、本記事ではユーザーの主キーにUUIDを使用したカスタムユーザーモデルの作り方を解説する。

なお、本記事ではDjangoのユーザーモデルのうち、first_nameとlast_nameを1つにまとめてhandle_nameとしている。もともとのDjangoのカスタムユーザーモデルを流用して作りたい場合は、

- [【Django】allauthを使用し、カスタムユーザーモデルを搭載させ、SendgridのAPIでメール認証をする簡易掲示板【保存版】](/post/django-allauth-custom-user-model-sendgrid/)
- [【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)

上記ふたつを参考にすると良いだろう。


## AbstractBaseUserを継承したユーザーモデルを作る

[前回](/post/django-allauth-custom-user-model/)では`AbstractUser`を継承したカスタムユーザーモデルを作ったが、今回はユーザーモデルを一から作ることができる`AbstractBaseUser`を継承したカスタムユーザーモデルを作る。

他にも、`first_name`と`last_name`を`handle_name`に統一化。`handle_name`と`email`の入力必須化を実現させる。まずは、カスタムユーザーモデル専用のアプリを作る。

    python3 manage.py startapp users

続いて、`settings.py`を編集する。下記のように編集。

    INSTALLED_APPS = [ 
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    
        'users.apps.UsersConfig',
    ]
    AUTH_USER_MODEL = 'users.CustomUser'
    ACCOUNT_FORMS   = { "signup":"users.forms.SignupForm"}

`django-allauth`も実装したい場合は、こうする。

    SITE_ID = 1 

    #django-allauthログイン時とログアウト時のリダイレクトURL
    LOGIN_REDIRECT_URL = '/' 
    ACCOUNT_LOGOUT_REDIRECT_URL = '/' 
    
    INSTALLED_APPS = [ 
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    
        'django.contrib.sites',
        'allauth',
        'allauth.account',
        'allauth.socialaccount',
    
        'users.apps.UsersConfig',

    ]
    AUTH_USER_MODEL = 'users.CustomUser'
    ACCOUNT_FORMS   = { "signup":"users.forms.SignupForm"}

これで`settings.py`の設定は完了。カスタムユーザーモデルを実装させる場合は、このように使用するモデルとフォームを`settings.py`に指定させるのだ。`INSTALLED_APPS`に追加するのは、作ったモデルをマイグレーションさせるため。

`users/models.py`を編集する。

    from django.db import models
    
    from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
    from django.contrib.auth.validators import UnicodeUsernameValidator
    
    from django.utils import timezone
    
    from django.utils.translation import gettext_lazy as _
    from django.core.mail import send_mail
    
    import uuid 
    
    
    #ここ( https://github.com/django/django/blob/master/django/contrib/auth/models.py#L321 )から流用
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
        
        #first_nameとlast_nameをひとまとめにした。
        handle_name = models.CharField(verbose_name="Handle_name", max_length=150)

        email       = models.EmailField(_('email address'))
    
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
    
        EMAIL_FIELD     = 'email'
        USERNAME_FIELD  = 'username'
        REQUIRED_FIELDS = ['email','handle_name']
    
        class Meta:
            verbose_name        = _('user')
            verbose_name_plural = _('users')
            #abstract            = True         #←ここをコメントアウトしないとカスタムユーザーモデルは反映されず、マイグレーションエラーを起こす。
    
        def clean(self):
            super().clean()
            self.email  = self.__class__.objects.normalize_email(self.email)
    
        def email_user(self, subject, message, from_email=None, **kwargs):
            send_mail(subject, message, from_email, [self.email], **kwargs)
    
        def get_full_name(self):
            return self.handle_name
    
        def get_short_name(self):
            return self.handle_name


定義されているフィールドを大まかにまとめるとこうなる。    

|フィールド名|フィールドのルール|
|----|----|
|`id`|UUIDフィールド、デフォルトuuid4、主キー、編集不可|
|`username`|文字列フィールド、最長150文字、重複禁止|
|`handle_name`|文字列フィールド、最長150文字|
|`email`|メールフィールド|
|`is_staff`|ブーリアンフィールド、デフォルトFalse|
|`is_active`|ブーリアンフィールド、デフォルトTrue|
|`date_joined`|日時フィールド、デフォルトtimezone.now|

`CustomUser`クラスには[PermissionsMixin](https://github.com/django/django/blob/master/django/contrib/auth/models.py#L232)クラスが継承されるので下記フィールドも追加される。

|フィールド名|フィールドのルール|
|----|----|
|`is_superuser`|ブーリアンフィールド、デフォルトFalse|
|`groups`|多対多フィールド、ブランク可|
|`user_permissions`|多対多フィールド、ブランク可|

`handle_name`と`email`は`blank=True`を削除し、入力必須とした。

`REQUIRED_FIELDS = ['email','handle_name']`は`python3 manage.py createsuperuser`等のコマンドでユーザーを作る時、インタラクティブシェルに`email`及び`handle_name`に入力させるためである。実際にシェルからユーザーを作ると、下記画像のようになる。

<div class="img-center"><img src="/images/Screenshot from 2021-02-20 10-27-32.png" alt="ハンドルネームの入力が要求された。"></div>

`REQUIRED_FIELDS`の指定をしていないとDBでは入力必須にもかかわらず、入力欄が無いので何度やってもユーザー生成にエラーが出てしまう。モデルの入力必須をするのであれば、`REQUIRED_FIELDS`に追加することも忘れずに。

続いて、`users/admin.py`の編集に入る。管理画面で編集表示させる項目を指定する。

    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin
    from django.utils.translation import gettext_lazy as _
    
    from .models import CustomUser
    
    class CustomUserAdmin(UserAdmin):
    
        fieldsets = (
            (None, {'fields': ('username', 'password')}),
            (_('Personal info'), {'fields': ('handle_name', 'email')}),
            (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
            (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        )
    
        #管理サイトから追加するときのフォーム
        add_fieldsets = (
            (None, {
                'classes': ('wide',),
                'fields': ('username', 'password1', 'password2',"handle_name","email"),
            }),
        )
    
    
        list_display = ('username', 'email', 'handle_name', 'is_staff')
        search_fields = ('username', 'handle_name', 'email')
    
    admin.site.register(CustomUser, CustomUserAdmin)


大部分は[前回のカスタムユーザーモデルの生成](/post/django-allauth-custom-user-model/)と同様。ただ、今回は入力必須の`email`と`handle_name`が加えられるので、`add_fieldsets`を定義している。これは管理ページからユーザーを作る時、入力必須である`email`と`handle_name`をフォームに表示させるためにある。また、デフォルトの`first_name`と`last_name`を削除しているので、デフォルトでそれらを参照している`list_display`、`search_fields`を書き換えている。

管理画面からユーザー生成を確認するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-02-20 10-50-00.png" alt="ハンドルネームとメールアドレス入力必須"></div>

ただ、これだと一般ユーザーがブラウザからアカウントを作る時のメールアドレスとハンドルネームの入力を必須にすることはできない。`settings.py`で指定しておいた、`ACCOUNT_FORMS   = { "signup":"users.forms.SignupForm"}`がまだ作られていないので、エラーも出る。そこで、`users/forms.py`を編集する。

    from django.contrib.auth.forms import UserCreationForm
    from .models import CustomUser
    
    class SignupForm(UserCreationForm):
        class Meta(UserCreationForm.Meta):
            model   = CustomUser
            fields  = ("username","email","handle_name")
    
これでOK。パスワードは継承元のUserCreationFormに含まれているので、`fields`に追加する必要はない。これで、`django-allauth`を使用したサインアップ画面でハンドルネームとメールアドレスの指定が必須となる。

<div class="img-center"><img src="/images/Screenshot from 2021-02-20 10-56-22.png" alt="ハンドルネームとメールアドレスの入力フォームが作られた"></div>

このようにサインアップ画面でハンドルネームとメールアドレスの入力必須になった。

## マイグレーション

カスタムユーザーモデルを実装するときは、マイグレーションファイルを作る順序にも注意が必要。まずカスタムユーザーモデルのアプリからマイグレーションファイルを作る。その後に他のアプリを指定してマイグレーションファイルを作る。その上でマイグレーション実行。

    python3 manage.py makemigrations users
    python3 manage.py makemigrations [他のアプリ]
    python3 manage.py migrate

こうすればエラーは起きない。

## 結論

`AbstractBaseUser`を継承したユーザーモデルの生成方法を解説した。本件は[Djangoの公式のコード](https://github.com/django/django)を引っ張ってきて一部を編集する必要があるので、Djangoを初めたばかりの人にはやや難しいだろう。

しかし、カスタムユーザーモデルを実装させることで、ユーザーに紐付いたデータ(所属や生年月日、会員ステータスなど)を新たに追加することができる。本格的にシステムを開発したり運営したりするには避けて通ることはできないだろう。最初にマイグレーションをしていなければDBを全部消して、一からマイグレーションファイルを作っていかないといけないので、難しくても最優先でやりたいところだ。

