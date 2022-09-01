---
title: "【Django】ファイルアップロード時にファイル名をリネーム(改名)する"
date: 2022-05-13T17:18:16+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

方法論として、2つある。ビューから書き換える方法と、モデルに独自のバリデーションを仕込む方法の2つである。

## ビューからファイル名を書き換える

`request.FILES["image"].name`から書き換えができる。

    request.FILES["image"].name = "test.png"
    form    = TopicForm(request.POST,request.FILES)

    # 以下略 #


request.POSTに対しては書き換えできないが、何故かFILESに対しては書き換えできる。

もしちょっと気持ち悪いなと思う場合は下記にすると良いだろう。


    f_copied                = request.FILES.copy()
    f_copied["image"].name  = "test.png"

    form    = TopicForm(request.POST,f_copied)

    # 以下略 #


## 独自バリデーションからファイル名を書き換える


モデルのvalidatorsにファイル名を書き換える独自バリデーションを追加する。

ファイル名を書き換えるだけなので、もはやバリデーションとは言わないだろうが。


    def rename(value):
        value.name  = "test.png"

    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        image       = models.ImageField(verbose_name="画像",upload_to="bbs/topic/image/",null=True,blank=True,validators=[rename])


こちらの方法であれば、長々とビューに処理を追加する必要はなくなるだろう。

ただ、validatorsの本来の役割から考えると、このやり方は疑問符がつく。
    

## 結論

ちなみに、いずれも`upload_to`は考慮されるので全く問題はない。

ファイル名を書き換えるだけとは言え、いずれもややぎこちない感じがするので、最適解みたいなものがあれば追記する予定。
    
