---
title: "【jscolor】カラーピッカーを実装できるJavaScriptライブラリ【シンプル】"
date: 2024-02-04T16:08:40+09:00
lastmod: 2024-02-04T16:08:40+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","ウェブデザイン","tips" ]
---


例えば、投稿した内容に色をつけたいというとき。

通常は、`type="color"`のinputタグを使う。

```
<input type="color" name="color">
```

だが、これはブラウザごとに見た目が大きく異なる。しかも見た目があまりよろしくない。

<div class="img-center"><img src="/images/Screenshot from 2024-02-04 16-12-01.png" alt=""></div>

そこで、以下を考慮して、JavaScriptのライブラリを選定した。

- 無料
- フォームの見た目が良い
- 扱いやすい
- jQueryに依存していない
- 実装が非常にシンプルでわかりやすい
- コピペですぐに使えるジェネレータもある
- ドキュメントがしっかりしている

以上から、 [jscolor](https://jscolor.com/) を採用した。


## サンプルコード


CDN は [こちら](https://cdnjs.com/libraries/jscolor) から


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>

    <input name="color" data-jscolor="">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.2/jscolor.min.js" integrity="sha512-qFhMEJrjI50TwLDGZ7Oi0ksTSWnFOqTNXhlqqUgWnE65S23rWUtQOv+tMNEybkMYSXKgAc3eg/SzkX+qrtJT/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
    jscolor.presets.default = {
            format:'hex'
     };
</script>

</body>
</html>
```

カスタムデータ属性、`data-jscolor`を付与。`type="color"`を除去して使う。

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2024-02-04 16-32-14.png" alt=""></div>


これで、16進数カラーコードの投稿ができる。



## パレットをいくらか用意して、サイズも大きくさせる。

そのままでは少し扱いづらいので、いくらかカラーパレットを用意し、入力欄も大きく表示させる。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>

    <input name="color" data-jscolor="">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.2/jscolor.min.js" integrity="sha512-qFhMEJrjI50TwLDGZ7Oi0ksTSWnFOqTNXhlqqUgWnE65S23rWUtQOv+tMNEybkMYSXKgAc3eg/SzkX+qrtJT/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
    jscolor.presets.default = {
        format:'hex',
        palette: [
            '#000000', '#7d7d7d', '#870014', '#ec1c23', '#ff7e26',
            '#fef100', '#22b14b', '#00a1e7', '#3f47cc', '#a349a4',
            '#ffffff', '#c3c3c3', '#b87957', '#feaec9', '#ffc80d',
            '#eee3af', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
        ],
        width:300, height:200
     };
</script>

</body>
</html>
```

<div class="img-center"><img src="/images/Screenshot from 2024-02-04 16-40-45.png" alt=""></div>


パレットが押しにくい場合は、`paletteHeight: 30`を追加しておく。

```
<script>
    jscolor.presets.default = {
        format:'hex',
        palette: [
            '#000000', '#7d7d7d', '#870014', '#ec1c23', '#ff7e26',
            '#fef100', '#22b14b', '#00a1e7', '#3f47cc', '#a349a4',
            '#ffffff', '#c3c3c3', '#b87957', '#feaec9', '#ffc80d',
            '#eee3af', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
        ],
        width:300, height:200,
        paletteHeight: 30
     };
</script>
```

## ジェネレーター

ライブラリの公式がジェネレーターを用意してくれているので、コードを書く時間も惜しい場合は、こちらからすぐに実装できる。

https://jscolor.com/configure/


## 結論

JavaScriptライブラリのカラーピッカーは大量にある。

選定はとても迷ったが、ジェネレータもあり、すぐに実装できるjscolorを選んだ。

中でも [Pickr](https://simonwep.github.io/pickr/) は 更にコンパクトにカラーピッカーを配置することもできるようだ。

とはいえ、最初から色を細かく指定することは殆どないので、とりあえずはパレットを表示、細かく指定したいときだけピッカーを表示という形式が個人的にはベストなのかもしれない。

もっと良いカラーピッカー系ライブラリが見つかれば、そちらに乗り換える。
