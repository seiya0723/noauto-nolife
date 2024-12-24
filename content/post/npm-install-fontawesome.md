---
title: "npm で Fontawesomeを使う"
date: 2024-12-23T17:08:15+09:00
lastmod: 2024-12-23T17:08:15+09:00
draft: false
thumbnail: "images/npm.jpg"
categories: [ "フロントサイド" ]
tags: [ "npm","tips","fontawesome" ]
---

```
npm install @fortawesome/fontawesome-free
```
これでfont-awesomeの最新版がインストールされる。後は、App.jsに下記を追加する。
```
import '@fortawesome/fontawesome-free/css/all.min.css';
```
importした後、JSXに、
```
<i className="fa-regular fa-square-check"></i>
```
を追加する。


ちなみに、下記では旧版がインストールされてしまう。
```
npm install font-awesome
```




