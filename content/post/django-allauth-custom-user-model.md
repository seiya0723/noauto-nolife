---
title: "Djangoにカスタムユーザーモデルを実装させる【AbstractUserとallauth】"
date: 2020-12-14T16:28:15+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","allauth","認証" ]
---


Djangoでカスタムユーザーモデルを実装すれば、ユーザーが会員登録をする時、IDとパスワードだけでなく、ファーストネームや年齢、職業なども入力させた上で会員登録を行うことができる。

これにより、会員登録した後、データ投稿時にユーザー情報もセットで挿入できる。未指定でログイン可能な会員になってしまうという問題を防ぐことができる。

ただ、カスタムユーザーモデルの実装は容易ではない。カスタムユーザーモデルを定義するためのアプリを作り、Djangoのデフォルトのユーザーモデルを継承し、マイグレーションをする。

既にユーザーモデルがマイグレーションされている場合、DBを全て削除した後、やり直さなければならない。一般のアプリのモデルもユーザーモデルに紐付いているため、マイグレーションの順序にも注意する必要がある。

本記事では、汎用性も考慮し、Django-allauthを使用したカスタムユーザーモデルの実装について解説する。


## 流れ

カスタムユーザーモデル実装はシビアな作業のため以下に流れをまとめる。Django-allauthの実装方法は本記事では省略する。


1. 既にDBにマイグレーションしたデータが存在する場合は削除する
1. カスタムユーザーモデルを定義するための専用のアプリを作る(startapp)
1. settings.pyにカスタムユーザーモデルを使う旨を記述
1. models.pyに会員登録時に入力させたいフィールドを指定
1. forms.pyに会員登録時に表示させるフォームを指定
1. admin.pyに管理サイトからも編集できるよう指定
1. 定義したカスタムユーザーモデルをマイグレーションする



## 既にDBにマイグレーションしたデータが存在する場合は削除する

まず最初にやるべきことがある。この作業を始める前、既にマイグレーションを1回でも行ったことがある場合、DBを削除しなければならない。

そこで必要なデータは下記コマンドでバックアップ。

    python3 manage.py dumpdata [バックアップしたいアプリ名] > data.json

そして、DBを削除する。開発中でDBの設定を何もしていなければ、プロジェクトディレクトリ直下にある`db.sqlite3`を削除すれば良い。

続いて、マイグレーションファイルも削除しなければならない。各アプリ内にある`migrations`ディレクトリ内のファイルを全て削除する。


## カスタムユーザーモデルを定義するための専用のアプリを作る(startapp)

続いて、カスタムユーザーモデルを定義するためのアプリを作る。今回は`users`アプリを作る。

    python3 manage.py startapp users

## settings.pyにカスタムユーザーモデルを使う旨を記述

カスタムユーザーモデルを使用する旨を`settings.py`に記述しなければならない。`INSTALLED_APPS`に下記を追加する

    INSTALLED_APPS = [

        .....省略.....
    
        'users.apps.UsersConfig',
    ]

続いて、読み込み対象の`models.py`のクラス名を指定する。

    AUTH_USER_MODEL = 'users.CustomUser'

`users`アプリ内の`models.py`に`CustomUser`クラスは作られていないので、それを次項で定義する。

また、カスタムユーザーモデルを使用したフォームに対応させるため、settings.pyに下記を追加する。

    ACCOUNT_FORMS   = { "signup":"users.forms.SignupForm"}


## models.pyに会員登録時に入力させたいフィールドを指定

`users/models.py`に下記を記述
    
    from django.contrib.auth.models import AbstractUser
    from django.db import models
    
    class CustomUser(AbstractUser):
    
        class Meta(AbstractUser.Meta):
            db_table    = 'custom_users'
    
        age = models.IntegerField(verbose_name="年齢",default=20)


`django.contrib.auth.models`の中にある`AbstractUser`を継承しクラスを定義する。今回は`age`という年齢を格納するフィールドを追加した。これでマイグレーション時、`age`が追加されたカスタムユーザーモデルが定義される。

しかし、これだけでは会員登録時、年齢入力欄は表示されない。`forms.py`を編集して年齢入力欄が表示されるようにする。

## forms.pyに会員登録時に表示させるフォームを指定

`users/forms.py`に下記を記述

    from django.contrib.auth.forms import UserCreationForm
    from .models import CustomUser
    
    class SignupForm(UserCreationForm):
        class Meta(UserCreationForm.Meta):
            model   = CustomUser
            fields  = ("username","email","age")
    
こちらも先程の`models.py`と同様、`django.contrib.auth.forms`内にある`UserCreationForm`を継承して作る。`Meta`クラスに先程定義した`CustomUser`クラスを`model`に、デフォルトで必要になる`username`と`email`に加え、`age`を指定する。

これで会員登録時に年齢入力欄が表示されるようになった。ただし、会員登録時に年齢を入力できても、そのままでは管理者ユーザーはユーザーの年齢を編集することはできない。

そこで、`admin.py`を編集し管理サイトから年齢を編集できるようにする。



## admin.pyに管理サイトからも編集できるよう指定

管理サイトから編集できるよう、ユーザーモデルを管理サイトで定義する。

    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin
    from django.utils.translation import gettext_lazy as _
    
    from .models import CustomUser
    
    
    class CustomUserAdmin(UserAdmin):
    
        fieldsets   = ( 
                (None,{"fields":("username","password")}),
                (_("Personal info"),{"fields":("first_name","last_name","email","age")}),
                (_("Permissions"),{"fields":("is_active","is_staff","is_superuser","groups","user_permissions")}),
                (_("Important dates"),{"fields":("last_login","date_joined")}),
        )   
    
    
    admin.site.register(CustomUser, CustomUserAdmin)
    
`Personal info`にageフィールドを追加した。これで管理サイトから`age`を編集することができるようになった。

## 定義したカスタムユーザーモデルをマイグレーションする

いよいよ、定義したカスタムユーザーモデルをマイグレーションする。ただし、先にマイグレーションをするのはカスタムユーザーモデルであり、それ以外のアプリは後から行う。

この順番を間違えてしまうと、またDBとマイグレーションファイルを削除してやり直しをしなければならない。以下のコマンドを実行する。例えば、既にbbsアプリが存在する場合、こうすれば良い。

    python3 manage.py makemigrations users
    python3 manage.py migrate
    python3 manage.py makemigrations bbs
    python3 manage.py migrate


## 実際に動かしてみる

まず、スーパーユーザーを作って、管理サイトにアクセスしてみる。ユーザーを変更する画面では年齢入力欄が新たに追加されていることがわかる。

<div class="img-center"><img src="/images/Screenshot from 2020-12-15 09-41-11.png" alt="管理サイト上に年齢が追加されている"></div>

続いて、一般ユーザーを作ってみる。`/accounts/signup/`にアクセスしてみると、ユーザー登録画面に年齢入力欄が追加されている。

<div class="img-center"><img src="/images/Screenshot from 2020-12-15 09-43-58.png" alt="一般ユーザー登録画面も年齢入力欄が追加されている"></div>

BBSに投稿する時、年齢が同時に入力される。

<div class="img-center"><img src="/images/Screenshot from 2020-12-15 09-47-42.png" alt="投稿時にユーザーの年齢が同時に入力された"></div>

## 結論

カスタムユーザーモデルを実装させることで、会員登録時に性別や年齢などの基本情報の入力を必須とさせることができる。会員登録後に指定させることもできるが、かえってユーザビリティを損ねたり、開発工数が増える可能性もある。

カスタムユーザーモデルを定義する時に注意しなければならないのは、既に開発が進み、データがある程度入力されている状況下では実装がかなり難しいことだ。当然、顧客に納品した状態であれば実データが格納されている。それらを保持した状態でユーザーモデルを作り直すのであれば、データの移行作業に時間がかかってしまう可能性がある。

予めプロジェクト開始と同時にカスタムユーザーモデルに定義した上で、本格的に開発に進みたいところだ。

## ソースコード

https://github.com/seiya0723/django_allauth_bbs_customusermodel


