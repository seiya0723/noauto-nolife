---
title: "DRF+ReactのSPAでCRUD簡易掲示板をつくる"
date: 2025-01-06T10:52:43+09:00
lastmod: 2025-01-06T10:52:43+09:00
draft: false
thumbnail: "images/drf-react.jpg"
categories: [ "フルスタック" ]
tags: [ "drf","django","react" ]
---


## 開発要件

- DRF+ReactでSPA
- react-router-domでページURLの構築
- 簡易掲示板のCRUD機能
- カテゴリ指定・追加機能
- リプライ投稿機能
- CSRF検証の挙動を確認するため、あえてJWT認証はオミット
- CRAではなくViteを使用

[以前のもの](/post/startup-django-react-func-component/)は、1対多には対応しておらず、CRAを利用していた。またページもない。

更に、axiosがコールバック地獄になっているので、そちらも修正した。


## 使用ライブラリ

### サーバーサイド

以下、requirements.txt

```
asgiref==3.8.1
Django==5.1.4
django-cors-headers==4.6.0
djangorestframework==3.15.2
sqlparse==0.5.3
typing_extensions==4.12.2
```

DRFに加えReactサーバーからのリクエストを受け付けるよう、django-cors-headersを使っている。

これで、DRF+ReactのSPAを作るには、必要最小限のライブラリと言える。

### フロントサイド

以下、package.json

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

装飾のためのfontawesomeとbootstrap。

定番のaxiosに、react-router-dom でページURLを構築している。

今回は開発が停止されたCRAに変わり、Viteを使用した。

```
npm install @fortawesome/fontawesome-free
npm install bootstrap
npm install axios 
npm install react-router-dom
```

## サーバーサイドのコード解説

### models.py 

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

オーソドックスなモデル。

投稿日時は[auto_now](/post/django-models-datetime-auto-now-add/) などのフィールドオプションで自動入力できるが、今回は管理サイトからの投稿日時の編集が許されるように、あえて使わず、`default=timezone.now`とした。

### serializers.py

以前の[モデルからadmin.pyを生成するツール](/post/django-auto-create-models-forms-admin/)を、Serializer用に修正し、自動生成した。

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
```

djangoのDateTimeFieldをシリアライズしてレスポンスする時、日付のフォーマットは、`2025-01-05T17:52:38.881338+09:00`と、タイムゾーンありの文字列で返されてしまう。

そこでまず、フロントサイドでのフォーマットの編集も考えた。

Intl ではタイムゾーンが考慮されず、luxonなどの外部ライブラリに頼るしかないため、サーバー側でフォーマットを修正するようにした。

```
created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H時%M分%S秒",required=False)
```

これで入力時は値を受け付けず、表示時には年月日のフォーマットで表示される。

また、今回は下記記事のようにカテゴリをネストしないようにした。

[1対多のモデル構造で、ネストしたserializers.pyを作る](/post/drf-foreignkey-serializers/)

ネストしなくても、カテゴリのデータを使ってフロント側で照合する。

### views.py 

普通の、ModelViewSet。こちらも生成ツールを時前で用意して、時短した。

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
```


今回、CSRFの挙動を確認するため、JWT認証は行っていない。

ReplyViewはidを指定してTopicに紐づくReplyのみ返すようにしている。パラメータの指定がない場合は、何も返さない。


### ModelViewSetでは、基本CSRF検証は免除されている。だが、JWT認証をしない場合、CSRF検証はされる。

詳細は、[DRFはいつCSRF検証をするのか？](/post/drf-csrf-validation/) を確認。

### バリデーションエラーのとき、400エラーが帰ってくる

ModelViewSetでは、バリデーションエラーの時、400エラーが帰ってくる。

[DRFで400 Bad Request エラーが出る時、Serializerを確認する](/post/drf-400-error-serializer/) を確認。

## urls.py 

CSRFトークンを返却するビューを用意した。

```
"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include


from rest_framework import routers
from bbs import views

router = routers.DefaultRouter()
router.register(r"topics", views.TopicView, "topic")
router.register(r"categories", views.CategoryView, "category")
router.register(r"replies", views.ReplyView, "reply")


from django.http import JsonResponse
from django.middleware.csrf import get_token

def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path("api/csrf-token/", csrf_token, name="csrf_token"),
]
```

今回、CSRF検証の動作確認のため、CSRFトークンを返却するビューを用意した。

```
router.register(r"topics", views.TopicView, "topic")
router.register(r"categories", views.CategoryView, "category")
router.register(r"replies", views.ReplyView, "reply")
```

RESTの原則に従い、URLは全て名詞の複数形で対応している。

https://ja.wikipedia.org/wiki/Representational_State_Transfer


## settings.py 

```
"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

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
CORS_ORIGIN_WHITELIST = [
     'http://localhost:3000'
]
CSRF_TRUSTED_ORIGINS = [
     'http://localhost:3000'
]


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

今回、フロントサイドはReactサーバーが対応しているため、

```
INSTALLED_APPS = [

    "bbs.apps.BbsConfig",
    'corsheaders',
    'rest_framework',    

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
CORS_ORIGIN_WHITELIST = [
     'http://localhost:3000'
]
CSRF_TRUSTED_ORIGINS = [
     'http://localhost:3000'
]
```

このように仕立てた。CORSの許可リストとCSRF検証をする際のオリジンとしてReactサーバーを指定。

INSTALLED_APPS とMIDDLEWARE にもcorsheaders を含めた。

それ以外の設定は通常通り。

## フロントサイドのコード解説


### Viteについて

frontend というプロジェクトを作るため、
```
npm create vite@latest frontend --template react
```
このコマンドを実行、React、JavaScriptを選び、

```
cd frontend
npm install
npm run dev
```

とした。

参照: [create-react-app コマンドはもう使えないので、ViteでReactプロジェクトをつくる](/post/vite-create-react-project/)

### vite.config.js

通常、Viteサーバーは5173 ポートで起動するようになっている。

参照: https://ja.vite.dev/config/server-options.html

これではCRAからの移行で、3000ポートを許可する設定にしているサーバーサイドまで変更しなければならない。

そこで、Viteサーバーを3000ポートで起動させるようにした。 vite.config.jsを編集する

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    
    server: {
        port: 3000, // 使用するポート番号を指定
        proxy: {
            '/api': {
                target: 'http://localhost:8000/',
                changeOrigin: true,
            },
        },
    },
})
```

更に、CRAではpackage.jsonにproxyを書いていたが、Viteでは通用しない。vite.config.jsにはサーバーサイドのプロキシ設定も含めておく。


### src/components/

今回は、djangoのテンプレート継承の概念を取り入れ、components ディレクトリ内の構造を以下のように仕立てた。

```
bbs
|--Base.jsx
|--Detail.jsx
|--Edit.jsx
|--Index.jsx
```
Base.jsxを親コンポーネントとして、他3つの子コンポーネントが呼び出される。

### src/components/Base.jsx

```
import React, { useEffect,useState } from 'react';
import Index from "./Index";
import Detail from "./Detail";
import Edit from "./Edit";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";

const Base = () => {

    return (
        <>
            <BrowserRouter>
                <header className="bg-primary">
                    <h1>
                        <Link className="text-white text-decoration-none" to={"/"}>簡易掲示板</Link>
                    </h1>
                </header>

                <main className="container">
                        <Routes>
                            <Route path={`/`}           element={<Index />} />
                            <Route path={`/topic/:id`}  element={<Detail />} />
                            <Route path={`/topic/edit/:id`}  element={<Edit />} />
                        </Routes>
                </main>
            </BrowserRouter>

        </>
    )
};

export default Base;
```

基本となるコンポーネント。

react-router-domを使用して、URLに応じて呼び出すコンポーネントを指定している。

BrowserRouter コンポーネントでラップすることで、RoutesやLinkが有効になる。

### src/components/Index.jsx

```
import React, { useEffect,useState } from 'react';
import axios from "axios";

import { Link } from "react-router-dom";


const Index = () => {

    const [topics, setTopics] = useState({});
    const [categories, setCategories] = useState({});

    const [toggleForm, setToggleForm] = useState(false);

    // フォーム入力をする時はStateではなくuseRefを使う。
    // 投稿完了時、初期化できないのでStateにする。
    /*
    const newTopic = useRef({});
    const newCategory = useRef({});
    */

    const [newTopic, setNewTopic]       = useState({});
    const [newCategory, setNewCategory] = useState({});


    useEffect(() => {
        // TODO:ここでTopicをロードする。
        loadTopics();
        loadCategories();
    }, []);


    // 今回JWT認証はオミットしたため、CSRFトークンを取得する。
    const getCsrfToken = async () => {
        try {
            const response = await axios.get("/api/csrf-token/");
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    }


    const loadTopics = async () => {
        try {
            const response = await axios.get("/api/topics/");

            // { 1: { オブジェクト,  }, 2: {...}, 3: {...} } この形式に変換する
            const processed = {}; 
            for (let topic of response.data){
                processed[topic.id] = topic;
            }
            setTopics(processed);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    const loadCategories = async () => {
        try {
            const response = await axios.get("/api/categories/");

            // { 1: { オブジェクト,  }, 2: {...}, 3: {...} } この形式に変換する
            const processed = {}; 
            for (let category of response.data){
                processed[category.id] = category;
            }
            setCategories(processed);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }


    const submitTopic = async () => {
        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);
            console.log(newTopic);
            const response = await axios.post("/api/topics/", newTopic,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);

            setNewTopic({});
            loadTopics();

        } catch (error) {

            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    
    const deleteTopic = async (id) => {
        if( !confirm("本当に削除しますか？\n紐付いているリプライも削除されます。") ){
            return false;
        }

        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);
            const response = await axios.delete(`/api/topics/${id}/`,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);
            loadTopics();
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }

    }

    const submitCategory = async () => {
        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);
            const response = await axios.post("/api/categories/", newCategory,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);
            setNewCategory({});

            loadCategories();

        } catch (error) {

            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    
    const deleteCategory = async (id) => {
        if( !confirm("本当に削除しますか？\n紐付いている投稿やリプライも削除されます。") ){
            return false;
        }

        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);
            const response = await axios.delete(`/api/categories/${id}/`,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);
            loadTopics();
            loadCategories();
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }

    }


    const handleNewTopic = (e) => {
        /*
        console.log(e.currentTarget);
        console.log(e.currentTarget.name);
        console.log(e.currentTarget.value);

        console.log(e.target);
        console.log(e.target.name);
        console.log(e.target.value);
        */

        try {
            setNewTopic( (prevNewTopic) => {
                const updatedNewTopic = { ...prevNewTopic };
                updatedNewTopic[e.target.name] = e.target.value;
                return updatedNewTopic;
            });
        }
        catch (error) {
            console.log(error);
        }
    }


    const handleNewCategory = (e) => {
        try {
            setNewCategory( (prevNewCategory) => {
                const updatedNewCategory = { ...prevNewCategory };
                updatedNewCategory[e.target.name] = e.target.value;
                return updatedNewCategory;
            });
        }
        catch (error) {
            console.log(error);
        }
    }


    const handleToggleForm = () => {
        setToggleForm( (prevToggleForm) => !prevToggleForm );
    }


    
    return (
        <>


            { toggleForm ? (
                <>
                <h2>カテゴリ一覧</h2>

                <form>
                    <input className="form-control w-auto d-inline-block" type="text" placeholder="カテゴリ名" name="name" onChange={handleNewCategory} value={newCategory.name || "" } />
                    <input className="btn btn-outline-primary" type="button" onClick={submitCategory} value="作成" />
                </form>

                <ul>
                { Object.entries(categories).map( ([id, category]) => (
                    <li key={id}>{ category.name } <span className="mx-1 btn btn-outline-danger" onClick={ () => { deleteCategory(category.id) } }>削除</span>
                    </li>
                ))}
                </ul>

                <span className="btn btn-outline-danger" onClick={handleToggleForm}>戻る</span>
                </>

            ) : (

                <>
                <h2>新規作成</h2>
                <form>
                    <select className="form-select w-auto d-inline-block" name="category" onChange={ handleNewTopic } value={ newTopic.category || "" }>
                        <option value="">カテゴリを選んでください</option>
                        { Object.entries(categories).map( ([id, category]) => (
                        <option key={id} value={category.id}>{ category.name }</option>
                        )) }
                    </select>

                    <span className="fs-4 d-inline-block mx-2" onClick={handleToggleForm} >
                        <i className="fa-regular fa-square-plus"></i>
                    </span>

                    <textarea className="form-control" rows="4" name="comment" placeholder="コメントを入力してください" onChange={ handleNewTopic } value={ newTopic.comment || "" }></textarea>
                    <input className="form-control" type="button" onClick={ submitTopic } value="投稿"/>
                </form>
                </>
            )

            }

            <hr />

            { Object.entries(topics).map( ([id, topic]) => (
                <div className="border my-2" key={id}>
                    <div className="bg-secondary-subtle">

                <div>投稿日時: { topic.created_at }</div>
                {/* <div>投稿日時: { formatDate(topic.created_at) } </div>  */}
                        <div>カテゴリ: { categories[topic.category] && categories[topic.category].name }</div>
                    </div>
                    <div className="fs-5 p-2">{ topic.comment }</div>

                    <div className="text-end py-2">

                        <Link className="mx-1 btn btn-outline-primary" to={`/topic/${topic.id}/`} >詳細</Link>
                        <Link className="mx-1 btn btn-outline-success" to={`/topic/edit/${topic.id}/`}>編集</Link>
                        <span className="mx-1 btn btn-outline-danger" onClick={ () => { deleteTopic(topic.id) } }>削除</span>
                    </div>

                </div>
            )) }
        </>
    );  
};

export default Index;
```


#### useRefについて

useRefはuseStateと同様、値を格納することができる。

ただし、useRefは値が変わっても、再レンダリングしない。

そこで、今回はtextareaなどのフォームにuseRefを使用してみた。

これで、textareaの入力のたびに再レンダリングすることはなくなった。だが、投稿後にtextareaを初期化することができなくなった。

useRefに初期値を入れても、textareaのvalueは再レンダリングすることはない。

よって、フォームの入力値は、これまで通りuseStateで値を格納することにした。

#### e.currentTarget と e.target

```
    const handleNewTopic = (e) => {
        /*
        console.log(e.currentTarget);
        console.log(e.currentTarget.name);
        console.log(e.currentTarget.value);

        console.log(e.target);
        console.log(e.target.name);
        console.log(e.target.value);
        */

        try {
            setNewTopic( (prevNewTopic) => {
                const updatedNewTopic = { ...prevNewTopic };
                updatedNewTopic[e.target.name] = e.target.value;
                return updatedNewTopic;
            });
        }
        catch (error) {
            console.log(error);
        }
    }
```

このコードの currentTarget、target どちらのconsole.log も同じ値を表示した。

だが、setStateをする時、currentTargetの方は、nullと判断されて値を入れることはできなかった。


### src/components/Detail.jsx


```
import React , { useEffect,useState } from 'react';

import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const Detail = () => {
    const { id } = useParams();
    const [topic , setTopic] = useState({});
    const [categories, setCategories] = useState({});
    const [replies , setReplies] = useState({});

    //const newReply = useRef({ topic : id });

    const [newReply, setNewReply] = useState({ topic : id });

    useEffect(() => {
        loadTopic();
        loadCategories();
        loadReplies();
    }, []);

    const getCsrfToken = async () => {
        try {
            const response = await axios.get("/api/csrf-token/");
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    }

    // GET: トピックリストを取得
    const loadTopic = async () => {

        try {
            const response = await axios.get(`/api/topics/${id}/`);
            console.log(response.data);

            setTopic(response.data);
        } catch (error) {

            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    const loadCategories = async () => {
        try {
            const response = await axios.get("/api/categories/");

            // { 1: { オブジェクト,  }, 2: {...}, 3: {...} } この形式に変換する
            const processed = {};
            for (let category of response.data){
                processed[category.id] = category;
            }
            setCategories(processed);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    const loadReplies = async () => {
        try {
            const response = await axios.get(`/api/replies/?id=${id}`);

            const processed = {};
            for (let reply of response.data){
                processed[reply.id] = reply;
            }
            setReplies(processed);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }


    const handleNewReply = (e) => {

        setNewReply( (prevNewReply) => {
            const updatedNewReply = { ...prevNewReply };
            updatedNewReply[e.target.name] = e.target.value;

            return updatedNewReply;
        });

    }

    const submitReply = async () => {
        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);
            const response = await axios.post("/api/replies/", newReply,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);
            setNewReply({ topic : id });
            loadReplies();

        } catch (error) {

            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    return (
        <>
        { topic.id ?
            <>
                <div className="border my-2">
                    <div className="bg-secondary-subtle">
                        <div>投稿日時: { topic.created_at }</div>
                        <div>カテゴリ: { categories[topic.category] && categories[topic.category].name }</div>
                    </div>
                    <div className="fs-5 p-2">{ topic.comment }</div>

                    <div className="text-end py-2">
                        <Link className="mx-1 btn btn-outline-success" to={`/topic/edit/${topic.id}/`}>編集</Link>
                        <span className="mx-1 btn btn-outline-danger" onClick={ () => { deleteTopic(topic.id) } }>削除</span>
                    </div>
                </div>

                <hr />

                <h2>リプライ一覧</h2>

                <form>
                    <textarea className="form-control" rows="4" name="comment" placeholder="コメントを入力してください" onChange={ handleNewReply } value={ newReply.comment || "" }></textarea>
                    <input className="form-control" type="button" onClick={ submitReply } value="投稿"/>
                </form>

                { replies ? 
                    Object.entries(replies).map( ([id, reply]) => (
                        <div className="border my-2" key={id}>
                            <div className="bg-secondary-subtle">
                                <div>投稿日時: { reply.created_at }</div>
                            </div>
                            <div className="fs-5 p-2">
                                {reply.comment}
                            </div>
                        </div>
                    ))
                : <div>リプライはありません</div> }

            </>
            : <div>トピックがありません</div> }
        </>
    );
};

export default Detail;
```

詳細ページのコンポーネントである。

csrfTokenの部分は重複しているので、次の開発ではutilsディレクトリに関数をまとめておく。


#### URL引数

react-router-dom の useParams を使い、URL内の引数を取り出している。

```
const { id } = useParams();
```

Base.jsxで定義した

```
<Route path={`/topic/:id`}  element={<Detail />} />
```

ここから、idを取り出している。どうやら、型の定義まではできないらしい。

参照: https://reactrouter.com/start/library/url-values


### src/components/Edit.jsx

```
import React , { useEffect,useState } from 'react';

import axios from "axios";
import { useParams } from "react-router-dom";

const Edit = () => {

    const { id } = useParams();
    const [topic , setTopic] = useState({});
    const [categories, setCategories] = useState({});

    useEffect(() => {
        loadTopic();
        loadCategories();
    }, []);

    const getCsrfToken = async () => {
        try {
            const response = await axios.get("/api/csrf-token/");
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    }

    const loadTopic = async () => {
        try {
            const response = await axios.get(`/api/topics/${id}/`);
            console.log(response.data);

            // HACK: ここで入力必須ではないcreated_atを除外する(日付フォーマットが違うため400エラーになる。)
            // 密結合になるので、もっと良い方法を考えるべき
            const data = { ...response.data };
            delete data.created_at;

            setTopic(data);

        } catch (error) {

            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    const loadCategories = async () => {
        try {
            const response = await axios.get("/api/categories/");

            // { 1: { オブジェクト,  }, 2: {...}, 3: {...} } この形式に変換する
            const processed = {};
            for (let category of response.data){
                processed[category.id] = category;
            }
            setCategories(processed);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }

    const handleTopic = (e) => {
        try {
            setTopic( (prevTopic) => {
                const updatedTopic  = { ...prevTopic };

                updatedTopic[e.target.name]   = e.target.value;
                return updatedTopic;
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    const submitEditTopic = async () => {

        try {
            const csrfToken = await getCsrfToken();
            console.log(csrfToken);

            const response = await axios.put(`/api/topics/${id}/`, topic,
                { headers: { 'X-CSRFToken': csrfToken } },
            );
            console.log(response);

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error('Response Error:', error.response.data);
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', error.response.headers);
            } else {
                console.error('Request Error:', error.message);
            }
        }
    }


    return (
        <>

        { topic.id ?
            <>
            <h2>編集フォーム</h2>

            <form>
                <select className="form-select w-auto d-inline-block" name="category" onChange={ handleTopic } value={topic.category || "" }>
                    <option value="">カテゴリを選んでください</option>
                    { Object.entries(categories).map( ([id, category]) => (
                    <option key={id} value={category.id}>{ category.name }</option>
                    )) }
                </select>

                <textarea className="form-control" rows="4" name="comment" placeholder="コメントを入力してください" onChange={ handleTopic } value={topic.comment}></textarea>
                <input className="form-control" type="button" onClick={ submitEditTopic } value="編集"/>
            </form>

            </>
            : <div>トピックがありません</div> }
        </>
    );
};

export default Edit;
```


## 動かすとこうなる

トップページ

<div class="img-center"><img src="/images/2025-01-06_12-24.png" alt=""></div>

詳細ページ

<div class="img-center"><img src="/images/2025-01-06_12-26.png" alt=""></div>

編集ページ

<div class="img-center"><img src="/images/2025-01-06_12-44.png" alt=""></div>


## ソースコード

https://github.com/seiya0723/drf-react-spa-bbs

## 結論

この開発作業により、

- CSRF検証のタイミングと発火条件
- Viteの仕組み
- useRef,useEffect,useStateの仕組み
- 日付のSerializerの書き方
- ModelViewSet の バリデーションエラー時の挙動

がわかった。

また、スプレッド構文、短絡評価、三項演算子など、頻繁に使うモダンJavaScript構文も慣れてきた。

ただ、全体的に似たような処理が続いている。更に簡略化させていきたい。Next.jsの採用も一考だ。

### 今後の課題

- react-router-domではなく、Next.jsを使う
- JWT認証を実装
- 多対多の実装
- 検索機能の実装
- ページネーション機能の実装
- WebSocketの実装
- 画像のアップロード
- DjangoMessageFrameworkのような通知バナー表示

#### react-router-domではなく、Next.jsを使う

Next.jsであれば、pageディレクトリにjsxファイルを配置するだけで、簡単にページURLを構築できる。

とはいえ、React Router v7とRemix の統合により、素のReactでもSSRができるようになった。

そうなってくると、相対的にNext.jsの優位性が霞んでくる。

参照: https://qiita.com/Sicut_study/items/7dc1b0cdcc1bee210f05

もっとも、Next.jsを使用したサイトは数多くあるため、すぐに不要になるとは思えないが。

https://ja.wikipedia.org/wiki/Next.js

ちなみに、Next.jsのインストールとプロジェクト作成方法は、

```
npx create-next-app@latest my-next-app
```

プロジェクト構成は以下の通り。

```
my-next-app/
├── public/
├── src/ (任意)
├── pages/
│   ├── api/
│   ├── index.js
│   └── _app.js
├── styles/
│   ├── globals.css
│   └── Home.module.css
├── node_modules/
├── .next/
├── package.json
├── next.config.js
└── README.md
```

ViteのReactと同じく、`npm run dev `で動作させる。

#### JWT認証を実装

下記記事のJWT認証は、トークンの再生成まではしていないため、修正する。

[Django(DRF)+ReactのSPAでJWTを使った認証を実装する](/post/startup-django-react-jwt/)

#### 多対多の実装

DRF+ReactのSPAで多対多を実装する場合、GET、POSTともに、以下のようなJSONを送る必要がある。

```
{
    "title": "My First Article",
    "content": "This is the content.",
    "tags": [1, 2, 3]
}
```

このように紐づくモデルのidを配列でやり取りする。

タグの追加、削除を頻繁に行う場合、PATCHの挙動をどうするか考える必要もある。

ただし、RestfulなAPI設計とはかけ離れるので、基本はPUTで対応したほうが良いだろう。

- [DjangoでManyToManyFieldを使い、中間テーブルのモデルを取得する【多対多のthrough】](/post/django-m2m-field-take-through/)
- [Djangoで多対多のリレーションの構造と作り方、テンプレートで表示する方法【ManyToManyField】](/post/django-many-to-many/)

#### 検索機能の実装

DRF(ModelSetView)で検索機能を実装する時、`django-filter`を使う方法と`SearchFilter`を使う方法の2パターンが考えられる。


##### django-filter 

django-filter は、インストールが必要。

```
pip install django-filter
```

フィルタークラスを作り、ModelViewSetに与える。


```
import django_filters

from .models import Topic

# フィルタークラスを作る。コメントと日時の範囲検索
class TopicFilter(django_filters.FilterSet):
    comment     = django_filters.CharFilter(lookup_expr='icontains')
    created_at  = django_filters.DateFromToRangeFilter()

    class Meta:
        model   = Topic
        fields  = ["comment", "created_at"]


from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from .models import Topic
from .serializers import TopicSerializer

# ModelViewSetでDjangoFilterBackend を使って有効化。先のTopicFilterを指定。
class TopicViewSet(ModelViewSet):
    queryset            = Topic.objects.all()
    serializer_class    = TopicSerializer

    filter_backends     = [DjangoFilterBackend]
    filterset_class     = TopicFilter
```

この django-filter はスペース区切りの検索に対応しているようだ。


##### SearchFilter

SearchFilter はDRFに含まれる。インストールは不要。ただし機能は限定されている。

スペース区切りの検索に対応していない。

```
from rest_framework.filters import SearchFilter

class TopicViewSet(ModelViewSet):
    queryset            = Topic.objects.all()
    serializer_class    = TopicSerializer

    filter_backends     = [SearchFilter]
    search_fields       = ["title", "content"]
```

この他にも、カスタムロジックを実装する方法や双方を併用する形もある。

どんな方法が良いのか、状況に応じて一番良いと思われるものを模索していきたいところだ。

#### ページネーション機能の実装

DRFでは、ページネーションがデフォルトで動作するようになっている。

その仕組みは[djangoのもの](/post/django-do-not-use-customtemplatetags/)とは違い、非常にシンプルで、検索との両立もサポートしている。

```
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from .models import Topic
from .serializers import TopicSerializer


# 1ページに10件表示する。
class CustomPagination(PageNumberPagination):
    page_size = 10

class TopicViewSet(ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    pagination_class = CustomPagination
```

この場合、例えば `/topic/?search=Django 教科書&page=2` などとすれば、検索した状態で2ページ目が表示される。


#### WebSocketの実装

WebSocketをReactで使う場合、useEffect(ページロード時)にWebSocketのオブジェクトを作り、イベントのコールバックも同時に定義しておけば良いだけ。

メッセージを受け取ったら、Stateを使って値をセットするようになる。

[DjangoでWebSocketを使って、チャットサイトを作る](/post/django-websocket-chatsite/)

以下は、ReactでWebSocketを実装したときのサンプル。

```
import React, { useState, useEffect } from 'react';

const WebSocketComponent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  // WebSocketの接続
  useEffect(() => {
    // WebSocketサーバーのURL
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      // サーバーから受け取ったメッセージを追加
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // WebSocketをstateにセット
    setWs(socket);

    // コンポーネントがアンマウントされた時にWebSocketを閉じる
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // メッセージ送信
  const sendMessage = () => {
    if (ws && message) {
      ws.send(message);
      setMessage('');  // メッセージ送信後、入力をクリア
    }
  };

  return (
    <div>
      <h1>WebSocket Communication</h1>
      <div>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message" 
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h2>Received Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketComponent;
```

#### 画像のアップロード

リクエストのボディには、FormDataオブジェクトを与えることで動作する。(これまでのプレーンオブジェクトではない)

FormDataオブジェクトは内部に画像が含まれる場合、自動的に `Content-Type: multipart/form-data` のヘッダーを指定してくれる。

一方、プレーンオブジェクトの場合、`Content-Type: application/json` のデフォルトで送信される。

FormDataオブジェクトのほうが柔軟性が高いため、この先は、リクエストのボディにはFormDataオブジェクトを与える。

[FormDataをformタグではなく、オブジェクトにキーと値をセットした上でAjax送信](/post/javascript-formdata-obj-set/)

#### DjangoMessageFrameworkのような通知バナー表示

React側で、バナー表示の仕組みを用意する必要がある。

DRF側では、Serializerにバリデーションエラー時のメッセージを用意しておく。



