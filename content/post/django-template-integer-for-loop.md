---
title: "【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】"
date: 2021-12-21T16:28:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

通常、DjangoTemplateLanguageのforループは数値型のループは許さない。ループが許されているのは、文字列型かリスト型、イテラブルなオブジェクトに限定される。

これを普通のPythonで表現するのであれば、こんな状態。

    for content in contents:
        print(content)

この`contents`に数値を入れることはできないのはPythonをやっていればわかる。しかし、とある方法を使えば数値のループは実現できる。


## テンプレートタグwithによる変数定義と、centerフィルタによる数値指定での空欄センタリングの組み合わせ

テンプレートタグのwithとcenterフィルタを組み合わせる。

    {% with range=''|center:10 %}
    {% for x in range %}
    <!--ここは10回ループされる-->
    {% endfor %}
    {% endwith %}


まず、テンプレートタグの`{% with %}`は`{% endwith %}`で囲んだ部分で有効な、変数を定義する事ができる。

    {% with test="ああああ" %}
    {% endwith %}

例えば上記の状態であれば`{% endwith %}`までの間に`test`という名前の変数を扱うことができる。

そして、その定義する変数の内容は、指定した数値だけ空欄を入れて文字列を中央寄せする`center`フィルタ。

    {{ "test"|center:6 }}


例えば上記の状態であれば、` test `のように6文字以下の文字列には6文字になるように両端にスペースが1つずつ取られる。これを空文字列に対して実行すると。実行結果は指定した数値だけスペースで埋められた文字列が作られる。
        
    <!-- ↓の実行結果は『      』になる。-->
    {{ ""|center:6 }}

ここで、先ほどのDjangoTemplateLanguageのルールに戻る。withで定義される変数に格納される値は、指定した数だけスペースで埋められた文字列になる。文字列であればforループは可能だ。数値で文字列を作り、その文字列をループすることで、指定した数値だけのループが可能になるという原理だ。

## 【応用】レビューの星アイコンを表示させる。

例えば、以下のようなモデルの場合。

    from django.core.validators import MinValueValidator,MaxValueValidator

    class Review(models.Model):
        #星の数値は最小で1、最大で5を指定。これ以外はバリデーションエラーになる。
        star = models.IntegerField(verbose_name="星",validators=[MinValueValidator(1),MaxValueValidator(5)])
    
この場合、記録される値は1~5。これを先ほどのやり方で表現する。

    {% for review in reviews %}
    <div class="border">
        {% with range=''|center:review.star %}
        <div>評価:{% for x in range %}★{% endfor %}</div>
        {% endwith %}
    </div>
    {% endfor %}

例えば、4が記録されていれば、4回ループされるので、下記のようにレンダリングされる。

    <div class="border">
        <div>評価:★★★★</div>
    </div>


### 【別解】モデルに`空文字列*星の値`を返すメソッドを追加

モデルを以下のようにする。


    from django.core.validators import MinValueValidator,MaxValueValidator

    class Review(models.Model):
        star = models.IntegerField(verbose_name="星",validators=[MinValueValidator(1),MaxValueValidator(5)])

        def star_range(self):
            return self.star * " "



`star_range`メソッドを実行したら、星の数とスペースを乗算した値を返却する(星の数だけスペースがある文字列)

これを以下のようにループすると良いだろう。短くまとまった。


    <div class="review_star">{% for x in review.star_range %}<i class="fas fa-star"></i>{% endfor %}</div>


ただし、このモデルメソッドの方法はaggregateなどの集計を行った場合には使用できない。aggregateで得られた星の数はビュー側で空文字列に変換するか、あるいは、先ほどのwithとcenterを使う方法が良いだろう。



## 結論

後は[Fontawesome](/post/startup-fontawesome/)等を使用したり、CSSで装飾するなどすれば通販サイトのそれに近づけることはできるだろう。


