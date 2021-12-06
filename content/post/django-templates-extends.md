---
title: "【Django】簡易掲示板に折りたたみ式サイドバーを実装させる【extends】"
date: 2021-12-04T10:29:01+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-06 14-24-13.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","ウェブデザイン" ]
---

テンプレートの継承を使うことで、複数のページに共通するHTMLをひとまとめにすることができる。

コードは[40分Djangoで作った簡易掲示板](/post/startup-django/)を元に、[折りたたみ式のサイドバー](/post/css3-sidebar/)を使ってテンプレートを継承し、実現させる。

## 折りたたみサイドバーのHTMLとCSS

折りたたみ式のサイドバーは左側に設置させるようにした。`templates/common/l_sidebar.html`を作る。内容は下記
    
    {% load static %}
    
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{% block page_title %}{% endblock %}</title>
    
        <link rel="stylesheet" href="{% static 'common/css/l_sidebar.css' %}">
        <link rel="stylesheet" href="{% static 'common/css/fontawesome/all.css' %}">
    
        {% block extra_head %}
        {% endblock %}
    
    </head>
    <body>
        <header>
    
            <input id="l_sidebar" class="l_sidebar_button" type="checkbox">
    
            <div class="left_header">
                <label class="l_sidebar_label" for="l_sidebar">
                    <i class="fas fa-bars"></i>
                    <i class="fas fa-times"></i>
                </label>
                <a class="header_link" href="{% block header_link %}{% endblock %}"><h1>{% block header_title %}{% endblock %}</h1></a>
                <div class="header_right_content">
                {% block header_right_content %}
                {% endblock %}
                </div>
            </div>
    
            <div class="l_sidebar_menu">
                {% block sidebar_content %}{% endblock %}
            </div>
    
            <label class="l_sidebar_closer" for="l_sidebar"></label>
    
        </header>
    
        <main>
        {% block main %}
        {% endblock %}
        </main>
    
    </body>
    </html>

テンプレートタグの`block`を使用することで、継承元のテンプレートはその部分だけ書き換えることができる。

続いて、`static/common/l_sidebar.css`

    html, body {
        overflow-x: hidden;
        margin:0;
    }
    a {
        color:inherit;
        text-decoration:none;
    }
    .left_header {
        width:100%;
        height:3rem;
        position:fixed;
        z-index:99;
    
        background:#131417;
        color:white;
        display:flex;
        align-items:center;
    
        overflow:hidden;
    }
    .header_link {
        color:white;
        margin-left:0.5rem;
    }
    .left_header h1 {
        font-size:2rem;
        font-weight:bold;
        line-height:normal;
        margin:0;
    }
    
    .l_sidebar_button {
        display:none;
    }
    .l_sidebar_label {
        position:relative;
        margin-left:0.5rem;
        margin-bottom:0;
    
        width:3rem;
        height:2rem;
    
        z-index:100;
        cursor:pointer;
        transition:0.2s;
    }
    .l_sidebar_label i {
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        font-size:1.75rem;
    }
    .l_sidebar_label i.fa-times { display:none; }
    .l_sidebar_label i.fa-bars { display:block; }
    input[type="checkbox"]#l_sidebar:checked ~ .left_header .l_sidebar_label i.fa-bars { display:none; }
    input[type="checkbox"]#l_sidebar:checked ~ .left_header .l_sidebar_label i.fa-times { display:block; }
    
    .header_right_content {
        position:absolute;
        right:0;
        top:50%;
        transform:translateY(-50%);
    
        display:flex;
        margin-right:0.5rem;
    }
    
    
    .l_sidebar_menu {
        position:fixed;
        top:3rem;
        left:-300px;
    
        height:calc( 100vh - 3rem);
        width:300px;
        background:#333;
        color:white;
        
        transition:0.2s;
        overflow:auto;
        z-index:99;
    }
    input[type="checkbox"]#l_sidebar:checked ~ .l_sidebar_menu{
        left:0;
        transition:0.2s;
    }
    .l_sidebar_closer {
        position:fixed;
        top:3rem;
        right:0;
    
        height:calc(100vh - 3rem);
        width:100%;
        background:white;
        opacity:0.6;
        cursor:pointer;
        z-index:98;
    
        display:none;
    }
    input[type="checkbox"]#l_sidebar:checked ~ .l_sidebar_closer{
        display:block;
    }
    main {
       margin-top:3rem;
    }
    
    /* sp mode */
    @media (max-width:768px){
        .left_header h1 {
            font-size:1.5rem;
            font-weight:bold;
            line-height:normal;
            margin:0;
        }
    
    }



## テンプレートを継承する

`templates/common/l_sidebar.html`を継承する、`templates/bbs/index.html`を作る

    {% extends "common/l_sidebar.html" %}
    
    <!--追加でCSSを読み込ませる。今回はBootstrap-->
    {% block extra_head %}
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    {% endblock %}
    
    {% block page_title %}簡易掲示板{% endblock %}
    
    {% block header_link %}{% url 'bbs:index' %}{% endblock %}
    {% block header_title %}簡易掲示板{% endblock %}
    
    <!--↓これはヘッダーの右側に何かを表示させたい時に使う。例えばログインのボタンとか-->
    {% block header_right_content %}{% endblock %}
    
    <!--↓これは左サイドバーの中身に何かを表示させたい時に使う。例えばサイト内のリンクとか-->
    {% block sidebar_content %}{% endblock %}
    
    {% block main %}
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
    </main>
    {% endblock %}


`l_sidebar.html`で指定したテンプレートタグの`block`を指定してその中を書き込むことができる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-06 14-24-13.png" alt=""></div>


## ソースコード

https://github.com/seiya0723/django_templates_extends


