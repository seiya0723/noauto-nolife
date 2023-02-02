---
title: "【CSS】変数を使用する【テーマカラーの統一、スキンの作成などに】"
date: 2023-01-31T11:23:18+09:00
lastmod: 2023-01-31T11:23:18+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "css3","tips","初心者向け" ]
---

SCSSなどではなく、素のCSSで変数が使えることに今になって気づいた。

ということで、実際に扱っていく。


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Welcome to my portfolio site !!</title>

<style>
:root{
    --base-color: #111111;
    --theme-color: #00ffcc;
    --font-color: white;
}

body {
    background:var(--base-color);
    color: var(--font-color);
    margin:0;
}
h1 { background: var(--theme-color); }

</style>

</head>
<body>
    <h1>Welcome to my portfolio site !!</h1>

    <h2>Profile</h2>

    <h2>Portfolio</h2>

</body>
</html>
```

`:root{}`で宣言した変数 `--base-color`等がプロパティの値として呼び出すことができる。

予めテーマカラーなどをまとめて冒頭に書いておけば、それを書き換えるだけですぐに対応できる。

この変数を扱うことで、CSSファイルを別途用意したり、正規表現で書き換える必要はないようだ。



参照元: https://developer.mozilla.org/ja/docs/Web/CSS/Using_CSS_custom_properties


