---
title: "【Django】ユーザー作成時に何らかの処理を行う方法【saveメソッドオーバーライド】"
date: 2022-06-18T17:17:42+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


カスタムユーザーモデルを使用している時、ユーザーアカウント新規作成時に何らかの処理を行って欲しい場合。

そういう時はSignupFormのsaveメソッドをオーバーライドする。


## SignUpFormのコード

    from django.contrib.auth.forms import UserCreationForm
    from .models import CustomUser
    
    class SignupForm(UserCreationForm):
        class Meta(UserCreationForm.Meta):
            model   = CustomUser
            fields  = ("username")
    
    
        def save(self, request,  commit=True, *args, **kwargs):
    
            #ユーザーモデルのオブジェクト作成(ただし、保存をしない)
            user    = super().save(commit=False)
    
            #生のパスワードをハッシュ化した上で、モデルオブジェクトの属性にセットする。
            user.set_password(self.cleaned_data["password1"])
    
            #保存する
            if commit:
                user.save()

            #TODO:ここに任意の処理を追加する。
    
            return user



