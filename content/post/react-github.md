---
title: "GitHubからクローンしたReactを動作させる方法"
date: 2024-01-21T14:45:29+09:00
lastmod: 2024-01-21T14:45:29+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","github","npm" ]
---

Reactのgitignoreには、`node_modules`が含まれている。

そのため、クローンしたReactのプロジェクトを動かすには、 `npm install`を前もって実行しておく必要がある。　

```
git clone https://github.com/seiya0723/startup-react

cd startup-react

npm install 

npm start
```



