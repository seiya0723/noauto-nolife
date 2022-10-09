---
title: "Djangoで数値型もしくはUUID型等のフィールドに、クライアント側から未入力を許可するにはnull=Trueとblank=Trueのオプションを"
date: 2021-08-07T10:53:38+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","アンチパターン" ]
---


タイトルの通り。

基本的な話として、blankとは空文字列のこと。だから文字列型扱いになる。一方でnullはPythonで言うとNoneであり、型は無い。

よって`blank=True`のフィールドオプションが許されるのは、`CharField`等の文字列型系のフィールドのみで、`IntegerField`や`UUIDField`には許されない。

と思われがちだが、それは半分誤解である。実は下記の指定は正しい。

    dt          = models.DateTimeField(verbose_name="日時",null=True,blank=True)

このモデルフィールドは、未入力が許可される。その仕組みについて解説する。



## null=Trueとblank=Trueの組み合わせと結果


|フィールド       |null=Trueだけ                                          |blank=Trueだけ                 |null=Trueとblank=True          |未指定|
|----|----|----|----|----|
|CharField        |クライアントのフォーム未入力不可(バリデーション必ずNG) |未入力可(空文字列として扱う)   |未入力の場合、null(None)扱い   |入力必須|
|IntegerField     |クライアントのフォーム未入力不可(バリデーション必ずNG) |マイグレーションすらできない   |未入力の場合、null(None)扱い   |入力必須|
|UUIDField        |クライアントのフォーム未入力不可(バリデーション必ずNG) |マイグレーションすらできない   |未入力の場合、null(None)扱い   |入力必須|
|DateTimeField    |クライアントのフォーム未入力不可(バリデーション必ずNG) |マイグレーションすらできない   |未入力の場合、null(None)扱い   |入力必須|
|ManyToManyField  |効果なし                                               |未入力可                       |null=Trueは効果なしなので警告  |入力必須|


### null=Trueだけ

クライアントからのフォーム未入力は空文字として扱われる。故に、`null=True`だけとなるとクライアントのフォームの未入力は許可されない。

フォーム未入力不可なのは管理サイトでも同様ではあるが、サーバーサイドで直接コードからnullを指定して挿入することはできる。

しかし用途が限られるため、未入力を許可したいのであれば、後述の`null=True`と`blank=True`を組み合わせるやり方が妥当である。入力必須にしたいだけであれば未指定でOK。


### blank=Trueだけ

繰り返しになるがblankとは空の文字列のことである。

`CharField`に`blank=True`を指定すると空文字列として扱われる。

故に`CharField`等の文字列型系のフィールドであれば問題はないが、`IntegerField`や`UUIDField`等の空文字列の入力を許さないフィールドでは`blank=True`だけの指定はマイグレーションエラーになる。


### null=Trueとblank=True

空文字列が許可されないフィールド(IntegerField、DateTimeFieldなど)でもフォームの未入力が許可される。ただし、その場合そのままテンプレートに表示すると、『None』と表示される

もし、Noneの表示ではなく、別の表記にしたい場合は、テンプレートのdefaultフィルタを使用する。

    {{ topic.dt|default:"時刻未指定" }}


注意したい点は、CharFieldの場合、`null=True`と`blank=True`を組み合わせると、Noneとして扱われる点にある。モデルのフィールドオプションで`default=""`と指定してもNoneとして扱われる。

そのため、CharFieldで未入力時のNoneと表示される問題は`null=True`の指定をしないようにするか、あるいはdefaultフィルタで対処する。


いずれにしても、`null=True`と`blank=True`の組み合わせで、DateTimeFieldやIntegerFieldにて、クライアント側から未入力ができるという余地が生まれる。selectタグでもvalue属性値を空文字列を選ぶことができる。

    <select name="category">
        <option value="">未分類</option>
        {% for category in categories %}
        <option value="{{ category.id }}">{{ category.name }}</option>
        {% endfor %}
    </select>

この選択を許可するメリットは、未分類などのカテゴリを前もって作っておき、[loaddataコマンド](/post/django-loaddata/)を使ってDBへリストアしなくてもよいことにある。

### 未指定

入力必須になる。Charfieldの場合も未入力は許可されない。当然サーバーサイドのコードからも入力は必須になるため、`null=True`だけの場合と違ってどのような場合でも値が入る。


## 【例外】ManyToManyFieldはnullは意味なし

`ManyToManyField`の場合に限って`null=True`の指定は効果がない。

もし、未入力化としたい場合は、`blank=True`のみとする。

これは`ManyToManyField`の仕様を考えるとわかる。

- [【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】](/post/django-m2m-through/)
- [【Django】カスタムユーザーモデルでユーザーブロック機能を実装させる【ManyToManyFieldでユーザーモデル自身を指定】](/post/django-m2m-usermodel/)
- [Djangoで多対多のリレーションの構造と作り方、テンプレートで表示する方法【ManyToManyField】](/post/django-many-to-many/)
- [【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】](/post/django-m2m-search-and-add/)



## 結論

`Foreignkey`で繋がっている主キーがUUID型、もしくは数値型の場合にも同様に`blank=True`と`null=True`を合わせて指定する。

こうすることで、カテゴリの指定をせず、Null(Python上のNone)として扱うことができる。後はテンプレート側から、defaultフィルタを使うと良いだろう。


