---
title: "Django-allauthのログインページの装飾を装飾する【テンプレートの追加】"
date: 2020-11-11T17:59:11+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","html5","css3","ウェブデザイン","allauth"]
---


`django-allauth`により、比較的簡単に認証関係の機能を実装できる。だが、装飾まではサポートされていない。

このような殺風景なログイン画面が表示されてしまうのだ。これをそのままにして顧客に納品させるわけにはいかない。

<div class="img-center"><img src="/images/Screenshot from 2021-02-15 10-54-45.png" alt="殺風景な無装飾のログインページ"></div>

本記事ではこの`django-allauth`のログインページを装飾させる方法を解説する。

## Django-allauthのインストールとsettings.py、urls.pyの設定

まず、`django-allauth`のインストールをする。

    pip install django-allauth

続いて、settings.pyの設定を行う。重要なのは、TEMPLATESを以下のように書き換えることだ。メールを使用した認証にしたい場合は[【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)を参照したい。

    SITE_ID = 1
    
    LOGIN_REDIRECT_URL = '/'
    ACCOUNT_LOGOUT_REDIRECT_URL = '/'
    
    
    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    
        #以下を追加
    
        'django.contrib.sites',
        'allauth',
        'allauth.account',
        'allauth.socialaccount',
    
    ]
    
    TEMPLATES = [ 
        {   
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [os.path.join(BASE_DIR,"templates"),
                     os.path.join(BASE_DIR,"templates","allauth"), # ←追加
                     ],  
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

つまり、プロジェクトディレクトリの直下に`templates`ディレクトリを作り、[django-allauthのGitHubのtemplates](https://github.com/pennersr/django-allauth/tree/master/allauth/templates)を`allauth`に改名させ、保存する。

次項でこの公式GitHubからDLしたテンプレートを書き換えることで装飾を行うのだ。

続いて、`allauth`のログイン用のパスを通すため、`config/urls.py`を書き換える。

    urlpatterns = [ 
        
        #.....省略.....
    
        path('accounts/', include("allauth.urls")), # ←追加
    ]

## allauthテンプレートを装飾する

django-allauthのテンプレートは`account`、`openid`、`socialaccount`、`tests`の4つのディレクトリが含まれている。いずれのテンプレートも`account/base.html`を継承して作られている。即ち、`account/base.html`だけを編集すれば良い。下記のように編集を施す。

編集前

    <!DOCTYPE html>
    <html>
      <head>
        <title>{% block head_title %}{% endblock %}</title>
        {% block extra_head %}
        {% endblock %}
      </head>
      <body>
        {% block body %}
    
        {% if messages %}
        <div>
          <strong>Messages:</strong>
          <ul>
            {% for message in messages %}
            <li>{{message}}</li>
            {% endfor %}
          </ul>
        </div>
        {% endif %}
    
        <div>
          <strong>Menu:</strong>
          <ul>
            {% if user.is_authenticated %}
            <li><a href="{% url 'account_email' %}">Change E-mail</a></li>
            <li><a href="{% url 'account_logout' %}">Sign Out</a></li>
            {% else %}
            <li><a href="{% url 'account_login' %}">Sign In</a></li>
            <li><a href="{% url 'account_signup' %}">Sign Up</a></li>
            {% endif %}
          </ul>
        </div>
        {% block content %}
        {% endblock %}
        {% endblock %}
        {% block extra_body %}
        {% endblock %}
      </body>
    </html>

編集後

    {% load static %}
    
    <!DOCTYPE html>
    <html>
        <head>
            <title>{% block head_title %}{% endblock %}</title>
            <link rel="stylesheet" href="{% static 'allauth/css/style.css' %}">
            {% block extra_head %}
            {% endblock %}
        </head>
        <body>
            {% block body %}
    
                {% if messages %}
                <div>
                    <strong>Messages:</strong>
                    <ul>
                        {% for message in messages %}
                        <li>{{message}}</li>
                        {% endfor %}
                    </ul>
                </div>
                {% endif %}
    
                <div>
                    <strong>Menu:</strong>
                    <ul>
                        {% if user.is_authenticated %}
                        <li><a href="{% url 'account_email' %}">Change E-mail</a></li>
                        <li><a href="{% url 'account_logout' %}">Sign Out</a></li>
                        {% else %}
                        <li><a href="{% url 'account_login' %}">Sign In</a></li>
                        <li><a href="{% url 'account_signup' %}">Sign Up</a></li>
                        {% endif %}
                    </ul>
                </div>
                {% block content %}
                {% endblock %}
    
            {% endblock %}
    
            {% block extra_body %}
            {% endblock %}
        </body>
    </html>


冒頭に`{% load static %}`を記述、`head`タグに`style.css`を読み込むように指定し、インデントを2から4に変えた。

ユーザー登録時、ログイン時のレイアウトや装飾を書き換えたい場合は、それぞれ`account/signup.html`及び、`account/login.html`を編集すれば良い。

`css`は`static/allauth/css/style.css`に保存し、内容は下記。

    body{
        margin:0;
        color:#a9a9b3;
        background:#252627;
    }
    a {
        color:orange;
    }
    
    input[type="text"],input[type="email"],input[type="password"] {
        font-size:1rem;
        padding:0.25rem;
        margin:0.25rem 0;
        border:solid 0.25rem orange;
        background:black;
        color:white;
        transition:0.2s;
        
    }
    input[type="text"]:focus,input[type="email"]:focus,input[type="password"]:focus {
        box-shadow:0px 0px 5px 2px  orange;
        transition:0.2s;
        outline:none;
    }
    
    button[type="submit"] {
        padding:0.5rem 2rem;
        color:#a9a9b3;
        background:#252627;
        border:solid 0.15rem orange;
        border-radius: 0.25rem;
        cursor:pointer;
        transition:0.2s;
    }
    button[type="submit"]:hover {
        background:orange;
        color:white;
        transition:0.2s;
    }


これで、このように装飾が施される。


<div class="img-center"><img src="/images/Screenshot from 2021-02-15 13-00-37.png" alt="装飾完了"></div>

サイトのデザインを統一させることができた。さらにこだわりたい場合は前述の通り、`account/signup.html`及び、`account/login.html`を編集すれば良い。


## 結論

allauthの実装そのものはそれほど難しくはないが、テンプレートの構造を理解した上での装飾が必要になるので、やや手間取る。メール認証、カスタムユーザーモデル、そしてテンプレートの装飾まで含めると、やはり認証関係はdjango-allauthを使用しても一朝一夕では済まない。

デフォルトではクラス名等も指定されていないので、より複雑な装飾を施す場合、テンプレートのHTML構造の改造も必須になる。

### 【補足1】ログインフォームを中央寄せにする

下記記事ではログインフォームを中央寄せにする方法が解説されている。

これが一般的ではあるだろう。

[Django-allauthにてログイン画面を中央寄せにさせる【テンプレートのカスタマイズ】](/post/django-allauth-center-loginpage/)

<div class="img-center"><img src="/images/Screenshot from 2021-12-24 10-04-49.png" alt=""></div>


