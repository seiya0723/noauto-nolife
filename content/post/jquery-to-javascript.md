---
title: "jQueryのコードをJavascriptに書き換える【セレクタ、属性値の参照、イベントなど】"
date: 2021-04-13T18:32:51+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "javascript","jQuery","tips" ]
---


jQueryに依存したコードをそのままにするのは再利用性に欠け、開発効率にも関わる。そこで、今回はjQueryのコードを適宜javascriptに書き換える。


## セレクタ

まずは基本のセレクタ以下のように書き換える。
    
    var test    = $(".test");

    //↓以下に書き換え

    var test    = document.querySelectorAll(".test"); //←全ての.textクラスの要素を抜き取る
    var test    = document.querySelector(".test"); //←.testクラスの1番最初の要素を抜き取る

jQueryが提供するメソッドや属性などは使用できなくなるが、JavaScriptの`querySelector()`及び`.querySelectorAll()`の使用感はjQueryのそれに似ているので代用しやすいと思われる。

`.querySelector()`の場合、同じIDが誤って複数存在する場合、一番最初のIDが返却される。これはjQueryのセレクタと挙動は同様である。

下記の抜き取ったセレクタの属性値やメソッドの代用も参照したい。

- 参照: https://developer.mozilla.org/ja/docs/Web/API/Document/querySelector


## セレクタの属性、メソッド

jQueryに用意されている属性値の参照、メソッドの実行は`.setAttribute()`、`.getAttribute()`で表現できる。

    console.log( $("#textarea").val() );
    $("#checkbox").prop("check",true);

    //↓以下に書き換え

    console.log( document.querySelector("#textarea").getAttribute("value") );
    document.querySelector("#checkbox").setAttribute("checked","true");


即ち、属性値に対して値を入れるのは`.setAttribute()`、属性値に対して値を参照するのは`.getAttribute()`。

ただし、jQueryの`.val()`メソッドは`textarea`タグに対して行っても記入されている内容を抜き取ることができるが、`.getAttribute("value")`では抜き取れない。`textarea`タグに`value`属性は存在しないからだ。

`textarea`タグに記入されている内容を抜き取りたい場合、`.textContent`を使う。

- 参照1: https://developer.mozilla.org/ja/docs/Web/API/Element/getAttribute
- 参照2: https://developer.mozilla.org/ja/docs/Web/API/Element/setAttribute


## 要素のstyle属性の設定

要素に`style`属性を設定する場合`.style.cssText()`を使う。

    $(".button").css({"background":"orange"});

    //↓以下に書き換え

    document.querySelector(".button").style.cssText("background:orange;");

`.setAttribute()`で`style`属性を指定することもできる

    document.querySelector(".button").setAttribute("style","background:orange;");

- 参照: https://developer.mozilla.org/ja/docs/Web/API/ElementCSSInlineStyle/style


## クラスの追加・削除

jQueryでクラスを追加・削除をする方法

```
$(".button").addClass("bg-orange");
$(".button").removeClass("bg-orange");
```

JavaScriptでクラスを追加・削除する方法

```
document.querySelector(".button").classList.add("bg-orange");
document.querySelector(".button").classList.remove("bg-orange");
```


## レンダリング

`.html()`は`innerHtml`に書き換える。


    $("#topic_area").html(html_data);

    //↓以下に書き換え
    
    document.querySelector("#topic_area").innerHtml = html_data;

HTMLを書き込むため、書き込む際にはユーザーから受け取った内容をチェック無しでそのままレンダリングしないようにする。(XSS脆弱性)

参照: https://developer.mozilla.org/ja/docs/Web/API/Element/innerHTML

## テキスト書き換え

.text() は .textContent に当たる。

```
$("#textarea").text("テスト");

document.querySelector("#textarea").textContent   = "テスト";
```


JavaScriptには、.innerTextというものがあるが、これはCSSで非表示になっている部分は省かれる。

そのため、jQueryの.text() は JavaScriptの .innerText とは違う。


## イベント

    $(".button").on( "click", function(){ console.log("clicked"); } );

    //↓以下に書き換え
    
    //単一要素にイベント設定する場合はこちら
    const button    = document.querySelector("#button");
    button.addEventListener( "click", () => { console.log("clicked"); } );

    //複数要素にイベント設定する場合はこちら
    const buttons    = document.querySelectorAll(".button");
    for (let button of buttons){
        button.addEventListener( "click", () => { console.log("clicked"); } );
    }


一旦セレクタで要素のオブジェクトを作った後、`.addEventListener( [発火条件], () => { [処理] })`メソッドを実行してイベントリスナをセットする。

クラス名など複数ヒットする場合はforループでそれぞれイベントをセットする。

- 参照: https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener

jQueryでは、アロー関数ではなくfunction関数を使うことが多い。理由は

- thisの挙動が違う
- jQuery開発者の間で、アロー関数に馴染みがない

などがある。

## 結論

jQueryで簡単にJSのコードが書けるが、後日再利用するとなるとjQueryを予め読み込まなければならない。これが足かせになる場合もある。

素のJSで書けるのであれば、それに越したことはないだろう。多少長くても統合開発環境などを使えば、属性名等の補正もしてくれる。

## 関連記事

### 素のJavaScriptでAjaxを送信するには？

下記はサーバーサイドとしてDjangoを使っているが、jQueryのAjaxを使用した場合と全く変わらないように作っている。

[素のJavaScriptのXMLHttpRequest(Ajax)で通信する【jQuery不使用】](/post/django-xmlhttprequest-ajax-not-use-jquery/)

### モダンな構文

JavaScriptのモダンな構文を知りたい場合は下記を見ると良いだろう。一部の構文は脱jQueryにも使えると思う。

[Reactに必要なJavaScript構文【ES2015(ES6)のテンプレート文字列、アロー関数、スプレッド構文、letとconstなど、脱jQueryにも有効】](/post/react-essential-javascript/)



