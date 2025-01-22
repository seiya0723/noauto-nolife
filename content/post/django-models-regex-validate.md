---
title: "【Django】モデルフィールドに正規表現によるバリデーションを指定する【カラーコード・電話番号に有効】"
date: 2021-01-26T16:40:18+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","正規表現" ]
---


例えば、Djangoで電話番号や16進数カラーコード、郵便番号や金融機関コードなどの、桁数と使用文字の種類が決まったデータをモデルフィールドに挿入する時、どうしていますか？

CharFieldやIntegerFieldにそのまま入れる？フロント側で対策しているから大丈夫？そんなわけない。不適切なデータがDBに入った時点で、システムは破綻する。それは世の常。

そこで、本記事ではモデルに正規表現のバリデーションを実装させることで、DBに不適切なデータを挿入させないようにする方法を解説する。

## models.pyにRegexValidatorを実装

`django.core.validators.RegexValidator`を使用する。以下、`models.py`のコード。名前とテーマカラーを記録するモデルクラスである。

    from django.db import models
    from django.core.validators import RegexValidator
    
    class Profile(models.Model):
        class Meta:
            db_table    = "profile"
    
        id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        name        = models.CharField(verbose_name="名前",max_length=50)
    
        color_regex = RegexValidator(regex=r'^#(?:[0-9a-fA-F]{3}){1,2}$')
        color       = models.CharField(verbose_name="テーマ色",max_length=7,validators=[color_regex],default="#000000")
    
        def __str__(self):
            return self.name
    
`color_regex`はただの正規表現バリデーションが入った変数。正規表現はカラーコードを意味する#から始まり、16進数を意味する0~9とa~f(A~F)までの値が3つか6つ続く文字列を判定する。

`color`は文字列型フィールドに、バリデーションとして`color_regex`を採用している。`validators`属性にリスト型として正規表現を与える。

後はこれをマイグレーションしてDBに反映させる。これだけでカラーコードに合致するデータのみをDBに記録してくれる。

## 結論

ちなみに、IPアドレスは正規表現なんて使わなくても、専用の`GenericIPAddressField`なるものがある。IPv4とIPv6両対応なので正規表現には真似できない。公式リファレンスに書かれてある。

https://docs.djangoproject.com/en/3.1/ref/models/fields/#genericipaddressfield

また、EmailFieldなんてものもある。

https://docs.djangoproject.com/en/3.1/ref/models/fields/#emailfield
