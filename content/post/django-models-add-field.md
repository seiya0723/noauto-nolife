---
title: "【Django】models.pyにフィールドを追加・削除する【マイグレーションできないときの原因と対策も】"
date: 2021-10-05T06:45:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

models.pyを操作していく上で難しいのが、フィールドの追加とマイグレーション。

特に、追加するフィールドによっては[マイグレーションファイル作成時に警告が出る](/post/django-non-nullable/)ことがある。

本記事では警告が出る理由も含め、フィールドの追加方法も含めて解説する。ソースコードは[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)を元にする。

## デフォルト値ありのフィールドを追加する【警告なし】

まず、安全なデフォルト値ありのフィールドを追加する。簡易掲示板であれば、投稿日時も含めたいので、`DateTimeField()`を追加した。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment


通常、この投稿日時は、投稿された瞬間の日時を記録する。ユーザーが自由に日時を変更できるようにするならまだしも、投稿された瞬間の日時を記録するのであれば、フィールドオプションの`default`を使用する。

この`default`の値にはタイムゾーンを考慮した現在の時間、即ち、`timezone.now`を指定する。このtimezoneは予め冒頭でimportしなければならない点に注意する。

これでコメント投稿時に自動的に投稿日時がセットされる。

この状態でマイグレーションを実行する。

    python3 manage.py makemigrations
    python3 manage.py migrate

これでdtフィールドの追加が実現された。

後は、テンプレートに`{{ topic.dt }}`を追加する。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.dt }}</div>
                <div>{{ topic.comment }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

これで日時が表示されるようになる。ちなみに、dtフィールドを追加する前の投稿の日時はどうなるかと言うと、マイグレーションした瞬間の日時が付与される。

フィールドが追加された後は、投稿された瞬間の日時が随時追加されていく。

<div class="img-center"><img src="/images/Screenshot from 2021-10-04 16-39-51.png" alt="日付が追加された"></div>

ちなみに、ビューのpostメソッドでコメントの保存を行うが、その時に日付を操作する必要はない。`default`があるから。

### 【補足1】投稿日時のフィールドはいつ追加するべきか？

上記のように投稿日時のフィールドを追加した時、マイグレーションした時刻が自動的に入力される。

そのため、後から追加された投稿日時のデータは使い物にならない。そのため、最初から投稿日時のフィールドを追加しておいたほうが良いだろう。

### 【補足2】編集できない日付を自動的に入力するには？

`auto_now_add=True`もしくは`auto_now=True`のフィールドオプションを入れる。これで投稿編集されたときの時刻が自動的に記録され、編集ができないため、改ざんされるリスクが無くなる。

日時の真正性を担保したい場合、こちらを利用したほうが良いだろう。下記記事で解説されている。

[【Django】DateTimeFieldに自動的に現在時刻を入れるには、auto_now_addもしくはauto_nowフィールドオプションを指定【新規作成時・編集時の時刻】【※編集不可】](/post/django-models-datetime-auto-now-add/)


## デフォルト値なしのフィールドを追加する【警告あり】

続いて、デフォルト値がないフィールドを追加する。これが少々難しい。

簡易掲示板に名前の入力欄が必要になり、nameという名前の`CharField()`を`models.py`に追加する。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        name    = models.CharField(verbose_name="投稿者の名前",max_length=100)
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment

commentと同様に`verbose_name`と`max_length`を指定。ただし、ここではあえて`default`を指定しない。

この状態でマイグレーションファイルを作る。

    python3 manage.py makemigrations

すると、下記のような警告が出る。

    You are trying to add a non-nullable field 'name' to topic without a default; we can't do that (the database needs something to populate existing rows).
    Please select a fix:
     1) Provide a one-off default now (will be set on all existing rows with a null value for this column)
     2) Quit, and let me add a default in models.py
    Select an option: 

要するに、Topicモデルに、NULL禁止のnameフィールドを追加する場合、既存のレコードの処遇をどうするか聞いている。

[こちらの記事](/post/django-non-nullable/)でも取り扱ったが、特段の指定がない場合、基本的にフィールドのデータは入力必須(null禁止、blank禁止)である。にもかかわらず、新しくフィールドを追加した時、既存のフィールドの値がどうしてもnullになってしまう。

一言で言うと、nullは値がない状態、blankは空の文字列(`""`)。

この状況で与えられた選択肢は2つ。

- 1) 1度限りのデフォルト値を入れる
- 2) 一旦`makemigrations`を中止して、models.pyに追加したフィールドにdefault属性を指定する

1か2を入力してEnterを押す。

### 一時的に値を入れ、以降は入力必須にしたい場合は1を選ぶ

1の場合、Pythonのインタラクティブシェルになるので、任意の値を指定する

まず、1を押してEnter、インタラクティブシェルになる。今回はCharFieldなので、ダブルクオーテーションで囲って文字列型のデータを入れると良い。

<div class="img-center"><img src="/images/Screenshot from 2022-03-26 14-29-02.png" alt=""></div>

画像のようにすることで、一時的に空欄のnameに関しては『匿名』という文字列が入る。

### 永続的にデフォルト値を入れたい場合は2を選ぶ

2の場合、追加したnameにフィールドオプションとしてdefaultを指定する。今回は2を指定してmodels.pyを編集する。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        name    = models.CharField(verbose_name="投稿者の名前",max_length=100,default="匿名")
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment

この`default`を指定することで`makemigrations`が可能になる。1を選んだときと同様に、既存のレコードは全て匿名として扱われる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-05 07-09-22.png" alt=""></div>

ただ、この場合、管理サイトで新規作成を行う時、最初から匿名と書かれるようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-03-26 14-38-37.png" alt=""></div>


## フィールドを削除する

フィールドを削除する時は、モデルフィールドを削除して、マイグレーションをするだけ。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        #name    = models.CharField(verbose_name="投稿者の名前",max_length=100,default="匿名")
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment

nameを削除する。その後マイグレーション。

    python3 manage.py makemigrations
    python3 manage.py migrate

もし、[モデルを継承したフォームクラス](/post/django-forms-validate/)をビューでバリデーションとして使っている場合、フォームクラスの`fields`も削除しておく事をお忘れなく。

ただ、フィールドを削除して、マイグレーションを実行した後、再度同じ名前のフィールドを追加してマイグレーションしても、データは復活しない。空の状態からスタートする。

もし、削除対象のフィールドのデータを残しておきたい場合、[DBのデータをバックアップ](/post/django-dumpdata/)、[リストア](/post/django-loaddata/)する方法があるので、そちらを使うと良いだろう。

## マイグレーションできない状態に陥った時は

最後にマイグレーションできない状態になった時、その原因と対策を記す

### マイグレーションできない原因

変にモデルをいじっているとマイグレーションできない事態が起こり得る。マイグレーションできない原因として主に考えられるのが、下記2つ

- マイグレーションファイルの内容とDBのテーブル構造が食い違っている
- フィールドが文字列型ではないのに、blank=Trueやdefault=""をフィールドオプションに指定している

### 【対策1】マイグレーションファイルを不用意に編集したり、DBにSQLを直接実行してテーブルを削除したりしない

対策と言うより、予防である。

`migrate`を実行した後に、マイグレーションファイルを不用意に編集をしてしまうと、DBの構造とマイグレーションファイルの辻褄が合わなくなってしまう。

マイグレーションファイル編集直後は問題ないが、次に`migrate`を実行する時、マイグレーションファイルとDBの構造が一致していないため、必ずマイグレーションエラーを引き起こしてしまう。

同様の理由で、DBにアクセスしてSQLを実行して、`DROP TABLE`等を実行しようものなら、これもマイグレーションファイルとDBの構造が食い違うため、マイグレーションエラーになってしまう。

そのため、Djangoを開発していく上ではマイグレーションファイルを不用意に編集したり、DBに直接アクセスしてテーブルを削除するSQL等を実行してはならない。もしやってしまった場合は、手動でどうにかするか、後述の【対策3】を実施するしか術は無い。

### 【対策2】フィールドの型に適したフィールドオプションを指定する

文字列型ではないにもかかわらず、`default=""`等のフィールドオプションを指定してしまうと、必ずマイグレーションエラーを起こす。

そのため、`DateTimeField`であれば日付型を、`IntegerField`であれば数値型を`default`として割り当てる。

`blank=True`に関しては少々厄介で、厳密には、`CharField`以外のフィールドに対して`blank=True`を指定する時は、セットで`null=True`を指定する。詳細は『[Djangoで数値型もしくはUUID型等のフィールドに、クライアント側から未入力を許可するにはnull=Trueとblank=Trueのオプションを](/post/django-models-uuid-int-null/)』を参照。

### 【対策3】マイグレーションファイルとDBを全て初期化する

※この方法は開発段階の時だけにして、本番運用後には本当の最終手段として考えたほうが良い。

マイグレーションファイル全てとDBのファイルを削除して最初からやり直す。

各アプリディレクトリ内にある、全ての`migrations`ディレクトリを削除した後、プロジェクトディレクトリ直下にある`db.sqlite3`を削除する。

これでプロジェクトを新規作成した状態まで戻る。後は各アプリのモデルを書き直してマイグレーションのコマンドを実行する。

    python3 manage.py makemigrations bbs
    python3 manage.py migrate
    
手動で`migrations`ディレクトリを削除した時、`makemigrations`コマンドを実行する時は、アプリ名を明示的に指定しなければ、マイグレーションファイルを作ってくれない点に注意する。

つまり、`bbs`アプリの`migrations`ディレクトリを削除した場合、上記のように`python3 manage.py makemigrations bbs`とする。

## 結論

モデルフィールドの追加と削除はルールをしっかり守れば実現できるものの、これからDjangoを扱う方にはやや難しい。

本件の他に、クライアントからデータを受け取る場合、テンプレートの編集と[forms.pyでバリデーションをする](/post/django-forms-validate/)フィールドの編集も同時に行う必要があるだろう。

また、nullとblankのフィールドオプションに関しても知っておいたほうが良い。これでフィールドの追加に迷わなくなる。

[Djangoで数値型もしくはUUID型等のフィールドに、クライアント側から未入力を許可するにはnull=Trueとblank=Trueのオプションを](/post/django-models-uuid-int-null/)


