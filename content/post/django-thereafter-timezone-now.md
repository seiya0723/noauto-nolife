---
title: "Djangoで現在時刻以降の日時入力を促すのであれば、MinValueValidatorとMaxValueValidatorを使用する【DateTimeFieldで予約システム開発に】"
date: 2022-02-07T07:28:47+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け" ]
---

予約システムなどでは、指定した日時以降の日時を入れてもらう必要がある。

入力できる日時にフロント側で制限をかけることができれば良いが、それだけでは限界がある。

そこで、Djangoではmodelsのフィールドオプションである`validators`を使用することで、指定した日時以降の日時だけを入力できるようになる。

## MinValueValidatorsで現在時刻以降の日時入力をさせる

モデルはこうかけばよい。

    from django.db import models
    
    from django.utils import timezone
    from django.core.validators import MinValueValidator
    
    class Topic(models.Model):
    
        deadline    = models.DateTimeField(verbose_name="期日", validators=[MinValueValidator(timezone.now)])
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment


forms.pyには、モデルを継承したフォームクラスを作る


    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = ["deadline","comment"]
    

そしてビューはフォームクラスをimportしてバリデーションするだけ。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


これで現在時刻以降の日時入力をさせることができる。

つまり、MinValueValidator、MaxValueValidatorはいずれも数値だけでなく、日時や日付などの型も入力することができるということだ。

これを使うことで、指定した日時だけの予約の入力を許可する事ができる。いたずらで10年後の予約とかされることもなくなるだろう。

`unique=True`もセットすれば、予約のブッキングも防ぐことができる。

後は、日付の入力をしやすくするために、[flatpickr](/post/flatpickr-install/)を使用すればユーザーフレンドリーな予約サイトの完成である。


## 2日後以降の入力を許すには？


下記でOK。これで現在時刻から2日以上たった日時しか受け付けない。

    from django.db import models
    
    from django.utils import timezone
    from django.core.validators import MinValueValidator
    
    class Topic(models.Model):
    
        def test_dt():
            return timezone.now() + timezone.timedelta(days=2)
    
        deadline    = models.DateTimeField( verbose_name="期日", validators=[ MinValueValidator( test_dt ) ] )
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
            
        def __str__(self):
            return self.comment

`test_dt`はメソッドとして扱われない。関数として扱われる。そのため、上記の`test_dt`には引数としてselfを入れてはならない。

この関数は、クラスの外に出しても機能はする。


    from django.db import models
    
    from django.utils import timezone
    from django.core.validators import MinValueValidator
    
    def test_dt():
        return timezone.now() + timezone.timedelta(days=2)
    
    class Topic(models.Model):
    
        deadline    = models.DateTimeField( verbose_name="期日", validators=[ MinValueValidator( test_dt ) ] )
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
            
        def __str__(self):
            return self.comment


## 他のvalidatorsフィールドの解説記事

- [【Django】モデルフィールドに正規表現によるバリデーションを指定する【カラーコード・電話番号に有効】](/post/django-models-regex-validate/)
- [Djangoでpython3のsubprocessモジュールを使い、任意のコマンドをなるべく安全に配慮して実行させる](/post/django-secure-subprocess/)
- [【Django】年月検索と、年別、月別アーカイブを表示させる【最新と最古のデータから年月リストを作成(Trunc不使用)】](/post/django-year-month-search-and-list/)

validatorsを使用すれば、受け付ける値に正規表現などが利用できる。これで正確に電話番号や郵便番号、ISBNなどの入力ができる。



