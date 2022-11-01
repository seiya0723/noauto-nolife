---
title: "【Django】sympyで計算した結果をLatex記法でHTML上に出力、mathjaxを使って数式を表示"
date: 2022-10-30T15:01:30+09:00
lastmod: 2022-10-30T15:01:30+09:00
draft: false
thumbnail: "images/Screenshot from 2022-10-30 15-26-47.png"
categories: [ "サーバーサイド" ]
tags: [ "Pythonライブラリ","JavaScriptライブラリ","Django","Latex","Python","JavaScript" ]
---

Pythonには高度な計算を行う事ができるライブラリが充実している。

それを、端末を問わずに利用できるようにするには、Pythonをウェブアプリとして動作させる必要がある。つまり、Djangoを使うことになる。

だが、指数や対数、平方根などを、通常の文字列だけでHTML上に表現するには限界がある。

そこで、Latexの文字列を数式として表現できるmathjaxを使うことにした。

Djangoはいつもの[40分Django](/post/startup-django/)から流用して作る


## 使用したライブラリ

```
Python 3.8.10
```

```
asgiref==3.5.2
backports.zoneinfo==0.2.1
Django==4.1.2
mpmath==1.2.1
sqlparse==0.4.3
sympy==1.11.1
```

## views.py


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    
    #Latex記法で出力する
    from sympy import print_latex
    
    #Latex記法に変換する
    from sympy import latex
    
    #行列
    from sympy import Matrix
    
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
    
            context             = {}
            context["topics"]   = Topic.objects.all()
    
            #行列の定義
            x = Matrix([[1,2,3],[1,2,3]])
    
            #Latex記法で出力
            print_latex(x)
    
            #Latex記法でcontextに入れる。
            context["latex"]    = latex(x)
    
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    

sympyは`latex`を使うことで計算結果をLatex記法にする事ができる。今回はこれをcontextに入れ、レンダリングする。


## テンプレート


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
    
        {# TODO: mathjaxを使う #}
        <script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=default' async></script>
    
    </head>
    <body>
    
        <main class="container">
    
            {# TODO: \[ \] で囲まれた文字列をLatexとして解釈、数式を表示させる。#}
            <div>\[ {{ latex }} \]</div>
    
            {# ここが投稿用フォーム #}
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {# ここが投稿されたデータの表示領域 #}
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>
    

## 動かすとこうなる


<div class="img-center"><img src="/images/Screenshot from 2022-10-30 15-26-47.png" alt=""></div>


## 結論


後は、ユーザーの入力を行い、views.pyにて計算処理を実行、結果を出力する。

これだけでPythonの高度な計算系ウェブアプリが作れる。


参照元: https://stackoverflow.com/questions/50447737/sympy-latex-export-using-python


