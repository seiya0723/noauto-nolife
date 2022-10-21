---
title: "jQueryのオブジェクトをfor~of文でループするとJavaScriptになる問題の対処"
date: 2022-10-21T09:56:46+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","tips","アンチパターン" ]
---

for~of文を使ってjQueryのオブジェクトをループすると、JavaScriptのオブジェクトになる。

その対策をまとめておく。

## jQueryループ時の問題

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

    <div class="test">1</div>
    <div class="test">2</div>
    <div class="test">3</div>
    <div class="test">4</div>

<script>
    let elems = $(".test");

    //この時点ではjQueryのオブジェクトになっている。
    console.log(elems);

    for (let elem of elems){

        //for of文で取り出すと、JavaScriptのオブジェクトになっている。
        console.log(elem);

        //jQueryのオブジェクトだと思ってjQueryのメソッドや属性を参照するとエラー
        //console.log(elem.text());
    }
</script>

</body>
</html>
```

このように、jQueryのオブジェクトをループすると、JavaScriptになる。これではjQueryのメソッドは使用できず、構文がやや読みづらくなってしまう。


そこで、ループしてもjQueryのオブジェクトになるように仕立てる。


## 【解決策1】.eq()を使う


jQueryのオブジェクトはJavaScriptの配列とは違う。

そのため、こんな事はできない。

```
for (let i=0;i<elems.length;i++){
    console.log(elems[i]);
}
```

もし、jQueryのオブジェクトからインデックス番号を指定して取り出したい場合は、`.eq()`を使う。


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

    <div class="test">1</div>
    <div class="test">2</div>
    <div class="test">3</div>
    <div class="test">4</div>

<script>
    let elems = $(".test");

    //この時点ではjQueryのオブジェクトになっている。
    console.log(elems);

    for (let i=0;i<elems.length;i++){
        console.log(elems.eq(i));
        console.log(elems.eq(i).text());
    }

</script>

</body>
</html>
```
ただ、これでもちょっと見た目が悪いと思う場合は次の解決策を。


## 【解決策2】.each()を使う


jQueryのeachメソッドを使う。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

    <div class="test">1</div>
    <div class="test">2</div>
    <div class="test">3</div>
    <div class="test">4</div>

<script>
    let elems = $(".test");

    //この時点ではjQueryのオブジェクトになっている。
    console.log(elems);

    elems.each(function(){
        console.log($(this).text());
    });

</script>

</body>
</html>
```

1個ずつ取り出して、取り出した値はthisとして扱われるので、それをjQueryのオブジェクトに直し、メソッドを実行する。

となると、勘の良い方は気づくと思う。

これが許されるのであれば、次にこうすれば良いということを。


## 【解決策3】for~of文を使い、jQueryのオブジェクト化させる

JavaScriptで要素を1つずつ取り出したい場合、for~of文が一番簡単だ。

Pythonで言うfor~in文みたいな扱いができるから。配列オブジェクトから1つずつ取り出しができる。

できれば、jQueryでもfor~of文を使いたい。

では、for~of文を使った状態で、jQueryのオブジェクトとして扱うにはどうしたらよいか。

簡単な話である。jQueryのオブジェクト化させれば良いのだ。


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

    <div class="test">1</div>
    <div class="test">2</div>
    <div class="test">3</div>
    <div class="test">4</div>

<script>
    let elems = $(".test");

    //この時点ではjQueryのオブジェクトになっている。
    console.log(elems);

    for (let elem of elems){
        //jQueryのオブジェクト化させる
        console.log($(elem).text());
    }

</script>

</body>
</html>
```

最初からこうすれば良かったのだ。


## 結論

jQueryのオブジェクトはループするとどうしてもjQueryではなくなる。

なぜなら、jQueryのオブジェクトがJavaScriptのオブジェクトを束ねたものだから。下記画像を見るとわかる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-21 10-49-06.png" alt=""></div>

故に、ループして取り出した値はまた、jQueryのオブジェクト化させる必要があるのだ。

もし、これをしないでjQueryのメソッドを実行したいのであれば、解決策1の`.eq()`を使うしか方法はない。


## 参照元

- https://www.task-notes.com/entry/20140725/1406216933
- https://api.jquery.com/each/
- https://developer.mozilla.org/ja/docs/Web/API/Document_Object_Model/Introduction



