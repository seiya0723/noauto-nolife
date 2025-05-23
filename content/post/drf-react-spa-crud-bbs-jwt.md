---
title: "DRF+ReactのCRUD簡易掲示板SPAでJWT認証を実装する"
date: 2025-01-14T08:56:12+09:00
lastmod: 2025-01-14T08:56:12+09:00
draft: false
thumbnail: "images/drf-react.jpg"
categories: [ "フルスタック" ]
tags: [ "drf","react","jwt" ]
---

[DRF+ReactのSPAでCRUD簡易掲示板をつくる](/post/drf-react-spa-crud-bbs/)

このDRF+ReactのCRUD簡易掲示板SPAに、JWT認証を実装する。

なぜなら、JWT認証を実装しない場合、通常のDjangoのセッションベースの認証を実装する場合では、CSRF検証が必要になるから。

## 開発要件

- JWT認証を実装する( CSRF検証の廃止 )
- ログイン、ログアウト、トークンの更新、アカウント新規作成の機能
- ユーザー名とパスワードを使用した認証
- Djangoのデフォルトのユーザーモデルを使用
- リフレッシュトークンも再生成する
- 古いトークンはブラックリストに登録する

## 前提知識

JWT認証の実装自体は難しくないが、前提として踏まえて起きたい知識があるのでまとめる。

### ステートフルとステートレスの違い

- ステートフルはセッションを維持する(前のリクエストと次のリクエストに関係がある)
- ステートレスはセッションは維持しない(前のリクエストと次のリクエストに関係は無い)

#### ステートフル

一般的な、ログイン認証が必要なサイト(ECサイトなど)をイメージする。

ユーザー名とパスワードを入力してログイン、サーバーはセッション情報の含んだCookieを返す。

以降、ユーザーはセッション情報の含んだCookieを使って、サイトを利用できる。この時、セッションが有効である限り、ユーザーは再度、ユーザー名やパスワードを入力する必要はない。

つまり、サーバーはユーザーのセッション情報を管理する必要がある。これがステートフル。

<div class="img-center"><img src="/images/Screenshot from 2025-01-14 09-09-03.png" alt=""></div>

HTTPプロトコル自体は、ステートレスなものである。

しかし、セッション情報の管理が必要になると、複数のリクエストに関連性が生まれ、ステートフルになる。

ステートフルの場合、問題が起こった場合、複数のログからリクエストの関連を調べるところから始める必要がある。これが運用・保守を難しくしている。

そこで、ステートレスな認証が必要。ステートレスな認証ができれば、問題が起こったときのログの確認がとても容易。

エンドポイントとリクエストメソッドから、どのような処理が行われたか想像できる。

#### ステートレス

ステートレスでは、複数のリクエストごとに関連性は無い。故に、運用・保守がしやすい。

他にも、次のようなメリットがある

- セッションの維持がないためどのサーバーでも処理できる(スケーラビリティの向上)
- リクエストに対して、ほとんど同じレスポンスになるためキャッシュ効率が高い
- 開発効率の向上
- フロントサイドを選ばない(通常のHTMLの他に、ネイティブアプリ、スマホアプリなどでも対応可能)
- 低コスト化

などなど。

しかし、ここで問題になってくるのが認証。セッションを維持しないため、従来のCookieとセッション情報を使った認証方式では、ステートフルになってしまう。

参照: [https://ja.wikipedia.org/wiki/ステートレス・プロトコル](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%86%E3%83%BC%E3%83%88%E3%83%AC%E3%82%B9%E3%83%BB%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB)

そこで登場するのが、トークンベースの認証方式である。

### トークンベースの認証とセッションベースの認証の違い

セッションベースの認証の場合、セッション情報をCookieに仕込む必要がある。サーバー側でセッション情報を保管しておく必要もある。

これではステートフルになってしまう。

トークンベースの認証の場合。認証情報や有効期限などがトークンに含まれる。サーバーはトークンが改ざんされていないか、正当なものであるかをチェックするだけ。

つまり、トークンの管理はクライアントに任せ、サーバーはその検証をするだけ。これによりステートレスな認証が実現できる。

このトークンベースの認証で使われるのが、JWT (JSON Web Token)である。

参照: https://zenn.dev/tanaka_takeru/articles/3fe82159a045f7

### JWT 

JSON Web Token、JWTとは、認証情報や権限を含んだ文字列(トークン)のこと。JSON形式で送受信される。

参照: https://ja.wikipedia.org/wiki/JSON_Web_Token

クライアント側が、ログイン用のユーザー名とパスワードを入力

サーバーがその検証をする。検証の結果、問題なければトークンを生成、これがJWTである。

レスポンスとして返却し、クライアント側は、ブラウザのlocalStorageにトークンを保存する。

以降、クライアント側は、localStorageに保存したトークンを使って、認証済みであることを証明する。

ちなみにJWTの中身は

```
{
  "token_type": "access",
  "exp": 1719885656,
  "iat": 1719882656,
  "jti": "bc790eb46a9241b7806d7f19d71b2b56",
  "user_id": 1
}
```

このようになっている。上から順に

- "token_type": トークンのタイプ
- "exp": トークンの有効期限(UNIXタイムスタンプ)
- "iat": トークンの発行日時(UNIXタイムスタンプ)
- "jti": トークンのID(リプレイ攻撃対策用)
- "user_id": ユーザーID



### JWTのアクセストークンとリフレッシュトークン

JWTは、アクセストークンとリフレッシュトークンの2つで作られている。

アクセストークンは認証状態を確認するためのトークン。リフレッシュトークンは、アクセストークンを再発行するためのトークンである。

それぞれのトークンには有効期限が割り当てられている。一般的にアクセストークンは有効期限が数分と短め、リフレッシュトークンは数十分〜数日程度が設定されている。

#### JWTの問題

JWTは、改ざんを検知できる仕組みがあるが、漏洩に対してはセッションIDと同様無力である。

そのため、アクセストークンの有効期限を短くする、ブラックリストを用意するなど対策が必要。

ただしブラックリスト機能を用意すると、JWTのステートレスな利点が損なわれる。

今回は機能の一部として、ブラックリストを使った。

## ライブラリのインストール

まずはライブラリをインストールする。

### Django側 ライブラリ

```
pip install django djangorestframework 
pip install django-cors-headers
pip install djangorestframework-simplejwt
```

これまで通り、djangorestframework と django-cors-headersをインストールしている

`djangorestframework-simplejwt`はDjango側でJWT認証をするためのライブラリである。

settings.pyで設定をする。requirements.txtは以下。

```
asgiref==3.8.1
Django==5.1.4
django-cors-headers==4.6.0
djangorestframework==3.15.2
djangorestframework_simplejwt==5.4.0
PyJWT==2.10.1
sqlparse==0.5.3
typing_extensions==4.12.2
```


### React側 ライブラリ

```
npm install @fortawesome/fontawesome-free
npm install bootstrap
npm install axios 
npm install react-router-dom
npm install jwt-decode
```

jwt-decode は アクセストークンをデコードして、ユーザー情報やトークンの有効期限などの情報を手に入れることができる。

以下は package.json

```
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fortawesome/fontawesome-free": "^6.7.2",
    "axios": "^1.7.9",
    "bootstrap": "^5.3.3",
    "jwt-decode": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "vite": "^6.0.5"
  }
}
```

## Djangoのソースコード

### config/settings.py


```
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-$@5l03*vzlmr3-vfkygfkxwqevb+umx@trwp762_%v(e$plfxq'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [

    "bbs.apps.BbsConfig",
    'corsheaders',
    'rest_framework',

    "rest_framework_simplejwt.token_blacklist",

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'corsheaders.middleware.CorsMiddleware',
]

REST_FRAMEWORK = {
    # 全てのエンドポイントで認証を必須とする。
    # (ビュークラスで、`permission_classes  = [IsAuthenticated]` が無い場合でも認証必須)
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # 認証の際には、JWTを使用する。
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}
from datetime import timedelta
# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html
SIMPLE_JWT = {
    # アクセストークンの有効期限
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=2),

    # リフレッシュトークンの有効期限(このリフレッシュトークンを使ってアクセストークンを生成できる)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # リフレッシュトークンが使われる時、新しいリフレッシュトークンを生成する
    'ROTATE_REFRESH_TOKENS': True,

    ## 古いトークンは無効化 (注意: 古いトークンを無効にしないと、第三者が古いトークンを拾ってログインし続けることができる) 
    'BLACKLIST_AFTER_ROTATION': True,
}




CORS_ORIGIN_WHITELIST = [
     'http://localhost:3000'
]
# JWT認証で削除 (デプロイ時、管理サイトのみで必要になる)
# https://noauto-nolife.com/post/django-csrf-trusted-origins/
#CSRF_TRUSTED_ORIGINS = [ 
#     'http://localhost:3000'
#]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```


#### INSTALLED_APPS 

```
INSTALLED_APPS = [

    "bbs.apps.BbsConfig",
    'corsheaders',
    'rest_framework',

    "rest_framework_simplejwt.token_blacklist",

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
```

INSTALLED_APPS には、 `"rest_framework_simplejwt.token_blacklist"` を追加しておく。

これが古いリフレッシュトークンを登録し、使えなくするブラックリストである。

ブラックリストの登録にDBを使うので、追加した後はマイグレーションをしておく。


#### REST_FRAMEWORK

DRFの認証設定を指定する。

```
REST_FRAMEWORK = {
    # 全てのエンドポイントで認証を必須とする。
    # (ビュークラスで、`permission_classes  = [IsAuthenticated]` が無い場合でも認証必須)
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # 認証の際には、JWTを使用する。
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}
```

今回、全てのエンドポイントで認証を必須とした。そして、認証の際にJWTを使用する。

```
'DEFAULT_AUTHENTICATION_CLASSES': [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
]
```

この設定がされていない場合、CSRF検証は有効になる。



#### SIMPLE_JWT

```
from datetime import timedelta
# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html
SIMPLE_JWT = {
    # アクセストークンの有効期限
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=2),

    # リフレッシュトークンの有効期限(このリフレッシュトークンを使ってアクセストークンを生成できる)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # リフレッシュトークンが使われる時、新しいリフレッシュトークンを生成する
    'ROTATE_REFRESH_TOKENS': True,

    ## 古いトークンは無効化 (注意: 古いトークンを無効にしないと、第三者が古いトークンを拾ってログインし続けることができる)
    'BLACKLIST_AFTER_ROTATION': True,
}
```

JWTの設定。トークンの有効期限、リフレッシュトークンを再生成するか、古いトークンは無効化するかの設定を追加する。



### bbs/models.py 

```
from django.db import models
from django.utils import timezone

class Category(models.Model):
    name        = models.CharField(verbose_name="カテゴリ名",max_length=100)


class Topic(models.Model):
    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)

    created_at  = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)
    

class Reply(models.Model):
    topic       = models.ForeignKey(Topic,verbose_name="カテゴリ",on_delete=models.CASCADE)

    created_at  = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)
```

特筆すべきことがない、普通のモデル。


### bbs/serializers.py 


```
# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-serializers/== #

from rest_framework import serializers
from .models import Category,Topic,Reply

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model	= Category
        fields	= ("id", "name")

class TopicSerializer(serializers.ModelSerializer):

    created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H時%M分%S秒",required=False)

    class Meta:
        model	= Topic
        fields	= ("id", "category", "created_at", "comment")


class ReplySerializer(serializers.ModelSerializer):

    created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H時%M分%S秒",required=False)

    class Meta:
        model	= Reply
        fields	= ("id", "topic", "created_at", "comment")


#=======アカウント新規作成===============================

# Userモデルを元にしたSerializer
from django.contrib.auth import get_user_model
User    = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password            = serializers.CharField(write_only=True, min_length=8, required=True)
    password_confirm    = serializers.CharField(write_only=True, min_length=8, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm"]

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password": "パスワードが一致していません"})
        return data

    def create(self, validated_data):
        # 確認用パスワードを除去
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user
```

DateTimeFieldは入力必須とはしない。投稿時に自動的に日時を入れてもらう。

今回、アカウント作成用のシリアライザを用意した。

get_user_model を使って現在使用しているユーザーモデル(仮にカスタムユーザーモデルに切り替わったとしてもこのコードは変更不要。)を元に、シリアライザを作る。


### bbs/views.py 

```
from django.shortcuts import render

# Create your views here.
# == This code was created by https://noauto-nolife.com/post/django-auto-create-views/ == #

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category,Topic,Reply
from .serializers import CategorySerializer,TopicSerializer,ReplySerializer

class CategoryView(viewsets.ModelViewSet):
    #permission_classes  = [IsAuthenticated]
    serializer_class    = CategorySerializer
    queryset            = Category.objects.all()


class TopicView(viewsets.ModelViewSet):
    #permission_classes  = [IsAuthenticated]
    serializer_class    = TopicSerializer
    queryset            = Topic.objects.all()


class ReplyView(viewsets.ModelViewSet):
    #permission_classes  = [IsAuthenticated]
    serializer_class    = ReplySerializer
    queryset            = Reply.objects.all()

    def get_queryset(self):
        topic_id    = self.request.query_params.get('id')

        try:
            if topic_id:
                return Reply.objects.filter(topic=topic_id)
        except Exception as e:
            print(e)

        # idの指定なしの場合はNoneを返す
        return Reply.objects.none()



# =====アカウント新規作成=========================

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer

class UserRegistrationView(APIView):
    # アカウント新規作成は認証不要
    permission_classes = [ AllowAny ]

    def post(self, request):

        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "会員登録完了"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =====ログアウト処理(トークンのブラックリスト登録)===================

from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    def post(self, request):

        print(request)
        try:
            refresh_token   = request.data["refresh"]

            print(refresh_token)
            token           = RefreshToken(refresh_token)
            token.blacklist()
            
            # XXX:  ↑こんなメソッドは存在しない
            # 解決策: rest_framework_simplejwt.token_blacklist を INSTALLED_APPS に追加して、マイグレーション。
            # https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/tokens.py#L241

            # TIPS: このブラックリスト機能を実装するとリフレッシュトークンはステートフルになってしまう。
            return Response({"message": "ログアウト成功しました"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

```

通常のAPIエンドポイントのビューに加え、アカウント新規作成処理とログアウトの処理を用意した。

アカウント新規作成は、未認証ユーザーでもアクセスできるようにする。ほぼフォームクラスと同じようにシリアライザでバリデーションしてアカウントをDBに追加している。

ログアウト処理はリフレッシュトークンをブラックリストに登録している。アクセストークンはブラックリストに入れる仕組みは存在しない。

また、INSTALLED_APPS に blacklist が追加されていない場合、 .blacklist() は 無効になるため注意する。

### config/urls.py 

```
from django.contrib import admin
from django.urls import path,include


from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView,TokenVerifyView

from bbs import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topic")
router.register(r"categories", views.CategoryView, "category")
router.register(r"replies", views.ReplyView, "reply")

urlpatterns = [

    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    path("api/register/", views.UserRegistrationView.as_view(), name="user_registration"),
    path("api/logout/", views.LogoutView.as_view(), name="logout"),
]


# JWT認証により、CSRFトークンのレスポンスは廃止。
#from django.http import JsonResponse
#from django.middleware.csrf import get_token
#
#def csrf_token(request):
#    return JsonResponse({"csrfToken": get_token(request)})
#
#urlpatterns.append( path("api/csrf-token/", csrf_token, name="csrf_token") )
```

CSRFトークンのレスポンスは廃止した。

トークンの取得、再生成、検証のビューをそれぞれ用意。

更に、先のビューの会員登録と、ログアウトも用意した。


## Reactのソースコード

今回、Stateに認証情報をセットし、全てのコンポーネントで参照できるよう、Contextを使った。

[【React】Contextとカスタムフックでログイン・ログアウト、認証状態を扱う](/post/react-usecontext-custom-hook/)

上記記事で解説されているため、Contextの説明は省略する。

### src/AuthContext.jsx

```
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import axios from "axios";

import { jwtDecode } from "jwt-decode";

// Contextを宣言(この時点ではnull)
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

    const [authState, setAuthState] = useState({ user_id : null });
    const refreshTimeRef = useRef(null);

    useEffect(() => {
        // 今回アクセストークンの有効期限は2分なので、最初は検証ではなく、リフレッシュトークンでアクセストークン再生成から始める。
        //verifyToken();
        // そもそも最初からリフレッシュをすれば検証機能さえ必要ないのでは？ ← 要考察

        // FIXME: 更新ボタンの連打をすると、新しいリフレッシュトークンがlocalStorageにセットされる前に、更新され、自動的にログアウトされてしまう。
        refreshAccessToken();
    }, []);

    const verifyToken = async () => {
        const token = localStorage.getItem('access_token');

        // トークンが存在しない場合はアーリーリターン
        if (!token){
            localStorage.removeItem("access_token");
            refreshAccessToken();
            return false;
        }

        try {
            const response = await axios.post("/api/token/verify/", { token } );

        } catch (error) {
            console.log("verify エラー！！このアクセストークンはすでに無効になっている");
            // console.error(error);

            console.log(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }

            // トークンが有効期限切れ
            localStorage.removeItem("access_token");
        }
        // トークンをリフレッシュさせるループ
        refreshAccessToken();
    }




    // トークンの有効期限切れをどうやって判断するか？
    // ↑デコードして時限式にする setTimeoutで再実行させる
    const refreshAccessToken = async () => {
        const refresh = localStorage.getItem('refresh_token');

        if (!refresh){
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            return false;
        }

        try {
            const response = await axios.post("/api/token/refresh/", { refresh } );
            console.log(response.data);

            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            // ここでJWTをデコード。setTimeoutをつかって、refreshAccessToken を再実行させる。
            // JWTをデコードして有効期限を取得
            const decodedToken      = jwtDecode(response.data.access);
            const expirationTime    = decodedToken.exp * 1000;
            const currentTime       = Date.now();

            // 有効期限の 1分前 にリフレッシュを予約
            const refreshTime       = expirationTime - currentTime - 60 * 1000;

            console.log(`次回リフレッシュまでの時間: ${refreshTime / 1000}秒`);
            console.log(String(decodedToken.user_id));


            // 認証状態をセットする。
            setAuthState( (prevAuthState) => {
                const updatedAuthState = { ...prevAuthState };
                updatedAuthState.user_id = String(decodedToken.user_id) ;
                return updatedAuthState;
            });

            // 有効期限が切れる前に、次のトークンを生成する。
            if (refreshTime > 0) {
                refreshTimeRef.current = setTimeout(refreshAccessToken, refreshTime);
            }

        } catch (error) {
            console.error(error);

            // トークンが有効期限切れ
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
    }


    const login = async ({username, password}) => {
        try {
            const response = await axios.post("/api/token/", { username, password } );
            console.log(response.data);

            // ログイン成功したため、アクセストークンをセット
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            // トークンをリフレッシュさせるループ
            refreshAccessToken();
        } catch (error) {
            console.error(error);

            // トークンが有効期限切れ
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
    }

    const logout = async () => {
        try {
            const response = await axios.post("/api/logout/",
                { refresh: localStorage.getItem("refresh_token") },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }}
            );
            console.log(response.data);

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        } catch (error) {
            console.error(error);
        }

        console.log("ログアウト");
        setAuthState({ user_id : null });

        // リフレッシュトークンによる再生成を停止。
        if (refreshTimeRef.current) {
            clearTimeout( refreshTimeRef.current );
        }
    }

    const accountCreate = async ({ username, email, password, password_confirm }) => {
        try {
            const response = await axios.post("/api/register/", { username, email, password, password_confirm } );
            console.log(response.data);

            // アカウント作成後、ログインをする。
            login({username, password});
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout, accountCreate }}>
        {children}
        </AuthContext.Provider>
    );

};

export const LoginForm = () => {
    const { login } = useAuth();
    const [form ,setForm] = useState({});

    const handleForm = (e) => {
        setForm( (prevForm) => {
            const updatedForm = { ...prevForm };
            updatedForm[e.target.name] = e.target.value;
            return updatedForm;
        });
    }

    const handleSubmit = async () => {
        await login(form);
        console.log(form);
    }

    return (
        <>
            <h2 className="text-center my-4">ログイン</h2>
            <form action="" className="text-center">
                <input type="text"     className="form-control d-inline-block w-auto" name="username" value={form.username || ""} onChange={handleForm} placeholder="ユーザー名"/> <br />
                <input type="password" className="form-control d-inline-block w-auto" name="password" value={form.password || ""} onChange={handleForm} placeholder="パスワード"/> <br />
                <input type="button"   className="btn btn-outline-success" value="ログイン" onClick={handleSubmit} />
            </form>
        </>
    )
};


export const AccountCreateForm = () => {
    const { accountCreate } = useAuth();
    const [form ,setForm] = useState({});

    const handleForm = (e) => {
        setForm( (prevForm) => {
            const updatedForm = { ...prevForm };
            updatedForm[e.target.name] = e.target.value;
            return updatedForm;
        });
    }

    const handleSubmit = async () => {
        await accountCreate(form);
        console.log(form);
    }

    return (
        <>
            <h2 className="text-center my-4">アカウント新規作成</h2>
            <form action="" className="text-center">
                <input type="text"     className="form-control d-inline-block w-auto" name="username"         value={form.username || ""}         onChange={handleForm} placeholder="ユーザー名"/> <br />
                <input type="email"    className="form-control d-inline-block w-auto" name="email"            value={form.email || ""}            onChange={handleForm} placeholder="メールアドレス"/> <br />
                <input type="password" className="form-control d-inline-block w-auto" name="password"         value={form.password || ""}         onChange={handleForm} placeholder="パスワード"/> <br />
                <input type="password" className="form-control d-inline-block w-auto" name="password_confirm" value={form.password_confirm || ""} onChange={handleForm} placeholder="パスワード(確認)"/> <br />
                <input type="button"   className="btn btn-outline-success" value="アカウント作成" onClick={handleSubmit} />
            </form>
        </>
    )
};


export const LogoutButton = () => {
    const { logout } = useAuth();
    return (
        <>
            <div className="text-end">
                <input className="btn btn-outline-danger" type="button" value="ログアウト" onClick={logout} />
            </div>
        </>
    )
};
```

#### verifyToken

まず、ページロードした時、localStorageの中にあるアクセストークンは有効であるかをチェックする。

もしここで検証失敗した場合、localStorageのアクセストークン、リフレッシュトークンはいずれも削除する。

現時点では、ページロード時に次の refreshAccessToken を使うようにしたため、この関数は使われていない。

#### refreshAccessToken

リフレッシュトークンを使って、アクセストークンを再生成している。

ただし、1回限り再生性をしたとしても、次の有効期限切れでアクセストークンは使えなくなる。

だから、アクセストークンの有効期限切れの前に、自動的にアクセストークンを再生成するよう、setTimeoutを使った。

これで有効期限を意識せずアクセストークンが使える。setTimeoutの戻り値(タイムアウトID)を、useRefで管理している。

#### login 

ユーザー名とパスワードを受け取り、ログインのエンドポイント(トークン生成のエンドポイント)へリクエストを送る。

ログイン成功した場合、レスポンスデータの中にトークンが含まれるので、これをlocalStorage に記録する。


#### logout

通常、JWTにログアウトの機能はないため、localStorage のトークンを削除するだけで良いが、今回はブラックリスト機能を実装したため、リクエストを送る。

リフレッシュトークンをボディに入れ、ヘッダーにはアクセストークンをセットし、ログアウトのエンドポイントへリクエストを送る。

リクエストが正常に終わった場合、localStorage のトークンを削除する。

#### accountCreate

アカウントの新規作成機能。JWTにはアカウント新規作成の機能は用意されていないため、フォームを用意してリクエストを送っている。

アカウント作成後、login関数を呼び出している。


## src/components/bbs/Base.jsx


```
import React, { useEffect,useState } from 'react';
import Index from "./Index";
import Detail from "./Detail";
import Edit from "./Edit";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";

import { LoginForm, LogoutButton, AccountCreateForm, useAuth } from "../../AuthContext";

const Base = () => {
    const { authState } = useAuth();

    return (
        <>
            <BrowserRouter>
                <header className="bg-primary">
                    <h1>
                        <Link className="text-white text-decoration-none" to={"/"}>簡易掲示板</Link>
                    </h1>
                </header>

                { authState.user_id ? (
                    <>
                        <LogoutButton />
                        <main className="container">
                            <Routes>
                                <Route path={`/`}           element={<Index />} />
                                <Route path={`/topic/:id`}  element={<Detail />} />
                                <Route path={`/topic/edit/:id`}  element={<Edit />} />
                            </Routes>
                        </main>
                    </>
                )
                : (
                    <>
                        <LoginForm />
                        <AccountCreateForm />
                    </>

                ) }

            </BrowserRouter>
        </>
    )
};

export default Base;
```

ベースのコンポーネント。

認証状態のStateをコンテキストのカスタムフックから取り出し、確認をしている。


## 動かすとこうなる

<div class="img-center"><img src="/images/2025-01-15_11-18_01.png" alt=""></div>

これが未ログイン状態のログイン画面とアカウント新規作成画面

<div class="img-center"><img src="/images/2025-01-15_11-18_02.png" alt=""></div>

ログイン後のページ表示。

今回、[メールアドレスの検証](/post/django-auth-not-allauth-add-custom-user-model-mail-verify/)などは行っていない、別途サーバー側で実装が必要だ。

また、更に強固なセキュリティが必要なら、[OTPも使う](/post/startup-django-otp/)と良いだろう。

複雑になるので、カスタムユーザーモデル導入後、ビューの処理を分離するなども必要だ。

## 参照元

- https://zenn.dev/tanaka_takeru/articles/3fe82159a045f7
- https://ja.wikipedia.org/wiki/JSON_Web_Token
- [https://ja.wikipedia.org/wiki/ステートレス・プロトコル](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%86%E3%83%BC%E3%83%88%E3%83%AC%E3%82%B9%E3%83%BB%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB)

## 関連記事

- [【React】Contextとカスタムフックでログイン・ログアウト、認証状態を扱う](/post/react-usecontext-custom-hook/)

## 結論

とてつもなく気が遠くなるような、大掛かりな作業だった。

特にトークンのリフレッシュ、ブラックリスト登録などは、これまでのDjangoでのデフォルトの認証やallauthでは扱われなかった概念だ。

セッションベースの認証と今回のトークンベースの認証では、セキュリティのレベルに差異は無いようだが、localStorageからアクセストークン取り出し、ばらまいたら簡単に不正アクセスもできる。

これほど複雑になるとセキュリティテストを本格的に考えたほうがよいかもしれない。ペネトレーションテスト。

本当にこの設定で問題はないのか、もう少ししっかり検証した上で、アプリ開発を勧めていきたいと思う。

ともあれ、これで認証付きのAPIサーバーを使ったSPAが作れるようになった。後はWebSocketの双方向通信と、スマホアプリの開発だ。


## ソースコード

https://github.com/seiya0723/drf-react-spa-bbs-jwt


