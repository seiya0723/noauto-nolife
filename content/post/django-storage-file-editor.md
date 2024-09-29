---
title: "【Django】ストレージに保存されているファイルにアクセス、編集して保存する【InMemoryUploadedFile】"
date: 2024-09-26T17:52:02+09:00
lastmod: 2024-09-26T17:52:02+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django" ]
---


アップロードされているファイルを編集したいことがある。

今回はテキストファイルを想定して、コードを書いてみた。

ただし、開発中にファイルパスを直接指定して編集する方法は、デプロイ後は使えないので、その点も考慮した。

実際にS3ストレージに保存されているファイルを読み込み、編集して保存できた。

## ストレージに保存されているファイルを編集する。

手順は

1. ストレージの保存先URLを取得する
1. URLに対してリクエストを送る
1. レスポンスデータをメモリ空間内に読み込み
1. 編集する
1. InMemoryUploadedFileのオブジェクトを作る
1. バリデーションして保存する

となっている。

```
        # txtファイルを追記する。
        document    = Document.objects.filter(id=1).first()


        # URL を使ってリクエストを送らなければ読み込みできないため、requestsを使う。
        # 直接読み込み書き込みは失敗する
        """
        if document:
            messages.info(request, document.file.url)

            with open(document.file.url, 'a') as f:
                f.write("追記されました\n")
        """

        # ストレージサーバーに対してリクエストを送る。
        response    = requests.get(document.file.url)

        # レスポンスをメモリ内に読み込み
        file_stream = io.BytesIO(response.content)
        file_stream.seek(0, io.SEEK_END)
        file_stream.write(b"\naaaaa")
        file_stream.seek(0)

        # InMemoryUploadedFile のオブジェクトを作る
        uploaded_file = InMemoryUploadedFile(
            file=file_stream,         
            field_name="file",        
            name=document.file.name,  
            content_type="text/plain",
            size=file_stream.getbuffer().nbytes,
            charset=None
        )

        # バリデーションして保存する。
        dic         = {}
        dic["file"] = uploaded_file

        form        = DocumentForm({}, dic, instance=document)

        if form.is_valid():
            form.save()
        else:
            print(form.errors)
```

ただこのコードの欠点は、編集前のファイルが残ってしまうこと。

だから、Django-cleanupを使う。

[【django-cleanup】画像等のファイルを自動的に削除する](/post/django-cleanup/)


## 結論

少々回りくどいが、メモリ内に読み込みさせ、データを編集しているので、openpyxlなどでもおそらくうまく動いてくれるだろう。

[【Django】openpyxlでエクセルファイルを新規作成、バイナリでダウンロードする【FileResponse】](/post/django-openpyxl/)


