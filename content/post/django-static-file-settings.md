---
title: "【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】"
date: 2021-10-11T15:03:30+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---

[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)では、Bootstrapのみ使用している。オリジナルの装飾を施したい場合、Djangoの静的ファイルの読み込みを使用するしか方法はない。

本記事では予め作っておいたCSSやJS等のファイルを読み込みする方法を記す。

## settings.pyにて読み込みのパスを設定

`settings.py`の末端にて、`STATICFILES_DIRS`を追加する。

    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/3.1/howto/static-files/
    
    STATIC_URL = '/static/'
    
    #↓追加
    STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]

これはプロジェクトディレクトリ直下の`static`という名前のディレクトリを、静的ファイルを格納するディレクトリとして扱う事を意味する。

この設定がない場合、アプリディレクトリ内の`static`を読み込むようになる。ただ、アプリディレクトリごとに`static`ディレクトリを分散してしまうと、例えばログインページなどの、複数のアプリに共通するページの装飾を行うファイルが分散する。そこで、今回はプロジェクトディレクトリ直下に`static`を作り、その中にCSSやJSを格納する。

設定が終わったら、プロジェクトディレクトリの直下に`static`ディレクトリを作る

    mkdir static

これで準備完了。

## 静的ファイルの配置と中身

静的ファイルの中身を作っていく。ただ、staticディレクトリ内に直接CSSやJSを配置しても良いが、より管理しやすくするために、アプリごと、CSS、JSごとにディレクトリ構造を考慮する。

<div class="img-center"><img src="/images/Screenshot from 2021-10-11 15-32-48.png" alt="静的ファイルの構造"></div>

上記のように、staticディレクトリの直下にはアプリ名と同じディレクトリを、その中にcss、js、image等のファイルの種類ごとにディレクトリを仕分けして保存する。こうすることで管理がやりやすい。

複数のアプリに共通する静的ファイルはstaticディレクトリの直下に、`common`ディレクトリを作ってcss、js、image等のディレクトリを作り、同様にファイルの種類ごとに仕分けをする。


そのため、下記コマンドを実行して、staticディレクトリの中にアプリ名のディレクトリと`common`ディレクトリを作る

    mkdir -p static/bbs/css/
    mkdir -p static/bbs/js/
    mkdir -p static/common/css/
    mkdir -p static/common/js/

mkdirコマンドでpオプションを使うことで、一気に2階層以上のディレクトリを作ることができる。

`static/bbs/css/style.css`を作る。

    .topic {
        border:solid 0.2rem orange;
        margin:0.25rem;
        padding:0.5rem;
    }


## テンプレートで読み込み

テンプレート(`templates/bbs/index.html`)を編集する。

    {% load static %}

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <link rel="stylesheet" href="{% static 'bbs/css/style.css' %}">
    
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="topic">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

冒頭に`{% load static %}`を追加、`head`タグ内にテンプレートタグのstaticを使用して`style.css`を読み込み

`style.css`で追加した`topic`クラスを`div`タグに追加する。

## 動かすとこうなる。

こんなふうにオレンジの枠が表示されたら成功。

<div class="img-center"><img src="/images/Screenshot from 2021-10-11 15-47-13.png" alt="静的ファイルの読み込み完了"></div>

## 結論

これでCSSやJSに加え、画像などのメディアファイルも表示できる。ただ、ユーザーから画像やファイルなどをアップロードして表示する場合、この方法では通用しない。この方法は、予め開発者が用意したファイルを表示させる場合に限り、有効である。

ユーザーが投稿したファイルを表示させたい場合は、[モデルを書き換え、画像などのファイルを保存できるようにする](/post/django-fileupload/)必要がある。

ちなみに、[デプロイ](/post/django-deploy-linux/)をする時、`settings.py`で静的ファイルの再度設定の書き換えが必要である。書き換えはデプロイ先のサーバーによって異なる。

