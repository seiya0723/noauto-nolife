---
title: "【Django】OneToOneFieldでつながっているデータの取得方法【モデル名を小文字にした属性名で取得できる】"
date: 2022-01-10T14:03:08+09:00
lastmod: 2022-01-10T14:03:08+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け","アンチパターン" ]
---

OneToOneFieldを使う機会は限定されているので、備忘録として。

タイトルから既に(？)な状態かも知れないが、まずは、下記モデルを見てもらいたい。


    # 店舗データテーブル
    class StoreData(models.Model):
    
        class Meta:
            constraints = [
                models.UniqueConstraint(fields=["store","date"], name="unique_store_date"),
            ]

    
        store   = models.ForeignKey(Store,verbose_name="店舗",on_delete=models.CASCADE)
        date    = models.DateField(verbose_name="記録年月", validators=[check_day])
    
        def get_sale(self):
            return Sale.objects.filter(store_data=self.id) 
    
    #売上テーブル
    class Sale(models.Model):
    
        pc          = models.IntegerField(verbose_name="PC"     , validators=[MinValueValidator(0)])
        phone       = models.IntegerField(verbose_name="スマホ" , validators=[MinValueValidator(0)])
        app         = models.IntegerField(verbose_name="アプリ" , validators=[MinValueValidator(0)])
        store_data  = models.OneToOneField(StoreData, verbose_name="データ", on_delete=models.CASCADE)
    


Saleモデルオブジェクトから見たら、StoreDataに紐付いているモデルオブジェクトを取り出すには、こうすれば良い。

    sale        = Sale.objects.all().first()
    sale.store_data

では、StoreDataのモデルオブジェクトから見て、Saleに紐付いているモデルオブジェクトを取り出すにはどうしたら良いか。答えはこうすれば良いのだ。

    store_data  = StoreData.objects.all().first()
    store_data.sale

そう、モデルオブジェクトを小文字にすれば良い。ちなみに、SaleAmountなどのキャメルケースになっている場合。コレも同様に

    store_data.saleamount

とすることで、紐付いているモデルオブジェクトの取得ができる。

だから、下記のようにわざわざモデルメソッドを作る必要はない。

    # 店舗データテーブル
    class StoreData(models.Model):
    
        #対象店舗と年月で重複した記録を許さない場合、このようにUniqueConstraintを使う。
        class Meta:
            constraints = [
                models.UniqueConstraint(fields=["store","date"], name="unique_store_date"),
            ]
    
        store   = models.ForeignKey(Store,verbose_name="店舗",on_delete=models.CASCADE)
        date    = models.DateField(verbose_name="記録年月", validators=[check_day])
    
        def get_sale(self):
            return Sale.objects.filter(store_data=self.id)
    
