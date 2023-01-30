---
title: "JavaScriptで動的に増減する要素に対してイベントを発動させる【Vanilla.js】"
date: 2023-01-30T15:12:38+09:00
lastmod: 2023-01-30T15:12:38+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","tips" ]
---


動的に増減する要素に対して、以下のようなやり方ではイベントをセットすることはできない。(クリックして追加されたあと、ボタンをクリックしても追加はされない。)

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>

    <button class='test'>test</button>

<script>

    const test  = document.getElementsByClassName("test")[0];

    test.addEventListener("click",  () => {
        document.body.innerHTML += "<button class='test'>test</button>";
    }); 
</script>

</body>
</html>
```

jQueryではこのようにするが

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

    <button class='test'>test</button>

<script>
    $(document).on("click", ".test",  () => {
        $("body").append("<button class='test'>test</button>");
    });
</script>

</body>
</html>
```

Vanilla.jsではこのように書く

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>
    <button class='test'>test</button>
<script>

    //動的に増減する要素に対してイベントを発動させる
    document.addEventListener('click', (e) => {

        if (event.target && event.target.classList.contains("test") ) {
                document.body.innerHTML += "<button class='test'>test</button>";
        }
    });
</script>

</body>
</html>
```

これで動的に追加された要素に対してもイベント処理が発動する。


