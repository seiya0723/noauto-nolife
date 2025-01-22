---
title: "Djangoでアップロードされた.aiと.psファイルのサムネイルを自動生成させる【PhotoShop,Illustrator】"
date: 2021-05-10T10:01:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---

ファイルをアップロードした後、ファイル名だけ表示されている状態では、それが何なのかパット見でよくわからない。

<div class="img-center"><img src="/images/Screenshot from 2021-05-09 14-05-53.png" alt="ファイルの内容がよくわからない"></div>

だからこそ、事前にサムネイルを用意させる。こんなふうに

<div class="img-center"><img src="/images/Screenshot from 2021-05-10 08-33-48.png" alt="サムネイル表示でファイルの内容がわかる"></div>

だが、サムネイル画像のアップロードまでユーザーに押し付けるのは、気軽なファイル共有を前提としたウェブアプリのコンセプトが台無しになる。そこで、アップロードしたファイルのサムネイルをサーバーサイドに自動生成してもらう。

本記事ではファイルアップロード後のサムネイルの自動生成、とりわけ、PhotoShopの`.ps`ファイル、及びIllustratorの`.ai`ファイルのサムネイルを自動生成する方法を解説する。


ソースコードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)から流用する。

## 事前準備

まず、`.ps`ファイル及び`.ai`ファイルを解析するため、Pythonのライブラリをインストールさせる

    pip install Pillow
    pip install psd-tools

`.ps`ファイルのサムネイル作成は`psd-tools`というライブラリを使用する。一方で、`.ai`ファイルのサムネイル作成には画像編集でお馴染みの`Pillow`だけでOK。

それぞれ、ファイルを読み込み、画像を生成するスクリプトの例をここに記す。


    #Illustrator
    
    from PIL import Image
    
    image   = Image.open("example.ai")
    image.save("example.png")
    


    #PhotoShop
    
    from psd_tools import PSDImage
    
    image   = PSDImage.open('example.psd')
    image.composite().save('example.png')


いずれも数行でサムネイル生成ができるが、フォトショップの場合はレイヤーが多いと生成に時間がかかってしまう。

リクエストのタイムアウトを考慮すれば、この処理はバッチ処理に回すべきだと思うが、本記事では`views.py`に記す。(いずれ[バッチ処理](/post/django-command-add/)を書く)

## サムネイルを自動生成する処理

冒頭でも述べたとおり、ソースコードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)から流用する。

まず`models.py`。サムネイルを格納するフィールドを作る。さらにクラス名、カラム名いずれも雑だったので一部修正した。

    class Document(models.Model):
    
        class Meta:
            db_table    = "document"
    
        file        = models.FileField(verbose_name="ファイル",upload_to="file/document/")
        mime        = models.TextField(verbose_name="MIMEタイプ")
        thumbnail   = models.ImageField(verbose_name="サムネイル",upload_to="file/thumbnail/",null=True)

`mime`に`python-magic`で抜き取ったMIMEタイプを格納する。これでフォトショップとイラストレーターの判定ができるようにする。

`thumbnail`は`null`を`True`にしておくのがポイント。レコード作成時にはサムネイルは空になるので、`null`を許可しないとエラーが出る。サムネイル生成に失敗した時の対策にもなる。


続いて、`views.py`。ユーザーからのPOSTリクエストを受け取った後に保存、その後にサムネイルを自動生成している。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    
    from .models import Photo,Document
    from .forms import PhotoForm,DocumentForm
    
    from django.conf import settings
    
    import magic
    
    ALLOWED_MIME    = [ "image/vnd.adobe.photoshop","application/postscript" ]
    
    """
    省略
    """
    
    class DocumentView(View):
   
        """
        省略
        """
    
        def post(self, request, *args, **kwargs):
    
            #fileが指定されていない場合、後述の直接参照でインデックスエラーを防ぐためアーリーリターン
            if "file" not in request.FILES:
                return redirect("upload:document")
    
            mime_type   = magic.from_buffer(request.FILES["file"].read(1024) , mime=True)
            print(mime_type)
    
            #mime属性の保存(後のバッチ処理に繋げる)
            copied          = request.POST.copy()
            copied["mime"]  = mime_type
    
            form        = DocumentForm(copied,request.FILES)
    
            if not form.is_valid():
                print("バリデーションNG")
                return redirect("upload:document")
    
            if mime_type not in ALLOWED_MIME:
                print("このファイルは許可されていません。")
                return redirect("upload:document")
    
    
            print("バリデーションOK")
            result  = form.save() #TIPS:←返り値がモデルクラスのオブジェクトになるので、id属性を参照すれば良い。
            print(result.id)
            
            #======ここから先、サムネイル作成処理==========
    
            #処理結果のIDを元に、サムネイルの保存を行い、thumbnailに保存したパスを指定する
            document        = Document.objects.filter(id=result.id).first()
    
            #upload_to、settings内にあるMEDIA_ROOTを読み取り、そこに画像ファイルを保存。
            from django.conf import settings
            path            = Document.thumbnail.field.upload_to # ←予めmediaディレクトリにthumbnailディレクトリを作る
            thumbnail_path  = path + str(document.id) + ".png"
            full_path       = settings.MEDIA_ROOT + "/" + thumbnail_path 
    
            #フォトショップの場合
            if document.mime == "image/vnd.adobe.photoshop":
                from psd_tools import PSDImage
                image   = PSDImage.open(settings.MEDIA_ROOT + "/" + str(document.file))
                image.composite().save(full_path)
    
            #イラストレーターの場合
            elif document.mime == "application/postscript":
                from PIL import Image
                image   = Image.open(settings.MEDIA_ROOT + "/" + str(document.file))
                image.save(full_path)
            else:
                return redirect("upload:document")
    
            document.thumbnail   = thumbnail_path
            document.save()
    
            return redirect("upload:document")
    
    document    = DocumentView.as_view()

`form.save()`するまではこれまでのファイルアップロードと同様である。ただ、注意する点は`form.save()`した後、返り値としてモデルオブジェクトが得られるので(`result`)、それを使い`.id`属性でDBにレコード作成したデータの`id`を抜き取る。

生成したサムネイルの保存先のパスと、URLから見たパスは全く異なるので、それぞれ生成する。その時、`thumbnail`で定義したフィールドオプションの`upload_to`は下記に倣って抜き取る

    Document.file.field.upload_to
    
参照:[Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】](/post/django-reference-models-option/)

他にも`settings.py`の`MEDIA_ROOT`を読み取る。`MEDIA_ROOT`は画像の実体を保存するパスだ。

パスを定義した後は、事前準備の項で解説したフォトショップ、イラストレーターの画像生成処理を元にコードを書く。

    #フォトショップの場合
    if document.mime == "image/vnd.adobe.photoshop":
        from psd_tools import PSDImage
        image   = PSDImage.open(settings.MEDIA_ROOT + "/" + str(document.file))
        image.composite().save(full_path)

    #イラストレーターの場合
    elif document.mime == "application/postscript":
        from PIL import Image
        image   = Image.open(settings.MEDIA_ROOT + "/" + str(document.file))
        image.save(full_path)
    else:
        return redirect("upload:document")


最後に、URLから見たパスを`thumbnail`に指定、保存する。`upload_to`に書かれた内容と、ファイル名が指定されている。

    document.thumbnail   = thumbnail_path
    document.save()

これで、生成したサムネイルがウェブアプリ側から見れる。

<div class="img-center"><img src="/images/Screenshot from 2021-05-10 08-33-48.png" alt="サムネイル表示でファイルの内容がわかる"></div>

## 結論

これだけでユーザビリティは大幅に向上するだろう。閲覧、投稿いずれも行いやすくなったのだから。


ただ、レイヤー数の多いフォトショップファイル、大容量のファイルのサムネイルを自動生成する時、処理時間が極端に長くなる(5秒から10秒ぐらい)。これではリクエストがタイムアウトになってしまう。レスポンスが遅いから、アップロードした後で閲覧することも難しいだろう。

この問題は[バッチ処理に書き換える](/post/django-command-add/)ことで対処できる。サムネイルがnullになっているデータを炙り出し、バッチ処理がサムネイルを生成する。それでリクエストとサムネイル自動生成の処理を分離できる。一時的にサムネイルがnullになって表示されるが、その時はDTLでNO-IMAGE等マークがついたデフォルトのサムネイルを指定すれば良いだろう。

それから、サムネイルの画像サイズも調整するべきだと思う。現状では画像サイズが大きいので、大量に表示させようとすると遅延がひどいことになる。画像加工用ライブラリのPillowを使ってどうにかするなど、対策が必要と思われる。

## ソースコード

https://github.com/seiya0723/auto_thumbnail_create

カスタムユーザーモデルも含まれている。

