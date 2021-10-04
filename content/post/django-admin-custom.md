---
title: "Djangoの管理サイト(admin)をカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】"
date: 2021-06-10T12:30:46+09:00
draft: false
thumbnail: "images/Screenshot from 2021-06-10 14-42-55.png"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","tips" ]
---


`admin.py`はとても便利ではあるが、ただの`admin.site.register([モデルクラス])`ではとても使いづらい。

特にそのままでは管理サイト内で画像を取り扱ったり、複数のデータを参照したり、検索や絞り込みしたりすることはできない。

そこで、管理サイトをカスタマイズして使いやすくさせる。

## コード

元コードは、[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)から流用した。以下のように`models.py`の`PhotoList`に`name`,`age`,`dt`,`comment`を追加している。

    from django.db import models
    from django.utils import timezone
    
    class PhotoList(models.Model):
    
        class Meta:
            db_table    = "photolist"
    
        photo       = models.ImageField(verbose_name="フォト",upload_to="photo/",blank=True)
        dt          = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        name        = models.CharField(verbose_name="名前",max_length=20,default="匿名希望")
        age         = models.IntegerField(verbose_name="年齢",default=20)
    
    class DocumentList(models.Model):
    
        class Meta:
            db_table    = "documentlist"
    
        document    = models.FileField(verbose_name="ファイル",upload_to="file/")


そして、admin.pyのコードが下記。


    from django.contrib import admin
    from django.utils.html import format_html
    
    from .models import PhotoList,DocumentList
    
    class PhotoListAdmin(admin.ModelAdmin):
    
        #指定したフィールドを表示、編集ができる
        list_display        = [ "id","name","age","comment","dt","format_photo" ]
        #list_editable       = [ "name","age","comment","dt" ]
    
    
        #指定したフィールドの検索と絞り込みができる
        search_fields       = [ "name","age","comment" ]
        list_filter         = [ "name" ]
    
        #1ページ当たりに表示する件数、全件表示を許容する最大件数(ローカルでも5000件を超えた辺りから遅くなるので、10000~50000辺りが無難)
        list_per_page       = 10
        list_max_show_all   = 20000
    
        #日付ごとに絞り込む、ドリルナビゲーションの設置
        date_hierarchy      = "dt"
    
        #画像のフィールドはimgタグで画像そのものを表示させる
        def format_photo(self,obj):
            if obj.photo:
                return format_html('<img src="{}" alt="画像" style="width:15rem">', obj.photo.url)
    
        #画像を表示するときのラベル(photoのverbose_nameをそのまま参照している)
        format_photo.short_description      = PhotoList.photo.field.verbose_name
        format_photo.empty_value_display    = "画像なし"
    
    
    
    admin.site.register(PhotoList,PhotoListAdmin)
    admin.site.register(DocumentList)


上記のように、`admin.ModelAdmin`を継承したクラスを作り、カスタムしたい属性、メソッドをオーバーライドする

## 解説

### list_displayで表示させるフィールドを増やす(並び替えもできる)

`list_display`にリスト型でフィールドを指定すると指定したフィールドがそのまま管理サイトに表示される。

### list_editable

`list_editable`に指定したフィールドは書き換えが可能になる。


### search_fields

指定したフィールドで検索を行うことができる。後述の絞り込みとセットで行うことでさらに詳細な検索ができる。

### list_filter

指定したフィールドは絞り込みを行うことができる。カテゴリ、タグなどで絞り込み検索を実行したい時に有効。


### list_per_page

1ページに表示させる件数を指定できる。何件でも良いが、10000を超えた辺りから、体感でもレスポンスが遅くなる点に注意。

### list_max_show_all

全件表示させる最大件数の指定。こちらも10000~50000あたりにとどめておいたほうが無難。

### date_hierarchy

日付でドリルダウンメニューが作れる。ドリルダウンメニューにしたい日付フィールドを1つだけ指定する。

### 画像を表示させるには

まず、`list_display`に任意のメソッド名を文字列型で指定する。

    list_display = [ "format_photo" ]


先ほど指定したメソッド名で、画像を表示させるメソッドを定義する。


    #画像のフィールドはimgタグで画像そのものを表示させる
    def format_photo(self,obj):
        if obj.photo:
            return format_html('<img src="{}" alt="画像" style="width:15rem">', obj.photo.url)


これだけだと、管理サイトの表示が`format_photo`になってしまう。そこで、`verbose_name`を`format_photo.short_description`に指定する。これで表示が`verbose_name`で指定した『フォト』になる

このモデルフィールドからの`verbose_name`の指定は『[Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】](/post/django-reference-models-option/)』に書かれてあるので参考に。

    #画像を表示するときのラベル(photoのverbose_nameをそのまま参照している)
    format_photo.short_description      = PhotoList.photo.field.verbose_name
    format_photo.empty_value_display    = "画像なし"
    
何も指定がない時は『画像なし』と表示させる。

<div class="img-center"><img src="/images/Screenshot from 2021-06-10 14-40-40.png" alt="画像表示"></div>

## 結論

<div class="img-center"><img src="/images/Screenshot from 2021-06-10 14-42-55.png" alt="カスタムされた管理画面"></div>


このように`admin.py`の編集だけで簡単に管理サイトをカスタムできる。ただ、モデルフィールドを直接指定しているので、`models.py`が固まった開発終盤に作るのが妥当と言えよう。

他にも、`ModelAdmin`にはアクションの追加がある。データを全件編集、画像の全件DL、CSVでアウトプットなど予め定義しておいたアクションを管理画面から実行することができる。`dumpdata`等のコマンドが打てない環境下でも、予めアクションを定義しておけば、マウスクリックで簡単に実行できる。これはクライアントに納品する前に実装しておくとウケるだろう。

一応管理画面のテンプレートの改造も可能な模様。デフォルトでもいたれりつくせりなのであえてテンプレートまでカスタムする必要はなさそうだが。


