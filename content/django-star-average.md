---
title: "【Django】星の平均をアイコンで表示させる【3.5の時、三星と半星で表示】"
date: 2022-03-14T09:17:33+09:00
draft: false
thumbnail: "images/Screenshot from 2022-03-14 17-07-03.png"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


通販サイトなどでよくある、星の平均をアイコンで表示する。

## モデル

2つのメソッドを追加する。平均スコアを出力するメソッド。少数だけ取り出し、それを元に1星、半星、無星を判定するメソッド。

    from django.db import models
    from django.core.validators import MinValueValidator,MaxValueValidator
    
    from django.db.models import Avg
    
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def avg_star_score(self):
            reviews  = Review.objects.filter(topic=self.id).aggregate(Avg("star"))
            
            if reviews["star__avg"]:
                return reviews["star__avg"]
            else:
                return 0
    
        def avg_star_icon_few(self):
            reviews = Review.objects.filter(topic=self.id).aggregate(Avg("star"))
            avg     = reviews["star__avg"]
    
            #平均スコアなしの場合は0を返す
            if not avg:
                return 0
    
            #少数指定の場合、小数部を表示(0~0.4は0、0.4~0.6は0.5、0.6~1は1と表現)
            few     = avg - int(avg)
    
            if 0.4 > few and few >= 0:
                return 0
            elif 0.6 > few and few >= 0.4:
                return 0.5
            else:
                return 1 
    
    
        def __str__(self):
            return self.comment
    
    class Review(models.Model):
    
        topic       = models.ForeignKey(Topic,verbose_name="対象トピック",on_delete=models.CASCADE)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        star        = models.IntegerField(verbose_name="星",validators=[MinValueValidator(1),MaxValueValidator(5)])
    
        def __str__(self):
            return self.comment



下記記事で解説した方法でアイコンのレンダリングをする。仮に少数があったとしても、問題なく整数部の回数だけループしてくれるので、わざわざ整数だけ取り出す必要はない。

[【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】](/post/django-template-integer-for-loop/)


## テンプレート

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
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.comment }}</div>
                
    
                <div>{{ topic.avg_star_score }}点</div>
    
                <div>評価:
                {% with range=''|center:topic.avg_star_score  %}
                {% for x in range %}★{% endfor %}
                {% endwith %}
    
                {# 小数部の星を表示させる #}
                {% if topic.avg_star_icon_few == 1 %}★{% elif topic.avg_star_icon_few == 0.5 %}半{% endif %}
                </div>
    
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>
    

`avg_star_score`メソッドで整数値の数だけ星を描画。`avg_star_icon_few`メソッド実行で小数部の値に応じて1、0.5、0が返却される。それを元に分岐すれば表示させるアイコンを変えることができるだろう。

ちなみにレビューと点数は管理サイトから適当に追加した。


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-03-14 17-07-03.png" alt=""></div>

ちょっと見た目が悪いが、これはCSSとHTMLの問題なので全く問題はない。

下記記事のようにfontawesomeを使うと良いだろう。

[HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】](/post/css3-star-review-radio/)

## 埋め込み型カスタムテンプレートタグではダメなのか？

たしかに、埋め込み型カスタムテンプレートタグを使えば、同様の平均点に応じて星をHTMLでレンダリングできるだろう。(今回のように半星なども表現可能)

だが、埋め込み型のカスタムテンプレートタグを使用する場合、別途HTMLを用意しておく必要があると思われる。つまり、1星と半星のHTMLを別途用意する必要がある。

テンプレートが煩雑になってしまう可能性があるため、今回はこの方法を取った。

ただ、平均を表示させるモデルが複数ある場合は、埋め込み型カスタムテンプレートタグのほうが有利であると思われる。






