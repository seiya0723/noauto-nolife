---
title: "【Django】バッチ処理でPS、AI(PDF)ファイルのサムネイルを自動生成させる【BaseCommand】"
date: 2021-05-23T12:02:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","システム管理","上級者向け","Pythonライブラリ" ]
---

[PS、AIファイルのサムネイルを作る処理](/post/django-aips-thumbnail-autocreate/)を[manage.pyコマンドに追加](/post/django-command-add/)することで、ビューの負担を軽減する。

これにより、負荷のかかる処理をビューから分離できる。投稿処理が集中しても、高負荷の処理が原因でサーバーダウンすることは無いのだ。

## 全体像

こんなふうに、通常のリクエストで行われる処理系とは分離して、サムネイルの自動生成が行われる。

<div class="img-center"><img src="/images/Screenshot from 2021-05-23 15-19-04.png" alt="サムネイル生成は独立"></div>


ループにより逐次処理を行うため、リクエストとは違って並列ではない。故にサーバーダウンはしない。

もちろん、バッチ処理を高速化させたいのであれば、サーバーのリソースを考慮した上で、適宜並列化、マルチプロセスで書くと良いだろう。


## バッチ処理のコード


    from django.core.management.base import BaseCommand
    
    from django.conf import settings
    from ...models import Design
    
    from psd_tools import PSDImage
    from PIL import Image
    
    from pdf2image import convert_from_path
    #↑pip install pdf2imageでインストール
    
    
    import time
    
    class Command(BaseCommand):
    
        def handle(self, *args, **kwargs):
    
            #パス指定
            path = Design.thumbnail.field.upload_to
    
            #サムネイル生成処理をループ化
            while True:
    
                #ここで該当データの抽出
                #サムネイルがNULLもしくはblank状態になっている場合、なおかつerrorfalseの場合
                designs = Design.objects.filter(error=False,thumbnail="")
                print(designs)
    
                #ここで該当データのサムネイル生成作業
                for design in designs:
    
                    thumbnail_path = path + str(design.id) + ".png"
                    full_path = settings.MEDIA_ROOT + "/" + thumbnail_path
    
                    if design.mime == "image/vnd.adobe.photoshop":
                        image = PSDImage.open(settings.MEDIA_ROOT + "/" + str(design.file))
                        image.composite().save(full_path)
                        design.thumbnail = thumbnail_path
    
                    elif design.mime == "application/postscript":
                        image = Image.open(settings.MEDIA_ROOT + "/" + str(design.file))
                        image.save(full_path)
                        design.thumbnail = thumbnail_path
    
                    elif design.mime == "application/pdf":
                        images = convert_from_path(settings.MEDIA_ROOT + "/" + str(design.file))
                        images[0].save(full_path)
                        design.thumbnail = thumbnail_path
    
                    else:
                        #生成できないものにはエラーフラグ
                        design.error = True
    
                    #TODO:後に、サムネイルのサイズを調整する処理をここに書く
    
    
                    design.save()
    
                time.sleep(1)


基本的な流れは、

1. サムネイル生成されていない、なおかつエラーフラグはFalseのデータを抽出
1. 抽出したデータをforループで1つずつサムネイル生成
1. 生成したサムネイルのパスを書き込み保存

サムネイル生成に失敗した場合、エラーフラグをTrueにする。これで次以降のループでは引っかからない。

これを

    python3 manage.py [上記スクリプトのファイル名]

で呼び出して動かす。

送信直後にサムネイルが表示されない問題があるものの、サーバーダウンのリスクを下げることができる点で優れている。

後は、PILの`.resize()`メソッドでサイズを調整するぐらいだろう。


## 結論

後は、このバッチ処理をcrontabなどから実行させれば良いだろう。

サムネイル生成の他に、メディアファイルの変換、加工系はどうしても時間とリソースが必要な場合が多いので、ビューには直接書かないほうが良い。

