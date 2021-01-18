---
title: "Django Templates Language(DTL)でincludeを実行する時に引数も与える"
date: 2020-12-24T16:51:03+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "Django","tips","初心者向け" ]
---


Djangoでテンプレートファイルを分離させ、includeするときがある。複数の箇所で同じフォームを表示したりする時がそうだ。

ただ、フォームのIDをそれぞれの箇所で別々とする場合、引数を指定する必要がある。

## 結論

結論から言うと、こうなる。

    {% include "[パス]" with [引数名]=[値] %}

`include`するhtmlのパスを指定した後、`with`を指定することで引数の指定が可能になる。指定した引数は`include`先で、

    {{ [引数名] }}

と指定して、引数を呼び出すことができる。


