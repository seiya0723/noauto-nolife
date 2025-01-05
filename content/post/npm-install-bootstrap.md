---
title: "npm で Bootstrap を使う"
date: 2025-01-04T15:39:43+09:00
lastmod: 2025-01-04T15:39:43+09:00
draft: false
thumbnail: "images/npm.jpg"
categories: [ "フロントサイド" ]
tags: [ "npm","tips","bootstrap" ]
---

```
npm install bootstrap
```

App.jsに以下を追加する。

```
import 'bootstrap/dist/css/bootstrap.min.css';
```

後は、使いたいコンポーネントで


```
<header className="bg-primary text-white">簡易掲示板</header>
```

などとすれば良い。

## なぜ @fortawesome/fontawesome-free 、 なぜ bootstrap ？

先に、fontawesomeをインストールしたときは、

```
npm install @fortawesome/fontawesome-free
```

とした。@がついている。

これはスコープと言い、名前の衝突を避けるためにfontawesomeの開発会社、fortawesome社がつけている。(ミススペルや誤記などではなく、**fortawesome**社である。)

一方で、bootstrapの場合は、非常に有名であえてスコープをつける必要はないと判断され、

```
npm install bootstrap 
```

とされている。



