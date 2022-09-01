---
title: "【Django】アップロードするファイルサイズに上限をセットする【validators】"
date: 2022-05-13T16:04:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","tips" ]
---


本記事ではアップロードするファイルサイズに上限をセットする方法を解説する。

ただし、ビュー側にファイルサイズの上限をチェックする機能を実装させるのではなく、以前紹介した、『[【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】](/post/django-models-origin-validators/)』を元に実装させる。

ビューに判定機能を実装させる方法でも問題はないが、投稿するビューが二分した時、全く同じ処理を書く必要があるからだ。


## モデル

    from django.db import models
    from django.core.exceptions import ValidationError
    
    MAX_SIZE    = 2 * 1000 * 1000
    
    def validate_max_size(value):
        if value.size > MAX_SIZE:
            raise ValidationError( "ファイルサイズが上限(" + str(MAX_SIZE/1000000) + "MB)を超えています。送信されたファイルサイズ: " + str(value.size/1000000) + "MB")
        else:
            print("問題なし")
    
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        image       = models.ImageField(verbose_name="画像",upload_to="bbs/topic/image/",null=True,blank=True,validators=[validate_max_size])
    
    
このように独自のバリデーションを指定することで、バリデーション結果のメッセージを詳細にする事ができる。

更に、ビュー側に書くコードが減るので、ビューの見通しが良くなるだろう。

<div class="img-center"><img src="/images/Screenshot from 2022-05-13 17-03-04.png" alt=""></div>


## 結論

後は、DjangoMessageFrameworkと連携させ、エラーメッセージを表示させると良いだろう。

[【Django】任意のエラーメッセージを表示させる【forms.pyでerror_messagesを指定】](/post/django-error-messages-origin/)


検索して下記が目に止まったが、ベストアンサーのそれはモデル単位でのバリデーションが指定できていないので、シリアライザを使用する場合で問題が発生すると思われる。

https://stackoverflow.com/questions/6195478/max-image-size-on-file-upload


