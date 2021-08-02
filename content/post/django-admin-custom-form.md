---
title: "Djangoの管理サイトのフォームをカスタムする【forms.py】"
date: 2021-07-31T15:57:27+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け" ]
---

管理サイトのフォームはとりわけ何もしなければ、registerするモデルフィールドに依存する。

つまり、`CharField`の場合、`input`タグ`type="text"`が自動的に管理画面のフォームに挿入される。

そのため、何もしなければフィールドオプションが`max_length=2000`でも1行のテキストボックスでしか入力できない。

<div class="img-center"><img src="/images/Screenshot from 2021-08-01 16-49-23.png" alt="テキストボックスで入力しにくい、改行出来ない"></div>

改行もできなければ全体を確認することも困難な管理画面のフォームを使いたいと思う人はいない。だからこそ、ここでフォームをカスタムさせ、使いやすくさせる。


## forms.pyに管理画面で使う専用のフォームクラスを定義


まずは管理画面で使う専用のフォームクラスを定義する。


    from django import forms
    from .models import Topic

    class TopicAdminForm(forms.ModelForm):

        class Meta:
            model   = Topic
            fields  = [ "title","comment","dt" ]
    

        comment     = forms.CharField(  widget  = forms.Textarea( attrs={ "maxlength":str(Topic.comment.field.max_length), } ),
                                        label   = Topic.comment.field.verbose_name 
                                        )
    

入力可能な最長文字列はモデルから参照、フォームのとなりに表示させるラベルも同様にモデルから参照。


## admin.pyから呼び出す

下記のように呼び出す。


    from django.contrib import admin
    
    from .models import Topic
    from .forms import TopicAdminForm
    
    class TopicAdmin(admin.ModelAdmin):
    
        #textareaを表示させるフォームクラスを指定。
        form            = TopicAdminForm
    
    admin.site.register(Topic,TopicAdmin)


## そしてこうなる

before

<div class="img-center"><img src="/images/Screenshot from 2021-08-01 16-49-23.png" alt="テキストボックスで入力しにくい、改行出来ない"></div>

after

<div class="img-center"><img src="/images/Screenshot from 2021-08-01 16-47-57.png" alt="テキストエリアが表示された。"></div>


## 結論

これで管理サイトがさらに使いやすくなった。

maxlength属性とlabelはモデルのフィールドオプションから参照する仕掛けにしておけば、モデルが書き換わっても即対応できる。

ちなみに、今回のフォームクラスは`list_editable`で表示されるフォームとは関連していないので注意。
