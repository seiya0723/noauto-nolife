---
title: "【Django】Heroku+Cloudinaryの環境にアップロードしたファイルを参照する方法【MIMEとサイズ】"
date: 2021-09-29T15:45:48+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","heroku","デプロイ","tips","cloudinary" ]
---

クライアントがアップロードしたファイルをビュー側で参照するときがある。例えば、許可されていないMIMEのアップロード、ファイルサイズの確認など。

通常であれば、下記のようにすれば良い。

    request.FILES["document"]

しかし、こんな参照をすると、Cloudinaryにはアップロードできてもファイルが壊れてしまう。PDF等の普通のファイルであれば問題はないが、mp4等の動画ファイルで発生している模様。

## コード

POSTメソッドだけ掲載。


    def post(self, request, *args, **kwargs):

        form        = DocumentListForm(request.POST,request.FILES)

        #XXX:これをやると動画ファイル破損
        """
        mime_type   = magic.from_buffer(request.FILES["document"].read(1024), mime=True)

        if request.FILES["document"].size >= LIMIT_SIZE:
            print("サイズが大きすぎです")
            return redirect("upload:document")
        if mime_type not in ALLOWED_MIME:
            print("このファイルは許可されていません。")
            return redirect("upload:document")
        """


        #アーリーリターン
        if not form.is_valid():
            print("バリデーションエラー")
            return redirect("upload:document")


        #ここで一旦保存して、saveメソッドの返り値のモデルオブジェクトを入手。後の削除で使用する
        print("バリデーションOK")
        obj = form.save()

        if form.files:

            #アップロードした後でもサイズは取れる。
            copied  = form.files["document"]
            size    = copied.size
            print(size)


            """
            #XXX:この方法だとファイルパスではないため読み込めない。
            mime_obj    = magic.Magic(mime=True)
            mime        = mime_obj.from_file(obj.document.url)
            print(mime)
            """

            #XXX:これだと必ずapplication/x-emptyになってしまう。アップロードしたため即消えるのでは？
            #mime    = magic.from_buffer( copied.read(1024), mime=True ) 
            mime    = magic.from_buffer( request.FILES["document"].read(1024), mime=True )
            print(mime)

            #後から削除しようにもMIMEがおかしいため必ず削除される。
            if size >= LIMIT_SIZE or mime not in ALLOWED_MIME:
                print("MIMEとsizeが規定ではないため、削除されます。")
                obj.delete()


        return redirect("upload:document")



どう頑張っても、MIMEを取ることはできなかった。MIMEを取ったところで動画ファイルは破損する。MIMEを取らなければ動画ファイルは破損せずに保存できるが、それでは動画ではないファイルもアップロードされてしまうこのジレンマ。

requestsライブラリを使って、ファイルのヘッダだけDL、それを判定する方法があるかも知れないが、時間がかかりすぎると思われる。そんな事をするぐらいだったら、常駐スクリプトを作って動かしたほうが遥かにサーバーの負荷が軽減されるだろう。

## 結論

CloudinaryではMIMEタイプ判定による保存の拒否は実現できないらしい。他にMIMEを判定するいい方法があればまだしも。

先に保存をしてしまうと、`application/x-empty`になってしまうし、保存の前に判定しようものなら動画ファイルが壊れる。かと行って、保存した後、URLを指定してDLした後、MIMEを判定するのは時間がかかりすぎるし、magicはファイルにURLを指定してのMIME判定はできない。

Cloudinaryを使用している場合、MIMEによる判定は不可能に近いかと思われる。sizeに関しても保存前に参照すると動画ファイルが壊れる。

いっそのこと、Cloudinaryを使用した場合、MIMEやファイルサイズによる判定は除外してしまったほうが簡単かも知れない。

今回の件で、CloudinaryがMIMEではなく拡張子を元にファイルの公開判定をする理由がわかったような気がする。

MIMEによる判定ができないのはとても口惜しいが、拡張子判定していないと完全に丸腰なので、`models.py`の`FileField`のフィールドオプションに拡張子の指定をした上で公開すると良いだろう。フロント側でも拡張子の制限を加えておく。

### 特定拡張子以外を受け付けないようにする

models.pyにて。

    from django.db import models
    from django.core.validators import FileExtensionValidator

    class DocumentList(models.Model):

        class Meta:
            db_table    = "documentlist"
            
        document    = models.FileField(verbose_name="ファイル",upload_to="file/",validators=[ FileExtensionValidator( ["mp4"] ) ])


HTMLにて

    <input type="file" name="document" required accept=".mp4">

ちなみに、上記モデルを継承したフォームクラス、テンプレートで表示させると、accept属性が無かったため、フォームクラスは使わないほうがよいかも。


