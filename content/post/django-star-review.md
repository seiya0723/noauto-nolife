---
title: "【Django】FontAwesomeで星のアイコンを使ったレビューの投稿と表示"
date: 2022-08-20T17:55:28+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","追記予定" ]
---

最終的にこのようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-08-20 17-57-52.png" alt=""></div>

今回はテンプレートのwithとcenterは不使用とした。

そして、5つ星の内、4つ星でレビューした場合、空の星を1つ描画する仕様に仕立てた。

## モデル

    from django.db import models
    from django.core.validators import MinValueValidator,MaxValueValidator
    
    
    MAX_STAR    = 5
    
    class Review(models.Model):
        comment     = models.CharField(verbose_name="コメント",max_length=500)
        star        = models.IntegerField(verbose_name="星",validators=[MinValueValidator(1),MaxValueValidator(MAX_STAR)])
    
        def star_icon(self):
            dic                 = {}
            dic["true_star"]    = self.star * " "
            dic["false_star"]   = (MAX_STAR - self.star) * " "
    
            return dic
    

MinValueValidatorとMaxValueValidatorを使用して1~5までの数値のみを格納できるようにしている。

その上で、星のアイコンを表示する際、★の描画は`true_star`で、☆の描画は`false_star`を返すようにしている。

## テンプレート

    {% for review in reviews %}
    <div class="border">
        <div>{{ review.comment }}</div>
        <div class="review_star">
            <span class="review_true_star">{% for s in review.star_icon.true_star %}<i class="fas fa-star"></i>{% endfor %}</span>
            <span class="review_false_star">{% for s in review.star_icon.false_star %}<i class="far fa-star"></i>{% endfor %}</span>
        </div>
    </div>
    {% endfor %}

`star_icon`メソッドを発動させ、`true_star`及び`false_star`を描画している。


## 参照

- [【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】](/post/django-template-integer-for-loop/)
- [HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】](/post/css3-star-review-radio/)



## ソースコード

https://github.com/seiya0723/bbs_review




