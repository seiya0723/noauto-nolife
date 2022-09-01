---
title: "Djangoのモデルにて指定された選択肢をセットし、それだけ入力を許可する【choicesフィールドオプションで都道府県の指定をする】"
date: 2022-02-11T08:18:35+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

例えば、都道府県の指定、どうやってモデルに格納するか。都道府県は47個。これ以外の物を選ぶことはできない。

故に、CharFieldを使用して、都道府県の格納先のフィールドを作るのは、間違っているわけではないが、あまりスマートではない。

そこで、フィールドオプションのchoicesを使用して、特定の選択肢のみ入力を許可する。

## 【前提】settings.py

settings.pyにて、都道府県の名前を定義しておく。

    #都道府県のリストを作る(値,ラベル)
    PREFECTURES = [ 
        ("北海道"  ,"北海道"  ),  
        ("青森県"  ,"青森県"  ),  
        ("岩手県"  ,"岩手県"  ),  
        ("宮城県"  ,"宮城県"  ),  
        ("秋田県"  ,"秋田県"  ),  
        ("山形県"  ,"山形県"  ),  
        ("福島県"  ,"福島県"  ),  
        ("茨城県"  ,"茨城県"  ),  
        ("栃木県"  ,"栃木県"  ),  
        ("群馬県"  ,"群馬県"  ),  
        ("埼玉県"  ,"埼玉県"  ),  
        ("千葉県"  ,"千葉県"  ),  
        ("東京都"  ,"東京都"  ),  
        ("神奈川県","神奈川県"),
        ("新潟県"  ,"新潟県"  ),  
        ("富山県"  ,"富山県"  ),  
        ("石川県"  ,"石川県"  ),  
        ("福井県"  ,"福井県"  ),  
        ("山梨県"  ,"山梨県"  ),  
        ("長野県"  ,"長野県"  ),  
        ("岐阜県"  ,"岐阜県"  ),  
        ("静岡県"  ,"静岡県"  ),  
        ("愛知県"  ,"愛知県"  ),  
        ("三重県"  ,"三重県"  ),  
        ("滋賀県"  ,"滋賀県"  ),  
        ("京都府"  ,"京都府"  ),  
        ("大阪府"  ,"大阪府"  ),  
        ("兵庫県"  ,"兵庫県"  ),  
        ("奈良県"  ,"奈良県"  ),  
        ("和歌山県","和歌山県"),
        ("鳥取県"  ,"鳥取県"  ),  
        ("島根県"  ,"島根県"  ),  
        ("岡山県"  ,"岡山県"  ),  
        ("広島県"  ,"広島県"  ),  
        ("山口県"  ,"山口県"  ),  
        ("徳島県"  ,"徳島県"  ),  
        ("香川県"  ,"香川県"  ),  
        ("愛媛県"  ,"愛媛県"  ),  
        ("高知県"  ,"高知県"  ),  
        ("福岡県"  ,"福岡県"  ),  
        ("佐賀県"  ,"佐賀県"  ),  
        ("長崎県"  ,"長崎県"  ),  
        ("熊本県"  ,"熊本県"  ),  
        ("大分県"  ,"大分県"  ),  
        ("宮崎県"  ,"宮崎県"  ),  
        ("鹿児島県","鹿児島県"),
        ("沖縄県"  ,"沖縄県"  ),  
    ]

この都道府県データを`models.py`が呼び出す。

## モデル

フィールドオプションとして、choicesを指定する。settings.pyの内容をimportして指定。

    from django.db import models
    from django.conf import settings 
    
    class Topic(models.Model):
    
        #都道府県の選択肢をchoicesオプションにてセット
        prefecture  = models.CharField(verbose_name="都道府県",choices=settings.PREFECTURES,max_length=4)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

    
## フォーム

モデルを継承したフォームクラスを作る。


    from django import forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "prefecture","comment" ]

    
## ビュー

テンプレートでは、selectタグで都道府県を選べるようにしておかなければならない。

そのためには、モデルのprefectureフィールドのchoicesオプションで指定した内容でリストを作り、contextとして引き渡す必要がある。

今回は、ラベルも値も同じ県名なので値だけ抜き取ってリストの内包表記。都道府県のリストをcontextに与えてレンダリングさせる。


    from django.shortcuts import render,redirect
    
    from django.views import View
    
    from .models import Topic
    from .forms import TopicForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            context             = {}
            context["topics"]   = Topic.objects.all()
    
            #選択肢のデータを手に入れる(都道府県文字列のリストを作る。リストの内包表記)
            context["prefectures"]  = [ p[0] for p in Topic.prefecture.field.choices ]
    
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


views.pyからmodels.pyのフィールドオプションの値を参照するには、下記記事を参照。

[Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】](/post/django-reference-models-option/)

## テンプレート

ビューから受け取った都道府県のリストを使ってselectタグをレンダリングする。


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <select name="prefecture">
                    {% for prefecture in prefectures %}
                    <option value="{{ prefecture }}">{{ prefecture }}</option>
                    {% endfor %}
                </select>
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.prefecture }}</div>
                <div>{{ topic.comment }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>
    

## 動かすとこうなる。

都道府県のselectタグが作られ、選択できる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-10 08-57-45.png" alt=""></div>

## 結論

このchoicesフィールドオプションは国や地域、所属の指定などにも応用できるだろう。


参照元:https://docs.djangoproject.com/en/4.0/ref/models/fields/#django.db.models.Field.choices


### 【別解】1対多で都道府県モデルとリレーションを組むのはダメなのか？

都道府県モデルを作って、1対多のフィールドを作れば良い。そういう意見もあるだろう。

だが、都道府県のような、そう簡単に増えたり減ったり、名前が変わったりすることがない物を、モデルとして定義し、そこにデータを格納しても良いのだろうか、と思う。

もちろん、データを予め作っておき、DBにリストアしてしまえば選択はできる。しかし、都道府県のデータはDBに保存するべきであろうか？

オンプレミスならともかく、クラウドであればDBの利用制限(※例えばHerokuであれば無料プランで10000行までレコードの挿入)がある。少しでもDBの使用量は減らしたい。そういう場合には有効であると思う。

一方で、1対多の場合はモデルを作ることになるので、例えば、都道府県のルビやローマ字表記等を実装したい場合、今回のchoicesフィールドオプションでは間に合わない。その場合は1対多のほうが良いだろう。

よって、以下の使い分けが考えられる。

- ローマ字表記、ルビ、地域コードなどの別の表記を複数用意したい場合は、1対多
- DBを消費せずに選択肢から何かを選んで欲しい場合は、choices

ただ、国際宅配便などに使用する地域の指定は、ただの文字列入力にしたほうが良いと思う。配送先の選択肢の量が尋常ではないので。





