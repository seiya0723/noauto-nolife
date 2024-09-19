---
title: "【JavaScript】localStorageを使ってブラウザにデータを記録する【Cookieが使えないときに】"
date: 2024-09-19T15:03:16+09:00
lastmod: 2024-09-19T15:03:16+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","tips" ]
---


サーバー側にデータを送信しない場合、セキュリティ上CookieではなくlocalStorageを使う。


## ソースコード

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>
    <input id="test" type="text">
    <input id="reset" type="button" value="リセット">

<script>
const test  = document.querySelector("#test");
const reset = document.querySelector("#reset");

// 読み込みされたとき、データがあればテキストボックスにセットする。
const data  = localStorage.getItem("test");
if (data){
    test.value  = data;
}

// キー入力があるたびにローカルストレージにセットする。
test.addEventListener("change", (event) => {
    const value = event.currentTarget.value;

    localStorage.setItem("test",value);
});


reset.addEventListener("click", () => {
    test.value  = "";
    localStorage.setItem("test", "");
})

</script>

</body>
</html>
```

## 参考文献

https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage







