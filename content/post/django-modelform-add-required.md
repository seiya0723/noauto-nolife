---
title: "【Django】モデルを使用したフォームクラスで、required属性を付与する"
date: 2022-10-27T16:04:06+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Python","上級者向け" ]
---


モデルを使用したフォームクラスは、モデルの制約に依存する。

そのため、モデルの制約がゆるくても、フォームクラスで引き締めたい場合、別途対策が必要になる。

## フォームクラスにrequired属性を付与する


    class TopicCategoryForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "category" ]
        
        #TODO:categoryの入力を必須化させる
        def __init__(self, *args, **kwargs):
            super(TopicCategoryForm, self).__init__(*args, **kwargs)
            self.fields['category'].required = True
    

コンストラクタをオーバーライドすれば良いそうだ。


参照元: https://stackoverflow.com/questions/44810064/form-required-field-in-django-model-forms


