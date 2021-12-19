---
title: "Djangoをやる前に知っておきたいPython構文"
date: 2021-12-19T17:12:22+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","django","初心者向け" ]
---


Djangoを始める前に知っておきたいPython構文をまとめる。

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

近日公開

## class文

近日公開


## import

近日公開


## 結論


参照元:https://github.com/seiya0723/django-essential-knowledge

