---
title: "【JavaScript】Enterキーが押されたときにイベントを実行する【.addEventListener('keydown')】"
date: 2023-01-30T16:22:21+09:00
lastmod: 2023-01-30T16:22:21+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "tips","JavaScript" ]
---


Enterのキーコードは13なので、イベント引数のeからkeyCodeを取り出す。


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>

    <input id="input" type="text">

<script>

    const input     = document.getElementById("input");
             
    input.addEventListener("keydown", (e) => {
        if( e.keyCode === 13 ){
                console.log("Enter");
        }
    });
</script>

</body>
</html>
```


## 他のキーと組み合わせて発火させるには？

例えば、ShiftキーとEnterキーの組み合わせの場合、こうなる。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>

    <input id="input" type="text">

<script>

    const input     = document.getElementById("input");
             
    input.addEventListener("keydown", (e) => {
        if( e.keyCode === 13 && e.shiftKey ){
                console.log("Enter");
        }
    });
</script>

</body>
</html>
```


