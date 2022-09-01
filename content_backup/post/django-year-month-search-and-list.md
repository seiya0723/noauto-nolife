---
title: "【Django】年月検索と、年別、月別アーカイブを表示させる【最新と最古のデータから年月リストを作成(Trunc不使用)】"
date: 2021-12-25T20:57:33+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-25 21-39-54.png"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け" ]
---

Djangoで月別アーカイブと年月計算を実装させる

元となったコードは[40分Django](/post/startup-django/)にモデルへ投稿日を記録するフィールド(`dt`)を追加している。

## forms.py

    from django import forms
    from django.core.validators import MinValueValidator,MaxValueValidator
    
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model = Topic
            fields = ["comment"]
    
    #モデルを使用しないフォームクラス
    class YearMonthForm(forms.Form):
        year    = forms.IntegerField()
        month   = forms.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(12)])


モデルを使用しないフォームクラスで年と月を数値型で受け取る。月は1から12までの数値なので、validatorsで追加の制約を付与する。

    
## views.py

年月別アーカイブのリストを表示させる。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm,YearMonthForm
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
    
            form    = YearMonthForm(request.GET)
            if form.is_valid():
                cleaned = form.clean()
    
                context["topics"]    = Topic.objects.filter(dt__year=cleaned["year"],dt__month=cleaned["month"]).order_by("-dt")
            else:
                context["topics"]    = Topic.objects.order_by("-dt")
    
            #月別アーカイブの表示
            #最新と最古のデータを手に入れる。
            newest  = Topic.objects.order_by("-dt").first()
            oldest  = Topic.objects.order_by("dt").first()
    
            year_month_list = []
    
            if newest and oldest:
    
                newest_dt   = newest.dt
                now_year    = oldest.dt.year
                now_month   = oldest.dt.month
    
                #最古から1ヶ月ずつずらして最新になったら終わり
                while True:
                    year_month          = {}
                    year_month["link"]  = "?year=" + str(now_year) + "&month=" + str(now_month)
                    year_month["label"] = str(now_year) + "年" + str(now_month) + "月"
    
                    copied              = year_month.copy()
    
                    year_month_list.append(copied)
    
                    if now_month >= newest_dt.month and now_year >= newest_dt.year:
                        break
                    else:
                        if now_month == 12:
                            now_year += 1
                            now_month = 1
                        else:
                            now_month += 1
    
            context["year_month_list"]  = year_month_list
    
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
            
            if form.is_valid():
                form.save()
    
            print(form.errors)
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


先ほどのフォームクラスのYearMonthFormで年月をバリデーション。正しく年月指定されていれば年月で検索をする。

年月のリスト作成は最古から最新に向かって1ヶ月ずつずらす。それをリストにアペンドしていき、できあがった年月のリストをテンプレートでループさせる。

## index.html

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
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            <div class="row">
                <div class="col-8">
                    {% for topic in topics %}
                    <div class="border">
                        <div>{{ topic.dt }}</div>
                        <div>{{ topic.comment }}</div>
                    </div>
                    {% endfor %}
                </div>
                <div class="col-4">
                    {% for year_month in year_month_list %}
                    <div><a href="{{ year_month.link }}">{{ year_month.label }}</a></div>
                    {% endfor %}
                </div>
            </div>
    
        </main>
    </body>
    </html>
    
## 動かすとこうなる。

selectタグで表現することも可能だが、あえてリンクタグを箇条書きにさせた。

<div class="img-center"><img src="/images/Screenshot from 2021-12-25 21-39-54.png" alt="年月別表示"></div>

Pythonの場合、pandasを使えば楽に実装できるが、他言語でも実現できるようあえてアルゴリズムを残した。

## 結論

複雑なアルゴリズムはともかく、年月別に集計してリンクを作りたいだけであれば、下記の記事でも実現はできる。

[【Django】年、月、日単位でデータをファイリングする時はTruncを使用する【月ごとの売上、個数などの出力に有効】](/post/django-models-trunc/)

## ソースコード

https://github.com/seiya0723/year_month_list

