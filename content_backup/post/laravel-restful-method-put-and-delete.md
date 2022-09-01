---
title: "【Laravel+Restful】DELETE、PUT、PATCHメソッドを送信する方法【php artisan make:controller Controller --resource】"
date: 2021-12-02T11:15:09+09:00
draft: true
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","初心者向け","tips" ]
---





## 関連記事

実は、`php artisan make:controller Controller --resource`を実行して生成されたコントローラのルーティングは分解できる。必要なコントローラだけ残して、不要なコントローラは削除しておくことで、スッキリとしたコードが作れるだろう。

そのためにも、まずはルーティングの分解をやっておくと良い。

[Laravelで--resourceで作ったコントローラのルーティングを解体する](/post/laravel-to-resource/)



