---
title: "Javascriptでクリックした時、要素内文字列をクリップボードにコピーさせる"
date: 2024-01-13T19:29:37+09:00
draft: false
thumbnail: "images/Screenshot from 2024-01-14 12-55-13.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","tips","ウェブデザイン" ]
---

よく見かける、JavaScriptでクリックした時、コピーするアレを再現する。

## ソースコード


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

<style>
pre {
    background:black;
    padding:0.5rem;
    overflow:auto;

    position:relative;
}
pre code {
    color:#0fc;
}
.copy_button{
    user-select: none;
    display:inline-block;
    position:absolute;
    top:0;
    right:0;
    color:white;

    cursor:pointer;
    margin:0.25rem;
    padding:0.25rem 0.5rem;

    border:solid 0.1rem white;
    border-radius:0.5rem;
    
    transition:0.2s;

}
.copy_button:hover{
    background:#0fc;
    color:black;
}
.copy_button:active{
    background:black;
    color:white;
}
</style>

</head>
<body>
    <pre><code>console.log("HelloWorld");</code></pre>
<script>

const pre_elems     = document.querySelectorAll("pre");

// コピー用のボタンを配置する。
for (let pre_elem of pre_elems ){
    pre_elem.innerHTML += '<span class="copy_button">Copy</span>';
}

const copy_buttons  = document.querySelectorAll(".copy_button");

for (let copy_button of copy_buttons){
    copy_button.addEventListener("click" , (event) => {
        const code  = event.currentTarget.closest("pre").querySelector("code");

        if (navigator.clipboard && code){
            navigator.clipboard.writeText( code.textContent );
        }
    });
}

</script>


</body>
</html>
```





## 結論

ウェブアプリでコピーして別のウェブアプリのフォームにペーストしたい時、URLなどの長くて打ち損じやすい文字列をコピペさせる時などに有効。

ちなみに、このクリップボードのコピー機能を実装しようと思いたったのが2021年4月。あまり先送りにするのは戒めようとつくづく思った。

このブログにも実装しておいた。

参照: https://qiita.com/butakoma/items/642c0ec4b77f6bb5ebcf

