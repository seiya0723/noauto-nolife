---
title: "デバウンスしてキー入力の度にイベントを発火し続けないようにする【再レンダリング地獄対策】"
date: 2025-03-04T10:57:59+09:00
lastmod: 2025-03-04T10:57:59+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","React","tips" ]
---


ReactはStateの変化で再レンダリングをする仕様である。

Stateの高頻度な変更は、再レンダリングを頻繁に発生させ、表示が遅くなると言った問題が起こる。

この問題を防ぐためにも、キー入力の度にStateを書き換えるのではなく、**最後のキー入力が終わって1秒経ってからStateを書き換える**という仕様に仕立てる。

このしくみを**デバウンス**という。

このデバウンスのしくみはsetTimeoutの操作で簡単に実現できるので、Reactに限らずJavaScriptの高速化にも有効。

## デバウンスのソースコード


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">

</head>
<body>
    <h1 class="bg-primary text-white">デバウンスする検索欄とデバウンスしない検索欄の違い</h1>

    <h2>デバウンスする検索欄</h2>

    <input id="debounce" type="text">


    <h2>デバウンスしない検索欄</h2>

    <input id="not_debounce" type="text">

<script>
const debounce      = document.querySelector("#debounce");
const not_debounce  = document.querySelector("#not_debounce");

let timer = null;

debounce.addEventListener("input", (e) => {
    // デバウンス: 1秒以内に入力がされた場合、タイムアウトをリセット。入力を終えて1秒経ったら実行する。
    clearTimeout(timer);

    const value = e.currentTarget.value;

    timer = setTimeout( () => {
        console.log(value);
    } , 1000)
});

not_debounce.addEventListener("input", (e) => {
    // 即実行
    console.log(e.currentTarget.value);
});

</script>

</body>
</html>
```

このように、グローバルのtimerの値をイベントが発動する度に、`clearTimeout`を使って初期化する。

後は setTimeoutをセットする。待ち時間は1秒とすれば、キー入力が終わった1秒後に発火する。とってもシンプルなしくみだ。

## 結論

このように高頻度で発動をする事自体が、処理速度のボトルネックになっている場合、今回のように一定時間経ってから発火させるか、

もしくはサーバーサイドであれば一定時間おきに発火するバッチ処理として動作させるかのいずれかが有効である。

ただし、この待ち時間は状況に応じて調整は必要。

今回は1秒としたが、それでは反映までに時間がかかり利用者にストレスを貯めてしまう。逆に短すぎれば、処理の負担が増えてしまう。

即応性と処理の負担のトレードオフを考慮して、時間を調整していく必要がある。


