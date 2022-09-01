---
title: "DjangoやPythonにおける*argsと**kwargsとは何か"
date: 2021-01-26T17:07:45+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け","Python" ]
---

結論から言うと、`*args`はキーワード未指定の引数のリスト、`**kwargs`はキーワードが指定された引数の辞書を手に入れるためのものである。


## *argsはキーワード未指定の引数のリスト

まずは、下記コードを参考にしたい。

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import sys 
    
    def main(name,*args):
    
        print(name)
        print(args)
    
    
    if __name__ == "__main__":
        try:
            main("Tom","Mike","Bob")
    
        except KeyboardInterrupt:
            print("\nprogram was ended.\n")
            sys.exit()
    
`main()`関数に3つの文字列の引数を与えている。`"Tom","Mike","Bob"`の文字列引数が与えられているが、関数が受け取れるのは`name`と`*args`の2つのみ。`"Bob"`が受け取れないからエラーになると思われるが、実際に上記のコードを実行してみると、こうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 13-51-30.png" alt="全ての引数を処理できる"></div>

`print(args)`を実行した時、リスト型の`('Mike', 'Bob')`が表示されるのがわかる。これがキーワード未指定の引数のリストを返す、`*args`である。

## **kwargsはキーワードが指定された引数の辞書

では、関数を呼び出す時に、引数にキーワードを指定するとどうなるだろうか？

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import sys 
    
    
    def main(name,*args):
    
        print(name)
        print(args)
    
    
    if __name__ == "__main__":
        try:
            main(name="Tom",name1="Mike",name2="Bob")
    
        except KeyboardInterrupt:
            print("\nprogram was ended.\n")
            sys.exit()


`main()`関数で`name`が定義されているので`"Tom"`は読み込めるが、`name1`と`name2`は読み込めないのでエラーになってしまう。ここでキーワード引数の辞書を返す`**kwargs`の出番である。下記コードを見てもらいたい。

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import sys 
    
    def main(name,*args,**kwargs):
    
        print(name)
        print(args)
        print(kwargs)
    
    
    if __name__ == "__main__":
        try:
            main(name="Tom",name1="Mike",name2="Bob")
    
        except KeyboardInterrupt:
            print("\nprogram was ended.\n")
            sys.exit()


上記コードを実行すると、下記のようになる。

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 13-57-39.png" alt="キーワード引数の辞書を返してくれる"></div>

つまり、キーワード引数(`name="Tom"`のような形)を受け取って辞書型にするのが`**kwargs`で、キーワードなしの引数(`"Tom"`のような形)を受け取ってリスト型にするのが`*args`である。

先のコードではキーワード引数のみなので、キーワード指定なしの引数を`main()`内に指定してあげると、`print(args)`で表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 14-12-43.png" alt="argsとkwargsが表示されている。"></div>


## 結論

様式美として、大多数のコードでは`*args`と`**kwargs`と名付けているが、別に`*lists`とか`*args_list`でも問題はない。

重要なのはアスタリスク(`*`)を変数名の前に1つでキーワード未指定の引数のリストを、2つでキーワードが指定された引数の辞書を返す仕組みになっている。

では、なぜDjangoの`views.py`のクラスで`*args`と`**kwargs`がそれぞれメソッドの引数に指定されているかと言うと、URLconf(`urls.py`)から引数を指定して`views.py`のメソッドを呼び出すとき、エラーが発生しないようにするためにある。`*args`と`**kwargs`が無い場合、与える引数を過不足無く、かつ指定したキーワードに即して与えなければならない状況に至るからである。

