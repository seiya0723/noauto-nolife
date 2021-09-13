---
title: "【形態素解析】DjangoとJUMAN++を使ってトレンドワード(名詞のみ)を表示する【定期実行で1時間以内に投稿された内容を学習などに】"
date: 2021-09-13T19:42:36+09:00
draft: false
thumbnail: "images/Screenshot from 2021-09-13 20-23-43.png"
categories: [ "サーバーサイド" ]
tags: [ "django","AI","自然言語処理","JUMAN" ]
---

Djangoの独自コマンドの作成とAIを組み合わせることで、ウェブアプリ上でAIの恩恵を受けることができる。

とりわけ自然言語処理関係であれば、日本語の知識さえあれば簡単に試すことができるだろう。

本記事では形態素解析ツールとして名高い京都大学のJUMANをDjango上で動かし、その結果をウェブページとして表示させる。

## 作り方

### モデルを作る

トピックモデルとトレンドモデルの2つを作る。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
    
        def __str__(self):
            return self.comment
    
    
    class Trend(models.Model):
    
        class Meta:
            db_table = "trend"
    
        word    = models.CharField(verbose_name="トレンドワード",max_length=2000)
        count   = models.IntegerField(verbose_name="出現回数",default=0)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
    
        def __str__(self):
            return self.word


### ビューを作る

トレンドワードをクリックしたときの処理は検索と同様。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from django.db.models import Q
    
    from .models import Topic,Trend
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            context     = {}
    
            if "search" in request.GET:
                search      = request.GET["search"]
    
                if search == "" or search.isspace():
                    return redirect("bbs:index")
    
                search      = search.replace("　"," ").split(" ")
                searches    = [ w for w in search if w != "" ]
    
                query       = Q() 
                for w in searches:
                    query &= Q(comment__contains=w)
    
                #(4)作ったクエリを実行
                context["topics"]   = Topic.objects.filter(query)
            else:
                context["topics"]   = Topic.objects.all()
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("OK")
                form.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()
    
    class TrendView(View):
    
        def get(self, request, *args, **kwargs):
    
            context             = {}
            context["trends"]   = Trend.objects.all().order_by("-count")[:150]
    
            return render(request,"bbs/trend.html",context)
    
    trend   = TrendView.as_view()
    

### Djangoの独自コマンドを作る

ここがAIの部分。crontabなどから一定時間おきに実行すると良いだろう。

    from django.core.management.base import BaseCommand
    
    from ...models import Topic,Trend
    from ...forms import TrendForm

    from pyknp import Juman
    
    
    class Command(BaseCommand):
    
        def handle(self, *args, **kwargs):
            
            #トレンドモデルの初期化
    
            trends  = Trend.objects.all()
            trends.delete()
    
            # https://pyknp.readthedocs.io/en/latest/pyknp.juman.html
            #デフォルトでJuman++のオブジェクトが作られる。Jumanにしたい場合は、引数にjumanpp=Falseを指定。
            jumanpp = Juman()
    
            #TODO:ここで投稿されているトピックを調べる
            topics  = Topic.objects.all()
    
            for topic in topics:
    
                result  = jumanpp.analysis(topic.comment)
    
                for m in result.mrph_list():
    
                    if m.hinsi != "名詞":
                        continue
    
                    obj = Trend.objects.filter(word=m.midasi).first()
                    if obj:
                        obj.count += 1
                        obj.save()
                    else:
                        form    = TrendForm({"word":m.midasi,"count":1})
                        if form.is_valid():
                            form.save()
                

実行されるごとにトレンドモデルは全て削除される。ネストが深くなるので、条件に一致しなければ`continue`などを適宜。

もっとスマートな方法があると思うが、とりあえずJUMANを動かすテストなので。

## 実際に動かしてみる

実際に動かしてみる。著作権対策のため、青空文庫から太宰治の遺作、『グッド・バイ』(ルビなし)を転用した。

<div class="img-center"><img src="/images/Screenshot from 2021-09-13 20-23-43.png" alt=""></div>

## 結論

やはり、単に名詞だけで数をカウントしただけなので、AIとしては不十分である。『キヌ子』を『キヌ』と『子』で分割してしまっている。

新語や俗語に関しても、完全に対応できているわけではないので、さらに精度を上げるためにも、一部の文字列の前処理(いっぺんにを一ぺんにと書かれてあるなど)、単語間の関係を知るためのベクトル解析等を行う必要がある。

グッド・バイを全部解析するまでにおよそ1分。速度を考慮するのであれば、MeCabなどを使う手もあるだろう。

## ソースコード

https://github.com/seiya0723/bbs_trend_words



