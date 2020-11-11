---
title: "Djangoのマイグレーションのエラー時の対処法"
date: 2020-11-05T08:46:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "django","postgresql","sqlite","初心者向け" ]
---


Djangoで開発を進めている時、マイグレーションのエラーにぶち当たるときがあるが、大抵は`migrations`ディレクトリを編集していけばいいだけなので、それほど難しいものではない。

本記事では`migrations`ディレクトリ内のファイル編集を行うことで、マイグレーションのエラー時の対処法をまとめる。


## サンプルコード

まず、マイグレーションエラーの再現をするために、サンプルのコードを下記に公開した。プロジェクト内のディレクトリ構造は『現場で使えるDjangoの教科書』に準拠している。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 10-12-42.png" alt="サンプルコードを表示した状態"></div>

サンプルコードDLは以下から

https://github.com/seiya0723/mig-error


### models.pyについての解説

モデルはこうなっている。オーソドックスな1対多の外部キーを使用した。見る人が見ればこのコードが間違っているように見えるが、それは後の項目にて解説する。

    from django.db import models
    
    # Create your models here.
    
    class Category(models.Model):
        class Meta:
            db_table    = "category"
    
        name        = models.CharField(verbose_name="カテゴリ名",max_length=10)
    
        def __str__(self):
            return self.name
    
    class Menu(models.Model):
        class Meta:
            db_table    = "menu"
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ名",on_delete=models.PROTECT)
        name        = models.CharField(verbose_name="品名",max_length=20)
        breakfast   = models.BooleanField(verbose_name="朝メニュー",default=True)
        lunch       = models.BooleanField(verbose_name="昼メニュー",default=True)
        dinner      = models.BooleanField(verbose_name="夜メニュー",default=True)
        takeout     = models.BooleanField(verbose_name="テイクアウト",default=True)
        price       = models.IntegerField(verbose_name="価格")
    
        def __str__(self):
            return self.name


少なくとも、SQLiteでは動く。問題なく動く。



## フィールドを削除した後のマイグレーションで発生するエラーの解決

ネットの質問サイトに掲載されているマイグレーション関係のエラーはおそらくこれが原因ではないだろうか。再現性のないエラーなのでうまく説明できないが。

一度、`models`.pyにフィールドを定義して、`makemigrations`コマンドを実行、マイグレーションファイルを作る。その後、そのフィールドを削除して`makemigrations`の後、`migrate`コマンドを実行すると、エラーが出る

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 10-47-24.png" alt="フィールド削除が反映されていない"></div>

なぜ、こんなことになるのかと言うと、マイグレーションファイルを作る時、`manage.py`がフィールドを削除したことに気づいていないから。複雑なmodels.pyの編集をしていると稀にこういうことがある。

マイグレーションファイルというものは、DBにmodels.pyの遷移を伝えるもの。だから、`makemigrations`を実行するたびに追加追加で作られていく。migrationsディレクトリ内に000から始まるpythonファイルが作られているが、それが全てマイグレーションファイル。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 10-39-17.png" alt="マイグレーションファイル一覧"></div>


### 解決策

解決策は2つある。

マイグレーションファイルにmodels.pyの変更が書かれていないのであれば、マイグレーションファイルを自分で修正すれば良いだけのこと。

もしくは、マイグレーションファイルを一旦全て削除して、もう一度`makemigrations`コマンドを打つことでファイルを初期化させる。

今回はより簡単な後者(マイグレーションファイル削除)の方法を使う。以下手順。


1. マイグレーションファイルの削除
1. DBのダンプと削除
1. マイグレーションコマンド実行
1. リストア


まず削除。先の画像であれば、`0001_initial.py`から`0003_menu_takeout.py`までを削除する。

続いて、DBのダンプと削除。以下コマンドでダンプする。`fixture`ディレクトリは予め作っておく。

    python3 manage.py dumpdata [アプリ名] > [アプリ名]/fixture/data.json

該当のテーブルを削除する。SQLiteであれば、他に残しておきたいデータがなければ、そのままゴミ箱にポイでもいい。


この状態でマイグレーションを実行

    python3 manage.py makemigrations
    python3 manage.py migrate

続いて、先程ダンプしたデータをリストアさせる。以下コマンドを実行。models.pyが変わっているので適宜jsonファイルの編集が必要。

    python3 manage.py loaddata [アプリ名]/fixture/data.json

これで解決。


## 外部キーに文字列型を指定していないことによるエラーの解決

このエラーはPostgreSQLとか型の定義をきちんとするデータベースを使用する環境で発生する。

本来、外部キーに対応した主キー(今回の件で言えば、categoryテーブルのid)は文字列型でなければならない。

Djangoでは主キーを明示的に指定されない限り、数値型でオートインクリメントの主キーが自動的に作られるようになっている。その数値型の主キーを外部キーとして指定した場合、文字列型でなければならないのでエラーが出るのだ。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 11-04-58.png" alt=""></div>

ちなみに、型の定義をきちんとしていないSQLiteではこのエラーは起きない。だから先のサンプルコードを開発サーバーで起動した時には正常に動く。

この問題を知らなければ、いざデプロイしようとしたらエラーが出て、リリースが遅れるなんてことが起こるだろう。

型の定義をきちんとしていないSQLiteを開発で扱い、なおかつ明示的に指定していないと数値型で定義してしまうDjangoの仕様によって発生するよくある問題だ。

さらに余談だが、SQLiteはmodels.pyで定義した`max_length`にも対応していない。`max_length`を超過したINSERTクエリを実行してみればわかる。開発中は実質`forms.py`のみで`max_length`を超過しないようにしているようなもの。`forms.py`も使わなければ、簡単に`max_length`を超過して保存してしまう。

### 解決策

以下手順。

1. DBのデータをダンプ
1. models.pyを修正
1. マイグレーションファイルを全て削除
1. DBのテーブルを削除
1. マイグレーション実行
1. DBのデータをリストア


先のコードであれば主キーを明示的に指定し、なおかつ文字列型として指定する。

その前にサンプルコードには既にデータが含まれているので、下記のコマンドでDBのデータをダンプさせる。先の項目と同様に`fixture`ディレクトリは作っておく

    python3 manage.py dumpdata [アプリ名] > [アプリ名]/fixture/data.json

models.pyを書き換える。Categoryクラスに新たにidの文字列型フィールドを作れば良い。

    from django.db import models
    
    # Create your models here.
    
    class Category(models.Model):
        class Meta:
            db_table    = "category"
    
        id          = models.CharField(verbose_name="ID",max_length=10)
        name        = models.CharField(verbose_name="カテゴリ名",max_length=10)
    
        def __str__(self):
            return self.name
    
    class Menu(models.Model):
        class Meta:
            db_table    = "menu"
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ名",on_delete=models.PROTECT)
        name        = models.CharField(verbose_name="品名",max_length=20)
        breakfast   = models.BooleanField(verbose_name="朝メニュー",default=True)
        lunch       = models.BooleanField(verbose_name="昼メニュー",default=True)
        dinner      = models.BooleanField(verbose_name="夜メニュー",default=True)
        takeout     = models.BooleanField(verbose_name="テイクアウト",default=True)
        price       = models.IntegerField(verbose_name="価格")
    
        def __str__(self):
            return self.name
    
続いて、マイグレーションファイルを削除し、DBにアクセスして該当テーブルを削除する。その上でマイグレーションコマンドを再度実行

    python3 manage.py makemigrations
    python3 manage.py migrate


ダンプしたデータであるjsonファイルを修正する。概ね下記のようになっていればよい。pkをダブルクオーテーションで囲い、なおかつfieldsにidを追加する。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 11-48-29.png" alt="jsonファイルの修正"></div>

その上で、データをリストア(loaddataコマンド)を実行する。

    python3 manage.py loadadata [アプリ名]/fixture/data.json


これで全て解決。


## 結論

マイグレーション関係のエラーは各アプリのディレクトリ内にある、`migrations`を修正すれば大抵解決する。

今回は既存データを維持しつつ問題解決するため、外部キーから呼び出される主キーは文字列型(CharField)を指定したが、[UUIDField]( https://docs.djangoproject.com/en/3.1/ref/models/fields/#uuidfield )でも問題はない。



