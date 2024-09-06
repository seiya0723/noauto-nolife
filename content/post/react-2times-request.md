---
title: "Reactでaxiosを使ってリクエストをすると、2回送られる問題"
date: 2024-08-14T10:35:12+09:00
lastmod: 2024-08-14T10:35:12+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "サーバーサイド" ]
tags: [ "react","drf" ]
---

index.js の
```
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
を
```
root.render(
    <App />
);
```
に直す。




## 参考元

https://stackoverflow.com/questions/73002902/api-getting-called-twice-in-react


