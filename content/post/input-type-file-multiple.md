---
title: "【HTML】inputタグで画像を複数枚指定する【multiple】"
date: 2024-02-04T22:30:45+09:00
lastmod: 2024-02-04T22:30:45+09:00
draft: false
thumbnail: "images/html5.jpg"
categories: [ "フロントサイド" ]
tags: [ "html","tips","django" ]
---

画像を複数枚指定できるようにする。

```
<form method="POST" enctype="multipart/form-data">
    <!-- CSRF token -->
    <input name="content" type="file" multiple>
    <input type="submit" value="送信">
</form>
```

このフォームで指定された画像は、下記のように同じname属性の値のフォームが複数存在する状態と同じ。

```
<form method="POST" enctype="multipart/form-data">
    <!-- CSRF token -->
    <input name="content" type="file">
    <input name="content" type="file">
    <input name="content" type="file">
    <input name="content" type="file">
    <input name="content" type="file">
    <!-- 略 -->
    <input type="submit" value="送信">
</form>
```

そのため、例えばDjangoでは .getlist() を使って取り出す。

```
request.FILES.getlist("content")
```


