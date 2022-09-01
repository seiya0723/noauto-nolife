---
title: "【Ajax+FormData】DjangoRESTFrameworkのSerializerクラスとDjango公式のFormクラスの比較"
date: 2021-08-23T09:44:18+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","ajax","上級者向け","JavaScript" ]
---



Django公式のFormクラス。

Formクラスはモデルを継承して作ることが可能であり、Serializerと違ってモデルに書いたsaveやdelete等のメソッドも継承される。

一方で、DjangoRESTFrameworkのSerializerクラス。

Serializerクラスはモデルに書いたsaveメソッド、deleteメソッドまでは継承されない。これだけを見ると、Serializerクラスが霞んで見えるが、Serializerクラスのメリットはクライアントから送信されたリクエストを柔軟に解釈できるという点に尽きると思われる。


## FormDataオブジェクトにブーリアン型を追加して比較。

まず、




### Serializerの場合



### Formの場合




このように、FormクラスとFormDataの組み合わせであれば、ブーリアン値を正しく解釈することができない。

Ajax送信時にFormDataではなく`JSON.stringify()`で送信する場合あれば、Formクラスはjson文字列を解釈できないので、必ずバリデーションエラーになる。








## 結論

確かに、Serializerはどのような形であれ、リクエストを意図したとおりに解釈してくれ、実質Formクラスの上位互換のように思えてしまう。

しかし、モデルを継承したSerializerクラスであっても、継承をするのはモデルフィールドだけであり、モデルメソッドまでは継承してくれない。

その点を考慮した上でSerializer、Form、いずれかを選ぶのが適切と思われる。

とは言え、json文字列の解釈はPython標準モジュールのjsonを使えば実現できる。つまり、Formクラスでもjson文字列を解釈することはできるということだ。






## ソースコード




