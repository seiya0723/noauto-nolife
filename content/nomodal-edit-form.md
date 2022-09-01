---
title: "【Slack風】モーダルダイアログ無し、ページ遷移無しで編集フォームを作る【JS不使用】"
date: 2021-04-25T13:42:24+09:00
draft: false
thumbnail: "images/Screenshot from 2021-04-25 14-07-45.png"
categories: [ "サーバーサイド" ]
tags: [ "ウェブデザイン","上級者向け","css3","html5","django","アンチパターン" ]
---

投稿されたコンテンツを編集する時、編集フォームを表示するページに遷移したり、編集フォームをJSなどを使用してモーダルダイアログとして表示させることがある。こんなふうに。

<div class="img-center"><img src="/images/Screenshot from 2021-04-25 13-47-08.png" alt="モーダルダイアログ"></div>

しかし、これでは他のコンテンツを見ながらの編集ができない。それだけでなく、ページ遷移やダイアログ表示を行うとJSやサーバーサイドに負担がかかる。そこで、投稿したコンテンツを表示する場所を、編集フォームに切り替えるように仕立てる。こんなふうに。

<div class="img-center"><img src="/images/Screenshot from 2021-04-25 10-41-39.png" alt="編集フォームとコンテンツの表示切り替え"></div>

しかもこの方法の利点は、`input`タグと`label`タグと30行程度のCSSのみで実現できること。JSもサーバーサイドのコードも書く必要はないのだ。


## 実際にやってみる。

Djangoで実装させる。LaravelやRailsでも要領は同じ。まずテンプレート。

    {% load static %}
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
    
        <link rel="stylesheet" href="{% static 'bbs/css/style.css' %}">
    
    
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input class="form-control" type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border p-2">
                <input id="{{ topic.id }}" class="topic_edit_chk" type="checkbox">
    
                <div class="topic_content">{{ topic.comment }}</div>
    
                <form class="topic_edit_form p-2" action="{% url 'bbs:edit' topic.id %}" method="POST">
                    {% csrf_token %}
                    <textarea class="form-control" name="comment">{{ topic.comment }}</textarea>
                    <input class="form-control" type="submit" value="編集">
                </form>
    
                <label for="{{ topic.id }}" class="topic_edit_label"><i class="fas fa-edit"></i></label>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>


中盤の`for`ループにてコンテンツを表示している。その際、編集用フォームと`checkbox`の`input`タグ、その`input`タグに紐付いた`label`タグを設置する。つまり、`checkbox`のチェック状況に応じて、コンテンツとフォームの表示を切り替えるのだ。`label`はその`checkbox`を操作するためのボタン。

この時、`checkbox`と`label`をつなぐ`id`属性に、コンテンツのidを指定している。数値型連番のidであれば他のテーブルと重複するので、予めUUID型にしておいたほうが良い。

続いて、CSS。先の説明で想像がつくかも知れないが、`checkbox`の擬似クラス、`:checked`をうまく使っている。

    .topic_edit_chk {
        display:none;
    }
    .topic_edit_form{
        display:none;
    }
    .topic_edit_label{
        padding:0.25rem;
        border:solid 0.2rem orange;
        border-radius:0.25rem;
        cursor:pointer;
    }
    .topic_edit_label i{
        font-size:1.25rem;
    }
    input[type="checkbox"].topic_edit_chk:checked ~ .topic_edit_label{
        background:orange;
    }
    input[type="checkbox"].topic_edit_chk:checked ~ .topic_edit_form{
        display:block;
    }
    input[type="checkbox"].topic_edit_chk:checked ~ .topic_content{
        display:none;
    }
    
兄弟要素を意味する`~`は右辺の要素が左辺の要素よりも先に書かれている必要がある。つまり、下記のコードでは動かない。

    {% for topic in topics %}
    <div class="border p-2">
        <div class="topic_content">{{ topic.comment }}</div>
        <form class="topic_edit_form p-2" action="{% url 'bbs:edit' topic.id %}" method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment">{{ topic.comment }}</textarea>
            <input class="form-control" type="submit" value="編集">
        </form>
        <input id="{{ topic.id }}" class="topic_edit_chk" type="checkbox"><label for="{{ topic.id }}" class="topic_edit_label"><i class="fas fa-edit"></i></label>
    </div>
    {% endfor %}

これでは、`label`タグの装飾は発動するが、`input`タグよりも先に書かれてあるフォームとテンプレートの装飾は発動されない。inputタグの値でコンテンツとフォームの切り替えをしたいのであれば、下記の様にinputタグを一番上に設置する。

    {% for topic in topics %}
    <div class="border p-2">
        <input id="{{ topic.id }}" class="topic_edit_chk" type="checkbox"> <!-- このinputタグの位置はコンテンツやフォームよりも先に -->
        <div class="topic_content">{{ topic.comment }}</div>
        <form class="topic_edit_form p-2" action="{% url 'bbs:edit' topic.id %}" method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment">{{ topic.comment }}</textarea>
            <input class="form-control" type="submit" value="編集">
        </form>
        <label for="{{ topic.id }}" class="topic_edit_label"><i class="fas fa-edit"></i></label>
    </div>
    {% endfor %}


## 実際に動かしてみる

これでボタンを押してフォームとコンテンツを切り替える事ができた。Slack風のアレである。

<div class="img-center"><img src="/images/Screenshot from 2021-04-25 14-07-45.png" alt="コンテンツとフォームの同じ場所での切り替えができている"></div>

まだ装飾が雑なのでボタンを押すたびにガクガクするが、そこはフォーム系のタグ装飾をどうにかすれば大丈夫だろう。後は切り替わる時にアニメーションをいくらか用意すれば、動きが滑らかになる。

## 結論

これでモーダルダイアログいらずである。

モーダルダイアログは全画面に表示をする仕様上、全体を見通しやすく、ユーザーに注意を引く、他を操作させないというメリットがある。

しかし、そもそも編集というものは能動的に行うものであり、あえて注意を引かなくてもわかる。さらに編集フォーム自体は、全画面を使わなくてもコンパクトに表現できるので、編集にモーダルダイアログを使うのはユーザビリティの観点から考えて疑問しかない。

編集ページを使うというのも同様で、フォームを表示させるためだけにページ遷移(リクエスト送信)しているようではサーバー側の負担が増えてしまう。リクエスト数が限定もしくは従量課金制のクラウドサーバーであれば、サーバーへのリクエスト削減はコスト面から考えても死活問題であろう。


## ソースコード

https://github.com/seiya0723/custom_edit_form
