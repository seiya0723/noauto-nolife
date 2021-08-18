---
title: "DjangoでDBへデータ格納時(save)、削除時(delete)に処理を追加する【models.py、forms.py、serializer.pyのメソッドオーバーライド】"
date: 2021-08-07T16:20:24+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","tips" ]
---


例えば、クライアントがお問い合わせフォームに入力して送信した時、DBに内容を保存すると同時に管理者に内容をメールで送信したい。そんなことは無いだろうか？

しかも、その保存のビューの処理が各所に分散していて、一つ一つ書いていくのが面倒な時。こういう時はモデルクラスのsaveメソッドを書き換える(オーバーライドする)ことで対処できる。


## オーバーライドの方法

[公式](https://docs.djangoproject.com/en/3.2/topics/db/models/#overriding-predefined-model-methods)からコードを拝借。


`models.py`にて、下記のようにすれば、saveメソッドをオーバーライドできる。

    from django.db import models
    
    class Blog(models.Model):
        name = models.CharField(max_length=100)
        tagline = models.TextField()
    
        def save(self, *args, **kwargs):
            do_something()
            super().save(*args, **kwargs)  # Call the "real" save() method.
            do_something_else()

下記`views.py`にて、モデルオブジェクトが`.save()`を実行する時、`do_something()`、実行した後`do_something_else()`が実行される。

    from .models import Blog

    =====中略=====

        blog    = Blog(name="test",tagline="test")
        blog.save() #←ここでsaveメソッドのオーバーライドした内容が実行される。
    

ちなみに、Djangoのモデルを継承したフォームクラスは、saveメソッドの内容を継承する事ができる。そのため、モデルを継承したフォームクラスの場合、下記でもsaveメソッドでオーバーライドした内容が発動する。

    from .forms import BlogForm

    =====中略=====

        blog    = BlogForm(request.POST)

        if blog.is_valid():
            blog.save() #←ここでsaveメソッドのオーバーライドした内容が実行される。


## クライアントがお問い合わせした時、メール送信するには？

以上を踏まえると、冒頭の答えはこうなる。


    from django.db import models
    
    class Contact(models.Model):

        name    = models.CharField(verbose_name="名前",max_length=100)
        content = models.CharField(verbose_name="内容",max_length=300)
    
        def save(self, *args, **kwargs):

            super().save(*args, **kwargs)
            #TODO:ここでメール送信処理。


メールの送信方法に関しては[DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】](/post/django-sendgrid/)を参考に。

    
## saveメソッドのオーバーライドで別モデルにデータ保存する時の注意点

ここで、お問い合わせをすると同時に、別のモデルクラスに何か値を入れたい時、どうすれば良いだろうか？

当然であるが、`forms.py`が`models.py`をインポートする関係にある状態で、同時に`models.py`が`forms.py`をインポートすることはできない。

そのため、下記のような`models.py`は動作しない。

    from django.db import models
    #from .form import ContactLogForm #←ここでCannot import Errorが出る。
    
    class Contact(models.Model):

        name    = models.CharField(verbose_name="名前",max_length=100)
        content = models.CharField(verbose_name="内容",max_length=300)
    
        def save(self, *args, **kwargs):

            #参照はこのようにしてできる。
            print(self.name)
            print(self.content)

            """
            #import Errorであるため、そもそもここは実行されない
            form    = ContactLogForm({"name":self.name,"contact":self,contact})
            if form.is_valid():
                form.save()
            """

            super().save(*args, **kwargs)


そこで、`forms.py`のフォームクラスのsaveメソッドをオーバーライドする。後続に書いてあるフォームクラスでも、下記のように呼び出すことができる。

ここでフォームクラスの場合、`self.clean()`である点に注意。返却値は辞書型であるため、個別にフィールドの値を参照したい時は、フィールド名をキーにする。

    from django import forms
    from .models import Contact,ContactLog

    class ContactForm(forms.ModelForm):

        class Meta:
            model   = Contact
            fields  = [ "name","content" ]

        def save(self, *args, **kwargs):

            form    = ContactLogForm(self.clean())
            if form.is_valid():
                print("バリデーションOK、ログに保存する。")
                form.save()


            super().save(*args, **kwargs)

    class ContactLogForm(forms.ModelForm):

        #===省略=======

ちなみに、このモデルを継承したフォームクラスはモデルでオーバーライドしたsaveメソッドを継承しているので、saveメソッドを実行したときの処理結果はこうなる。

    バリデーションOK、ログに保存する。  #print("バリデーションOK、ログに保存する。")
    name                                #print(self.name)
    contact                             #print(self.content)
    
実行される順序に注意。

## deleteメソッドのオーバーライド

削除した時に何かしらを実行したいということもあるだろう。そういう時は`delete`メソッドをオーバーライドすれば良い。

書き方はsaveメソッドと全く同じ。

    from django.db import models
    
    class Blog(models.Model):
        name = models.CharField(max_length=100)
        tagline = models.TextField()
    
        def delete(self, *args, **kwargs):
            do_something()
            super().delete(*args, **kwargs)  # Call the "real" delete() method.
            do_something_else()

## DjangoRESTframeworkのSerializerはどうなる？

`serializer.py`もモデルを継承したものであれば、モデルにsaveメソッドを書けばそのまま継承してくれるだろうと思ったら大間違い。

DjangoRESTframeworkのSerializerクラスにはこの方法は通用しない。モデルのsaveメソッドをオーバーライドしたとしても、モデルを継承したシリアライザのsaveメソッドはモデルのsaveメソッドまで継承していない。


モデルを継承したシリアライザで、saveメソッドをオーバーライドしたい場合は、下記のようにシリアライザクラスにsaveメソッドをオーバーライドする。`forms.py`と違って、`.clean()`ではなく`.validated_data`から参照する点に注意。

    from rest_framework import serializers
    from .models import Contact

    class ContactSerializer(serializers.ModelSerializer):
    
        class Meta:
            model  = Contact
            fields = [ "name","content" ]
    
    
        def save(self, *args, **kwargs):

            print(self.validated_data["name"])
            print(self.validated_data["content"])
    
            super().save(*args, **kwargs)

実行した結果。

    name #print(self.validated_data["name"])
    contact #print(self.validated_data["content"])

    #====models.pyに書いた内容は実行されない=====

このようにサードパーティー製のDjangoRESTframeworkのSerializerクラスはDjango公式のFormクラスと違って継承の関係が独自であるため、JSON等をそのまま解釈してバリデーションできるメリットこそあれ、常用するのは避けたほうが良いかも知れない。

## 新規作成時にオーバーライドした内容を実行して、編集した時は実行したくない

新規作成したときだけオーバーライドした内容を実行したい時、下記のように`instance`を参照すれば良い。

まず、`views.py`。下記はinstanceに対してdicに含まれている内容で編集を行う。

    #======省略============

        instance        = Contact.objects.filter(id=1).first()
        form            = ContactForm(dic,instance=instance)

        if form.is_valid():
            form.save()


この状態の時、フォームクラスにはinstance属性にはモデルオブジェクトが付与されている。だから、この値を元に条件分岐を行えば良いだけ。

    from django import forms
    from .models import Contact,ContactLog

    class ContactForm(forms.ModelForm):

        class Meta:
            model   = Contact
            fields  = [ "name","content" ]

        def save(self, *args, **kwargs):

            #self.instanceがNoneとき(つまり新規作成のとき)に後続の内容を実行する。
            if not self.instance:

                form    = ContactLogForm(self.clean())
                if form.is_valid():
                    print("バリデーションOK、ログに保存する。")
                    form.save()

            super().save(*args, **kwargs)

    class ContactLogForm(forms.ModelForm):

        #===省略=======


このinstanceによる編集と新規作成の条件分岐はSerializerクラスでも有効。


## 結論

これで常にビュー側がsaveやdeleteメソッドを実行するたびに、必ず指定した処理を行うことができる。

複数のビューからモデルクラスを呼び出して保存や削除をした後に、処理を書いているようでは書き損じたりコードが長くなってしまうので、これにより大幅にコードが見やすくなりミスも減ると思われる。

注意するべきは、saveやdeleteのメソッドを実行した時、別のモデルクラスにデータを保存するなどする時。オブジェクト指向の基本であるimportの関係、継承の関係を意識して正しくオーバーライドを行いたいところだ。

また、DjangoRESTframeworkのSerializerはモデルを継承したSerializerでも、saveメソッドまでは継承していない。オーバーライドを行うのであればSerializerクラスへ行う。


この継承関係を図に示すとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-08-14 10-53-48.png" alt="継承関係"></div>

図のようにモデルを継承したシリアライザは、モデルのsaveメソッドまで継承しない。


