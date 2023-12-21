---
title: "【Django】モデルクラスのfilterメソッドで検索・絞り込みをする"
date: 2022-05-16T10:19:44+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---

モデルクラスを使用してデータをDBから取り出す時、filterメソッドを使用することで、取り出しの条件を指定することができる。

## 完全一致の場合(=)

`=`を使用することで完全一致のデータを取り出すことができる。

    topics  = Topic.objects.filter(id=3)


主キーに対して、`=`を実行した時、取り出されるデータは1個もしくは0個になる。

そのため、上記のやり方だとforループしなければ、データを取り出すことができない
    
    for topic in topics:
        print(topic)



そこで、単一のモデルオブジェクトを返却するよう、.first()を実行して取り出すことが多いだろう。

    topic   = Topic.objects.filter(id=3).first()
    print(topic)


実践では、主キーの指定の他に、ブーリアン型フィールドの指定にも使うことがある。

    Topic.objects.filter(approval=True)


上記はapproval(投稿の承認用のフィールド)がTrue(承認済み)であるものだけ取り出す。


## 以上・以下、より上・より下の場合(`__lte`,`__gte`,`__lt`,`__gt`)

この数値の範囲を指定する条件は、通販サイトなどでよく使うことが多い。

300円以上の商品を取り出したい場合、下記のようになるだろう。

    products    = Product.objects.filter(price__gte=300)

このように、フィールドに`__`とすることで詳細な条件を指定する事ができる。今回指定したgteとは、(Greater Than or Equal)を意味する。

逆に1000円以下の商品を取り出したい場合は下記のようになる。

    products    = Product.objects.filter(price__lte=1000)

このlteは( Less Than or Equal )を意味する。

実践では、300円以上かつ1000円以下と言う指定をすることがあるだろう。こういう時は、下記のように(,)で区切る。

    products    = Product.objects.filter(price__gte=300,price__lte=1000)

300円より高く、なおかつ1000円未満という指定をしたい場合、こうなる。

    products    = Product.objects.filter(price__gt=300,price__lt=1000)


ちなみに、この以上・以下、より上・より下といった検索は、数値型フィールドだけでなく、日付型・日時型フィールドに対しても有効である。

そのため、今日から一週間前のデータを取り出したり、3日前から5日先のデータを取り出したりすることも可能。

例えば、実践では予約システムのサイトを作り、今後一週間の予定をまとめて表示させたいときなどに使う。


## 指定されたリストから一致するものを含む場合(`__in`)

複数の選択から一致する物を取り出したい場合、`__in`を使う。

    topics  = Topic.objects.filter(id__in=[1,2,3,4,5])

これは実践では、複数選択削除などに使われる事があるだろう。削除は取り出したモデルオブジェクトに対して、`.delete()`を実行することで対応できる。(単数でも複数でも可)

    topics.delete()


## 〇〇を含む場合(`__icontains`,`__contains`)

特定の文字列を含む物を取り出したい場合、`__icontains`もしくは`__contains`を使う。

`__icontains`は大文字と小文字を区別せず、`__contains`は大文字と小文字を区別する。

    topics  = Topic.objects.filter(comment__icontains="django") #Djangoはヒットする
    topics  = Topic.objects.filter(comment__contains="django") #Djangoはヒットしない



## 結論

filterメソッドを使用することで、DBからのデータ取り込み時に条件を指定することができる。

これは検索や絞り込みの機能を扱う、ほぼすべてのウェブアプリに対して有効な知識である。


### 【補足】一般的な検索サイトのようにスペース区切りで検索をするには？

先の『〇〇を含む場合』の内容では、一般的な検索サイトのようにスペース区切りを使用した検索にはならない。

そこで、Djangoではクエリビルダを使用する方法がある。

詳細は下記を確認。

[Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】](/post/django-or-and-search/)


