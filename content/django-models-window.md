---
title: "【Django】Windowを使ってレコードの累計値を計算して出力【売上の累計表示、小計(累積)表示などに有効】"
date: 2021-09-01T18:23:58+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","データベース","モデル","上級者向け" ]
---

日付でソートして売上を表示するとして、その日付になるまでの累計(累積)売上金額を表示したいとする。

そういう時は`Window`を使えば、累計(累積)値を表示させることができる。

## ソースコード

[前回の月ごとに売上を表示するコード](/post/django-models-trunc/)から流用。ビューとテンプレートの処理だけ書き換える。


    from django.db.models import Sum,Window,F

    menus   = Menu.objects.annotate(accumulate=Window(Sum("amount"), order_by=[ F("date").desc(),F("id").asc() ] ) ).values("id","name","date","amount","accumulate").order_by("-date","id")
        

累積計算時(Windowの中)の`order_by`と`values`を実行した後の`order_by`は揃えなければならない点に注意。`Window`の中の`order_by`は若干仕様が変わっている。複数のフィールドを指定したい場合は上記のようにリスト型で書く。

今回はdateは`DateField`を使用しており、同日に複数のレコードが存在する可能性があるため、idでもソーティングを行った。これにより、同日のレコードをまとめて加算されてしまう問題がなくなる。

## 動かすとこうなる

まず、先ほどのクエリを実行したときの処理結果。綺麗に累積計算できている。

<div class="img-center"><img src="/images/Screenshot from 2021-09-02 15-55-50.png" alt="累積計算"></div>

続いて、`order_by`に`date`しか指定していないパターン。同日のデータがまとめて累積に加算され、若干おかしなことになっている。

    menus   = Menu.objects.annotate(accumulate=Window(Sum("amount"), order_by=F("date").desc()) ).values("id","name","date","amount","accumulate").order_by("-date")

<div class="img-center"><img src="/images/Screenshot from 2021-09-02 15-37-44.png" alt="同日をまとめられた"></div>



## 【注意】SQLite3のバージョンによってはこのWindow関数は機能しない


下記のStackoverflowによると、DjangoのWindow関数が動作しない問題はSQLiteのバージョン問題であるそうだ。

https://stackoverflow.com/questions/57650437/how-to-make-work-django-window-expression-with-sqlite

一番簡単な方法はWindowsの場合Anacondaをインストールする方法であるが、私の環境(Ubuntu 18.04)ではSqlite3がOSに直にインストールされているため、コードからDLしてmakeする。

参照元:https://stackoverflow.com/questions/64861331/how-can-i-install-or-upgrade-to-sqlite-3-33-0-on-ubuntu-18-04

    wget https://sqlite.org/2021/sqlite-autoconf-3340100.tar.gz
    tar -xvf sqlite-autoconf-3340100.tar.gz && cd sqlite-autoconf-3340100
    ./configure
    make
    sudo make install
    export PATH="/usr/local/lib:$PATH"
    sqlite3 --version

SQLiteを使わず、PostgreSQLを使うことで対処することもできる。


## 結論

Window関数は`order_by`を合わせないといけない点と、環境によっては動作すらしない点で、やや扱いが難しい。おまけに`values`を使っているため、辞書型になってしまう。テンプレート側から外部キーの参照は難しくなる。

とは言え、累積、累計の表示はよくあるものだから、使えなければ苦しい。

ゴリ押しで、埋め込み型のカスタムテンプレートタグを使う方法や、forループ使って1レコードずつ代入加算する方法でも実現できるが、そうするとビューやテンプレートの負担が増える。

これだけでビューの負担が軽減できるのであれば、実装したほうが良いだろう。

https://docs.djangoproject.com/en/3.2/ref/models/expressions/#window-functions

https://stackoverflow.com/questions/43517901/cumulative-running-sum-with-django-orm-and-postgresql
