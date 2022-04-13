---
title: "Djangoで画像及びファイルをアップロードする方法"
date: 2020-11-05T15:30:14+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","セキュリティ" ]
---

Djangoで画像やファイルをアップロードする方法をまとめる。

## 流れ

1. 必要なライブラリのインストール
1. settings.pyの編集
1. urls.pyの編集
1. models.pyでフィールドの定義
1. forms.pyでフォームを作る
1. views.pyで受け取り処理
1. templatesにフォームを設置
1. マイグレーション
1. 開発用サーバーの立ち上げ

## 必要なライブラリのインストール

今回はアップロード後のバリデーションを行うため、Pythonのサードパーティー製ライブラリとして`Pillow`と`python-magic`を使用する

    pip install Pillow
    pip install python-magic

Pillowは画像を保存するために必要なライブラリ。画像の加工もできる。

python-magicはアップロードされたファイルのMIME値を取得するためのライブラリ。MIMEとはファイルの種類のこと。このMIMEの値をチェックすることでアップロードされたファイルがPDFなのか、MP4なのか、EXEなのかなどを知ることができる。

## settings.pyの編集

ファイルをアップロードするには、アップロード先となるディレクトリを指定して、それからアップロードしたファイルを公開するにはパスを指定しなければならない。そのためにも、まずは`settings.py`と`config/urls.py`に追記する。

以下、`settings.py`に書き込む。

    MEDIA_URL   = "/media/"
    MEDIA_ROOT  = BASE_DIR / "media"

`MEDIA_URL`はサイトにアクセスするクライアント側から見たURLを指定する。例えば、`test.png`の場合、URLは`127.0.0.1:8000/media/test.png`になる。

仮に`MEDIA_URL`が`"/mediafile/"`の場合、URLは`127.0.0.1:8000/mediafile/test.png`になる。

`MEDIA_ROOT`はサーバー側から見た画像ファイルの在り処を指定する。プロジェクトディレクトリ直下の`media`ディレクトリを指定する。

### 【補足1】Django2.x以前の書き方

Django2.x以前の場合は下記のように書く

    MEDIA_ROOT  = os.path.join(BASE_DIR, "media")

## urls.pyの編集

続いて、`config/urls.py`の修正。下記のように書き換える。

    from django.contrib import admin
    from django.urls import path,include
    
    from django.conf import settings
    from django.conf.urls.static import static
    
    urlpatterns = [
        path('admin/', admin.site.urls),
        path('',include('upload.urls')),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

やっていることは、`settings.py`で指定した`MEDIA_URL`と`MEDIA_ROOT`に倣って、`urlpatterns`にパスを追加している。

ファイルアップロード時の保存先と公開先の指定はこれでOK

## models.pyでフィールドの定義

今回は、画像とファイルのアップロード機能を搭載させるため、下記のようになった。

    from django.db import models
    
    class PhotoList(models.Model):
    
        photo       = models.ImageField(verbose_name="フォト",upload_to="file/photo_list/photo/")
    
    class DocumentList(models.Model):
    
        document    = models.FileField(verbose_name="ファイル",upload_to="file/document_list/document/")
    

`models`の`ImageField`と`FileField`を使用する。`upload_to`属性を指定してアップロード先を分けている。


### upload_toで指定するパスについて

upload_toが未指定もしくは空文字列であれば、settings.pyのMEDIA_ROOTに基づき、プロジェクトディレクトリ直下のmediaに保存される。

ただ、全てのファイルがmediaディレクトリに保存されてしまうと、バックアップの作業が大変になる。そこで、upload_toを指定して適宜ディレクトリ分けをすることを推奨する。

可能であれば、パスは

    [アプリ名]/[モデルクラス名]/[フィールド名]/

とすれば、重複することはないだろう。その場合、スネークケースで書いたほうが無難。

## forms.pyでフォームを作る

    from django import forms
    from .models import PhotoList,DocumentList
    
    class PhotoListForm(forms.ModelForm):
    
        class Meta:
            model   = PhotoList
            fields  = ['photo']
    
    class DocumentListForm(forms.ModelForm):
    
        class Meta:
            model   = DocumentList
            fields  = ['document']

モデルを継承して作る。フィールドを指定するだけでいい。

## views.pyで受け取り処理

    from django.shortcuts import render,redirect
    
    # Create your views here.
    from django.views import View
    from .models import PhotoList,DocumentList
    from .forms import PhotoListForm,DocumentListForm
    
    import magic
    
    ALLOWED_MIME    = [ "application/pdf" ]
    
    class PhotoView(View):
    
        def get(self, request, *args, **kwargs):
    
            data    = PhotoList.objects.all()
            context = { "data":data }
    
            return render(request,"upload/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = PhotoListForm(request.POST, request.FILES)
            
            if form.is_valid():
                print("バリデーションOK")
                form.save()
    
            return redirect("upload:index")
    
    index       = PhotoView.as_view()
    
    class DocumentView(View):
    
        def get(self, request, *args, **kwargs):
    
            data    = DocumentList.objects.all()
            context = { "data":data }
    
            return render(request,"upload/document.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form        = DocumentListForm(request.POST,request.FILES)
            mime_type   = magic.from_buffer(request.FILES["document"].read(1024) , mime=True)
    
            if form.is_valid():
                print("バリデーションOK")
    
                if mime_type in ALLOWED_MIME:
                    form.save()
                else:
                    print("このファイルは許可されていません。")
    
            return redirect("upload:document")
    
    document    = DocumentView.as_view()

画像ファイルの保存処理は`forms.py`から継承したオブジェクトに`request.POST`と`request.FILES`を代入。バリデーションを行い、`.save()`で保存する。`media`ディレクトリ内の`photo`ディレクトリに画像が保存されている。

ここでファイル保存時の処理として、python-magicを使用しMIMEを判定した上で保存をしている。`ALLOWED_MIME`にはリスト型で保存したいファイルのタイプ(今回はPDF)を指定する。


## templatesにフォームを設置


### 画像のアップロード用テンプレート

`templates/index.html`を作る。これが画像ファイルのアップロードページ。内容は下記。
    
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>画像アップロードのテスト</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <h1 class="bg-primary text-center text-white">画像アップロードのテスト</h1>
        
        <main class="container">
    
            <p><a href="{% url 'upload:document' %}">ファイルのアップロードはこちら</a></p>
    
            <form method="POST" enctype="multipart/form-data">
                {% csrf_token %}
                <input type="file" name="photo">
                <input class="form-control" type="submit" value="送信">
            </form>
    
    
            {% for content in data %}
            <div class="my-2">
                <img class="img-fluid" src="{{ content.photo.url }}" alt="投稿された画像">
            </div>
            {% endfor %}
        
        </main>
    
    </body>
    </html>

### ファイルのアップロード用テンプレート
    
`templates/document.html`を作る。これがファイルアップロードページ。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>ファイルアップロードのテスト</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
        <h1 class="bg-primary text-center text-white">ファイルアップロードのテスト</h1>
        <main class="container">
        
            <p><a href="{% url 'upload:index' %}">画像のアップロードはこちら</a></p>
    
            <form method="POST" enctype="multipart/form-data">
                {% csrf_token %}
                <input type="file" name="document">
                <input class="form-control" type="submit" value="送信">
            </form>
        
            {% for content in data %}
            <div class="my-2">
                <a href="{{ content.document.url }}">{{ content.document }}</a>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

注意するべきことは、`form`タグ内に`enctype="multipart/form-data"`を指定すること。これを指定していないと、ファイルのアップロードができない。

## マイグレーション

後は普通にマイグレーションを実行する。

    python3 manage.py makemigrations
    python3 manage.py migrate 

ここで、マイグレーション時に警告([You are Trying to add a non-nullable field](/post/django-non-nullable/))が出る場合、`ImageField`及び`FileField`はDB上は文字列型扱い(格納されているのはファイルパス)なので、`null=True,blank=True`のフィールドオプションを追加するか、1度限りのデフォルト値として任意の文字列を指定すると良いだろう。

参照: [【Django】models.pyにフィールドを追加・削除する【マイグレーションできないときの原因と対策も】](/post/django-models-add-field/)

## 開発用サーバーの立ち上げ

開発サーバーを立ち上げる。

    python3 manage.py runserver 127.0.0.1:8000

こんなふうになればOK。

<div class="img-center"><img src="/images/Screenshot from 2021-10-21 08-14-02.png" alt="画像ファイルアップロード時の挙動"></div>

ファイルアップロードのページでは、pdfファイルのみ受け付ける。

<div class="img-center"><img src="/images/Screenshot from 2020-11-11 16-37-30.png" alt="PDFファイルのみ受け付けている"></div>

## 結論

django.core.validators内の[FileExtensionValidator](https://docs.djangoproject.com/en/3.1/ref/validators/#fileextensionvalidator)は拡張子のチェックしかしていないので、これだけではファイルアップロードのバリデーションには不十分である点に注意。

例えば、本来のファイル名が`test.exe`の場合、.exeを.txtに書き換えて、`test.txt`にすることができる。拡張子が`.txt`のファイルしか受け付けないバリデーションでは、拡張子を変えた`test.txt`(実体は.exe)を受け取ってしまう。

そこで、ファイルの拡張子偽装もチェックするため、今回はサードパーティー製ライブラリである`python-magic`を使用した。

python-magicはファイルヘッダのMIMEタイプを元に調べるため、単純なファイル名の拡張子偽装であれば拒否することができる。

もっとも、ファイルのアップロードはセキュリティ的な問題を誘発する可能性があるため、なるべく必要最低限に留めておいたほうが無難。LinuxであればアンチウイルスソフトとしてClamAVなどがあるが、パターンマッチング方式では防ぎきれないこともあるので過信は禁物。

それから、今回のコードのようにアップロード機能のあるウェブアプリを、Herokuなどのストレージを持たないクラウドサーバーにデプロイしても動作しないので注意が必要。その場合は別途ストレージを用意して、`settings.py`の`MEDIA_ROOT`に指定する。

さらに、ファイルアップロードのデプロイ先がNginxやApacheなどのウェブサーバーの場合、大抵アップロードできるファイルの最大容量の制限がかかっている。例えば2MB以上のファイルアップロード禁止など。その場合はウェブサーバーの設定ファイルから書き換えを行わなければならない。

以上の点から、ファイルアップロードはフレームワークの知識だけでなく、セキュリティ的な知識の他に、インフラ関係の知識まで要求されるため、初学者であればデプロイに1日以上かかってしまう事は珍しくない。

<!--
## ソースコード

https://github.com/seiya0723/django_fileupload
-->
