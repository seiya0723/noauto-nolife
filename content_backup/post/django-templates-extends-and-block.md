---
title: "【Django】DTLのextendsとblockを使って、テンプレートを継承をする"
date: 2021-12-06T07:48:38+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---


DjangoTemplateLanguage(以下、DTL)の`extends`と`block`を使用することで、複数のページの共通部分を一箇所にまとめることができる。

例えば、BootstrapやjQueryの読み込み、サイトのヘッダーやサイドバー等の共通箇所を一箇所にまとめることで、編集時に一箇所だけ編集すればOK。

<div class="img-center"><img src="/images/Screenshot from 2021-12-06 11-00-09.png" alt=""></div>

本記事では`extends`と`block`を使用して、簡単なテンプレートの継承を行う。コードは[40分Django簡易掲示板](/post/startup-django/)を元に行う。

## templates/bbs/base.html を作る

内容は下記。


    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        {% block extra_head %}
        {% endblock %}
    
    </head>
    <body>
        <main class="container">

            {% block main %}
            {% endblock %}

        </main>
    </body>
    </html>

`block`タグは継承した子テンプレートが自由に編集できる場所。それ以外は親テンプレートであるこの`base.html`をそのまま引き継ぐ。


## base.htmlを継承する、templates/bbs/index.html を作る

    {% extends "bbs/base.html" %}
    
    {% block extra_head %}
    <script>console.log("ここにheadタグに追加するCSSやJSを書く");</script>
    {% endblock %}
    
    {% block main %}
    
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
    
    {% endblock %}


まず、子テンプレートになるindex.htmlは継承対象のHTMLを指定する。

    {% extends "bbs/base.html" %}

先ほど作った、`templates/bbs/base.html`を指定する。

続いて、親テンプレートである、`base.html`内に書かれてある`block`タグを`index.html`内に書く。`block`タグ内に、挿入したい内容を書くだけ。

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-06 11-27-49.png" alt=""></div>

[40分Django簡易掲示板](/post/startup-django/)と全く同じではあるが、テンプレートの継承が発動しているので、例えば編集ページを作る時は、`index.html`と同様に`base.html`を継承し、一部だけを書けばよい。


### 【補足1】extendsとincludeとはどう違う？

別のテンプレートを読み込むテンプレートタグとして、`{% include %}`がある。これは別のテンプレートを呼び出して、任意の場所に表示するだけであり、blockタグは使えない。

ただ、includeは引数を与えることができる。この引数を利用することで、テンプレートの使い回しができる。

また、extendsは基本的に親テンプレートを1つしか指定できないが、includeは何度でも呼び出すことができる点で異なる。

extendsはPythonのクラスの継承に近いが、includeは関数のように呼び出しができる。

### 【補足2】extendsとloadはどちらを先に書く？

extendsを先に書く。loadはその後に書く。

ちなみに、親テンプレートでloadをしていたとしても、それが子テンプレートに引き継がれることはないため、extendsを使って継承した後、静的ファイルを読み込むのであれば、staticを使う。

### 【補足3】レンダリング対象のテンプレートの指定はどうする？

子テンプレートを指定すればよい。先ほどの例であれば、views.pyのレンダリング処理は下記のようになる。

    return render(request,"bbs/index.html")

contextが必要な場合は第三引数に指定すれば、テンプレートの継承をしていない場合と同様にデータのレンダリングがされる。

## 結論

このテンプレートの継承を使えば、大規模なウェブサイトを開発する場合でも、別ページに共通するヘッダーやサイドバーなどのパーツを一箇所にまとめ、表示させることができる。

その具体的な例として、[折りたたみ式サイドバー](/post/css3-sidebar/)を継承し、各ページに表示させた方法がある。それが下記記事。

[【Django】簡易掲示板に折りたたみ式サイドバーを実装させる【extends】](/post/django-templates-extends/)


他にも、Djangoの認証用のライブラリであるDjango-allauthのテンプレートでは継承を使用して、共通箇所を1つのHTMLにまとめている。

下記はDjango-allauthのテンプレートを編集しているが、各所でextendsとblockを使用している。

[Django-allauthにてフォームを中央寄せにさせる【ログインページのテンプレートのカスタマイズ】](/post/django-allauth-center-loginpage/)



