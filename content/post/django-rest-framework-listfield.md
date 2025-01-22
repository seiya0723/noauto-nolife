---
title: "【DRF】Django Rest Frameworkでリスト型のバリデーションも行う【UUIDや文字列を格納したリスト型のバリデーションに】"
date: 2021-12-14T15:04:59+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

例えば、Ajaxを使用して複数選択削除を行いたい場合、idもしくはuuidのリスト型をサーバーサイドに送信することになるだろう。

そういう時、DjangoRESTFramework(以下DRF)のシリアライザを使用すると良いだろう。

## UUIDを含むリスト型をバリデーションする

    #複数選択削除で利用
    class UUIDListSerializer(serializers.Serializer):
    
        id_list = serializers.ListField( child=serializers.UUIDField() )
    
これで実現できる。


## DjangoのFormクラスで実現させる場合。

リスト型で送られてくるデータの参照は、

    request.POST.getlist("key")

などで参照しなければならないため、ループで1つずつバリデーションしなければならない。

つまり、

    class UUIDForm(forms):
        uuid    = forms.UUIDField()

    uuid_list   = request.POST.getlist(uuid)

    for uuid in uuid_list:
        form    = UUIDForm({ "uuid":uuid })
        if form.is_valid():
            print("バリデーションOK")
            #TODO:ここにやりたい処理を書く


とする必要がある。デフォルトのDjangoのFormクラスでは一回でバリデーションが済まない。


