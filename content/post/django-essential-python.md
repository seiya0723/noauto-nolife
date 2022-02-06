---
title: "Djangoをやる前に知っておきたいPython構文【オブジェクト指向と別ファイル読み込みは特に重要】"
date: 2021-12-19T17:12:22+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","django","初心者向け" ]
---

Djangoを始める前に知っておきたいPython構文をまとめる。



## 型

    #数値型
    score   = 100

    #文字列型
    name    = "Taro"

    #リスト型
    numbers = [ 46,77,22 ]

    #辞書型
    topic   = { "id":1, "comment":"Hello" }

    #辞書型のリスト
    topics  = [ { "id":1, "comment":"Hello" },
                { "id":2, "comment":"Hi" },
                { "id":3, "comment":"こんにちは" },
                { "id":4, "comment":"どうも" },
                ]


数値型は演算子(` + - * / `)のいずれかを使用して計算を行うことができる。ただし、数値型と文字列型での計算をすることはできない。

    print(score + 100) # 200

    print(score + name ) #エラー

文字列型は、別の文字列型と`+`演算子を使うことで、文字列の連結をすることができる

    print(name + "です。")  #Taroです。

リスト型は添字を指定することで値を取り出すことができる。

    print(numbers) # [ 46,77,22 ]
    print(numbers[2]) # 22

辞書型はキーを指定して、値を取り出すことができる。

    print(topic["comment"]) # Hello

辞書型のリストの場合、値を取り出すにはこうする。

    print(topics[2]["comment"]) #こんにちは

ただし、リスト型で添字を直接指定しての値の取り出しは、IndexErrorを招く結果になるので、実践では後述のfor文を使用して、1つずつ取り出す。

    print(numbers[3]) #エラー

    for number in numbers:
        print(number)

    for topic in topics:
        print(topic["id"])
        print(topic["comment"])
    
## if文

    authenticated   = True
    
    if authenticated:
        print("認証済みです")
    else:
        print("未認証です")
    
if文は条件式に指定した内容が真であれば、if文直下の内容を実行する。偽であれば実行はしない。

上記の例の場合、変数`authenticated`に`True`が代入され、ターミナル上に『認証済みです』と表示される。

### if文はDjangoではこう使う。

主に、アクセスしてきたユーザーの認証チェック、投稿されたデータのバリデーションチェック(不適切なデータかどうかをチェックすること)のために使われる。

    #認証チェック

    if request.user.is_authenticated:
        print("ここに認証済みの方向けの処理をする。")
    else:
        print("未認証の処理をする。ログインページへリダイレクト等。")


    #投稿されたデータのチェック

    if form.is_valid():
        print("バリデーションOK")
        form.save()
    else:
        print("バリデーションNG")


## for文
    
    comments    = [ "テスト",
                    "HELLO",
                    "ああああああ",
                    ]
    
    for comment in comments:
        print(comment)
    

for文は繰り返し可能なデータ型に対して、値を順次参照して処理を行うことができる。

上記例の場合、`comments`には『テスト』『HELLO』『ああああああ』の3つが入っている。for文では`comments`の中から順次ひとつ取って`comment`に代入する。

つまり、1回目のループではcommentには『テスト』が入る。2回目のループでは『HELLO』が、3回目のループで『ああああああ』が入り、それでループを終える。
    
### for文はDjangoではこう使う。

主に、モデルオブジェクトのデータをループさせたりする際に使う

例えば、家計簿アプリの帳簿モデル内には、決済時の金額が記録されている。特定の期間の収支の合計値を計算する際にはfor文を使う。

    balances    = Balance.objects.all()

    total   = 0
    for balance in balances:
        total += balance.value

    print("収支の合計値は" + str(total) + "円です。")


## def文

    def triangle(x,y):
        return x*y/2
    
    print(triangle(2,6))

def文は任意の処理をひとまとめにして再度実行することができる。上記は三角形の面積を返却している。

つまり

    triangle(2,6)

と実行すると、xに2、yに6が代入され、2*6/2で6が返却される。ただ数値が返却されるだけではターミナルには何も表示されないので、`print()`で表示させている。


### def文はDjangoではこう使う

先ほどのfor文と内容が重複するが、モデルオブジェクトを引数にして合計金額を計算する処理を関数化させる。

これにより、年ごとの合計金額、月ごとの合計金額をそれぞれ出力できるようになる。同じ処理内容を2度記述する方法と比べて、コード行数を大幅に削減できる。

    def total(balances):
        total   = 0
        for balance in balances:
            total += balance.value

        return total

    balances_of_2021    = Balance.objects.filter(pay_dt__year=2021).order_by("pay_dt)
    balances_of_2021_12 = Balance.objects.filter(pay_dt__year=2021,pay_dt__month=12).order_by("pay_dt)

    print( "2021年の収支の合計値は"     + str(total(balances_of_2021    )) + "円です。")
    print( "2021年12月の収支の合計値は" + str(total(balances_of_2021_12 )) + "円です。")


## class文

class文を使用することでオブジェクト指向プログラミングが実現できる。

構文解説の前にオブジェクト指向の概念の解説を行う。

### オブジェクト指向とは何か？


オブジェクト指向とは、スプーンの鋳造である。


スプーンの型に鉄を流し込み、スプーンを作る。この時、スプーンの型には、製造した会社の刻印があったり、スプーンとして物をすくう部分が機能したりするように考慮されている。

<div class="img-center"><img src="/images/Screenshot from 2021-12-23 15-57-14.png" alt=""></div>

ちなみにオブジェクト指向的に言うと、このスプーンの刻印は属性。すくう機能はメソッドである。

このスプーンの型だけでは物をすくったり、刻印を確認することはできない。だから鉄を流し込んで鋳造し、できあがった鉄のスプーンで刻印の確認とすくう機能を再現する。

このできあがったスプーンをオブジェクト指向ではオブジェクト、スプーンの型をクラスと言う。このオブジェクトを使ってメソッドを実行したり、属性値を参照したりする。

### なぜオブジェクト指向が必要なのか？

ではこのオブジェクト指向がなぜ必要なのかと言う問題を解説する。

先ほどのスプーンの型で、例えば、会社の刻印を変える必要があった場合、もしくはスプーンの先端部分をフォークにしたい場合、どうするべきか。答えは、もともとのスプーンの型を原本として、刻印や先端部分を変えればよい。

<div class="img-center"><img src="/images/Screenshot from 2021-12-23 16-01-32.png" alt=""></div>

このように刻印や先端部分だけ変更するアタッチメントのようなものを作れば、スプーンの型全体を書き換える必要がなくなり、変更の手間が削減される。

これをオブジェクト指向的に言うと、継承とオーバーライドである。元のスプーンの型を継承し、先端と刻印部分をオーバーライド(上書き)することで1から作り直す手間なく別製品を製造することができるようになるのだ。

ちなみに、元のスプーンの型のことを親クラス、親クラスを継承したスプーンの型を子クラスと呼ぶ。

### class文の構文

実際にclass文を作り、オブジェクト指向を実装する。


    class BaseView:
    
        explain = "class文ではこのように内部に変数を定義する事ができます。このclass内の変数を属性と言います。"
    
        def say(self):
            print("関数も定義することができます。このclass内の関数をメソッドと言います。")
            print("メソッドはクラス内の他の属性値をself引数を使って参照することができます。(※ メソッドはselfを第一引数に入れておかなければ必ずエラーになります。)")
            print(self.explain)
    
    
    class CustomView(BaseView):
    
        explain = "このCustomViewはBaseViewを継承して作られました。継承対象のBaseView内にある全ての属性、メソッドはオーバーライド(上書き可能です)"

        def say(self,message):
            print("メソッドもオーバーライドできます。")
            print("受け取った引数をメソッドで扱えます。")
            print(message)
    

    #クラスからオブジェクトを作る
    base = BaseView()
    
    #属性値の参照
    print(base.explain)
    
    #メソッドの実行
    base.say()
    
    
    print("==================")
    
    
    #クラスからオブジェクトを作る
    custom  = CustomView()
    
    #属性値の参照
    print(custom.explain)
    
    #メソッドの実行(引数を入れる)
    custom.say("こんにちは")


親クラスとなる`BaseView`、`BaseView`を継承した子クラスの`CustomView`の2つのクラスがある。それぞれ属性値とメソッドを実行する事ができる。

親クラスの内容を子クラスは引き継ぐが、子クラスでは親クラスから継承した属性やメソッドをオーバーライドする事ができる。
    
### class文はDjangoではこう使う


    from django.db import models
    
    class Topic(models.Model):
        comment     = models.CharField(verbose_name="コメント",max_length=2000)


DjangoではDBの構造を定義するモデルクラス、値の検証を行うフォームクラスなどに利用されている。

上記はユーザーから投稿されたコメントを格納するTopicモデルクラスを作っている。これをマイグレーションすることで、DBにテーブルが出来上がる。

## import文

### 標準モジュールをimportする

import文は別のPythonファイル、Pythonモジュール(ライブラリ)を読み込みする事ができる。

例えば、Python標準モジュールであるdatetimeを使うことで現在の日時を表現する事ができる。

    import datetime

    print(datetime.datetime.now())

### サードパーティ製モジュールをimportする

他にも予めpipコマンドを実行しておけば、サードパーティー製のモジュール(ライブラリ)を使うことができる。

下記コマンドを実行すると指定したサーバーにHTTPリクエストを送信する`requests`をインストールできる。

    pip install requests

この状態でPythonファイルに下記のようにimport文を使って`requests`を使う。

    import requests

    result  = requests.get("https://noauto-nolife.com/")
    print(result.content)

これで`https://noauto-nolife.com/`にアクセスした結果が表示される。

### import文はDjangoではこう使う

Djangoは複数のPythonファイルを束ねたウェブアプリケーションフレームワークである。

だからこそ、ライブラリのimportだけでなく、別のPythonファイルの読み込みが頻繁に行われる。

    from django.shortcuts import render,redirect
    
    from django.views import View

    #models.pyからTopicモデルクラスをimport
    from .models import Topic
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            #importしたモデルクラスを使って全データの読み込み処理
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
    index   = BbsView.as_view()


上記のコードは同一ディレクトリにある`models.py`を読み込み、DBへ全データの読み込み処理を行っている。

## 結論


参照元:https://github.com/seiya0723/django-essential-knowledge

