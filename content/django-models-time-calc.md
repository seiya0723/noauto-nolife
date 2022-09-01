---
title: "【Django】モデルに計算可能な時間を記録する【勉強時間・筋トレ時間の記録系ウェブアプリの作成に】【DurationField】"
date: 2022-08-13T14:44:47+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","models","上級者向け","追記予定" ]
---

例えば、勉強時間や筋トレ時間を記録するウェブアプリを作るとする。

この時に、ネックになるのが、時間を記録するモデルフィールド。

IntegerFieldで記録するべきか、DatetimeFieldでtimedeltaを使うか。

いずれにせよ、合計や平均などを出さないといけないので、このフィールド選択を間違えると後々大変なことになる。

フォームの形式も考慮する必要がある。

そこで、本記事では、時間を記録する方法の最適解に近づけるよう考察する。

## 方法論と問題点

|方法論|問題点|
|:--:|:--:|
|開始時刻と終了時刻をDateTimeFieldで記録する|途中休憩を挟むことができない、休憩を挟むたびにレコードが入る|
|実行時間をIntegerFieldで記録する|時間の計算をする必要がある。単位をミリ秒とするか、秒とするかで揉める|
|timedelta型のDurationFieldを使う|計算は簡単だが、テンプレートの表示にも問題あり|


### DurationFieldとは？

秒単位でもフォーマット(時間:分:秒)でも指定可能なフィールド。datetime.timedelta型に変換してくれる。

DurationFieldはtimedelta型なので、計算処理は楽だ(平均、合計も簡単に出せる)。

だが、テンプレートの表示に問題がある。

<div class="img-center"><img src="/images/Screenshot from 2022-08-13 17-21-03.png" alt=""></div>

これさえどうにかなれば、DurationFieldを採用すると言う選択肢はアリだと思う。Stackoverflowで検索したところ、どうやらカスタムテンプレートタグしか選択肢はないようだ。

https://stackoverflow.com/questions/33105457/display-and-format-django-durationfield-in-template

上記サイトのカスタムテンプレートタグを使うことで解決できる。



#### モデルメソッドを使って表記を変える。

モデルメソッドを使って表現することもできる。カスタムテンプレートタグを使いたくない場合はこちらが良いだろう。


    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        time        = models.DurationField(verbose_name="トレーニング時間")
    
        #DurationFieldの表示
        def time_format(self):
            total   = int(self.time.total_seconds())
    
            hours   = total // 3600
            minutes = (total % 3600) // 60
            seconds = (total % 60)
    
            return '{}時間{}分{}秒'.format(hours, minutes, seconds)
    

<div class="img-center"><img src="/images/Screenshot from 2022-08-17 13-38-44.png" alt=""></div>


#### ビューにて`.aggregate(Sum("time"))`を使う。


    from django.shortcuts import render,redirect
    
    from django.views import View
    from django.db.models import Sum
    
    from .models import Topic
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context             = {}
            context["topics"]   = Topic.objects.all()
    
            #集計とフォーマット作成
            topics  = Topic.objects.all().aggregate(Sum("time"))
            
            if topics["time__sum"]:

                total   = int(topics["time__sum"].total_seconds())
        
                hours   = total // 3600
                minutes = (total % 3600) // 60
                seconds = (total % 60) 
        
                context["total"]    = "{}時間{}分{}秒".format(hours, minutes, seconds)
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


<div class="img-center"><img src="/images/Screenshot from 2022-08-17 13-47-10.png" alt=""></div>


<!--
#### DurationFieldをオーバーライドする(現在検討中)

`models.DurationField()`をオーバーライドすることで、その挙動を書き換える事ができると思われる。

モデルに作ってしまえば、後は属性名を指定するだけなので、上記2つよりも更にコードを減らすことができるだろう。

コードを短く、見た目も良く仕立てたい場合、カスタムテンプレートタグに比べて遥かに効果的ではある。



とは言え、ここまで来ると、ミリ秒単位で記録することもできるIntegerFieldとの優位性が揺らぐと思う。

-->




## 結論

~~カスタムテンプレートタグが使える環境下であれば、DurationFieldを採用すると良いだろう。~~

~~カスタムテンプレートタグが使えない環境下であれば、IntegerFieldかDateTimeFieldしか選択肢はない。~~

と思っていたが、カスタムテンプレートタグはなくても表現する方法はいくらでもあるようだ。

考慮した結果、ミリ秒単位以下で記録をしたい場合はIntegerField()

秒単位で記録をしたい場合はDurationField()という結論が得られた。





