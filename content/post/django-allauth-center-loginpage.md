---
title: "Django-allauthにてログイン画面を中央寄せにさせる【テンプレートのカスタマイズ】"
date: 2021-12-24T10:01:44+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-24 10-04-49.png"
categories: [ "サーバーサイド" ]
tags: [ "django","allauth","ウェブデザイン" ]
---

[以前の方法](/post/django-allauth-loginpage/)であれば、単純なCSSの割り当てだけだったので、ログインフォームを中央寄せに仕立てることはできなかった。

今回は、HTMLも大幅に変更を行い、ログイン画面のフォームを中央寄せに仕立てる。

## account/base.html

全てのログインフォームのテンプレートから継承される`base.html`を下記のように編集する。

    {% load static %}
    
    <!DOCTYPE html>
    <html>
        <head>
            <title>{% block head_title %}{% endblock %}</title>
            <!--中央寄せ、フォーム系のタグは全てBootstrapから拝借-->
            <link rel="stylesheet" href="{% static 'allauth/css/style.css' %}">
            {% block extra_head %}
            {% endblock %}
        </head>
        <body>
            <div class="body_area">
                <div class="body_area_inner">
    
                    {% block body %}
    
                    {% if messages %}
                    <div class="message_area">
                        <strong>Messages:</strong>
                        <ul>
                            {% for message in messages %}
                            <li>{{message}}</li>
                            {% endfor %}
                        </ul>
                    </div>
                    {% endif %}
    
                    <div class="menu_area">
                        <strong>Menu:</strong>
                        <ul>
                            {% if user.is_authenticated %}
                            <li><a href="{% url 'account_email' %}">メールアドレス変更</a></li>
                            <li><a href="{% url 'account_logout' %}">ログアウト</a></li>
                            {% else %}
                            <li><a href="{% url 'account_login' %}">ログイン</a></li>
                            <li><a href="{% url 'account_signup' %}">ユーザー登録</a></li>
                            {% endif %}
                        </ul>
                    </div>
    
                    <!--TODO:ここにログインフォーム等が表示される-->
                    {% block content %}
                    {% endblock %}

                    {% endblock %}
    
                    {% block extra_body %}
                    {% endblock %}
    
                </div>
            </div>
        </body>
    </html>

## static/allauth/css/style.css

    body{
        margin:0;
        position:relative;
        height:100vh;
    }
    
    .body_area {
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .body_area_inner{
        padding:1rem;
        border:solid 0.2rem orange;
    }
    h1 {
        text-align:center;
    }
    
    input[type="text"],input[type="password"],input[type="email"]{
    
        display: block;
        width: 100%;
        height: calc(2.25rem + 2px);
        font-size: 1rem;
        color: #495057;
        background: white;
        border: 1px solid orange;
        border-radius: .25rem;
    
        box-sizing: border-box;
    }
    
    button{
        display:block;
        width:100%;
        margin:0.5rem 0;
        font-size: 1rem;
        background:white;
        border: 1px solid orange;
        cursor:pointer;
        transition:0.2s;
    
        padding:0.5rem;
    
        line-height: 1.5;
    
        user-select: none;
        text-align: center;
        vertical-align:middle;
    }
    button:hover{
        background:orange;
        transition:0.2s;
    }


inputタグのテキストは`width:100%`を指定すると、親要素からはみ出すので、`box-sizing:border-box`を指定してはみ出さないようにしている。

buttonタグの中の文字列は`vertical-align:middle`と`line-height`を指定して中央に寄せるようにしている。

後は、ログインフォームの領域を中央寄せに仕立てるだけ。

## 結論

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-24 10-04-49.png" alt=""></div>

メニュー等の装飾をするべきか迷ったが、汎用性を考慮してあえてやらなかった。一応、中央寄せと色つけをしているので、何も装飾をしていない状態に比べればよいかと。後は、サイトのロゴ等を載せるとログインページっぽくなる。

関連記事:[Django-allauthのログインページの装飾を装飾する【テンプレートの追加】](/post/django-allauth-loginpage/)

ソースコード:https://github.com/seiya0723/allauth-login-template

