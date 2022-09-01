---
title: "Djangoで埋め込みカスタムテンプレートタグを実装する方法"
date: 2021-01-26T15:55:04+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け","カスタムテンプレートタグ" ]
---


Djangoでデータの値に応じて文字列を返したい場合は、カスタムテンプレートタグを使用すれば良い。下記記事は、ページ移動と検索を両立させるため、文字列を返す、カスタムテンプレートタグを実装している。

[Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】](/post/django-paginator/)

しかし、データの値に応じてHTMLタグを返却するには、上記の方法では成立しない。safeフィルタを使用すればHTMLタグを表示できるが、XSS脆弱性対策が課題になる。そこで、本記事ではHTMLタグを返却する埋め込みカスタムテンプレートタグ実装方法を解説する。


## 実装方法

まず、アプリのディレクトリ内に`templatetags`ディレクトリを作る。今回はアプリのディレクトリ名は`devlog`とする

    mkdir ./devlog/templatetags

続いて、`templatetags`ディレクトリ内にカスタムテンプレートタグの機能部に当たるPythonスクリプトを書く。今回は`diff_day.py`とする。

    vi ./devlog/templatetags/diff_day.py

コードは以下。

    from django import template
    from django.utils import timezone
    import datetime 
    
    register = template.Library()
    
    @register.inclusion_tag("devlog/left_day.html")
    def left_day(deadline,start,progress):
    
        now         = datetime.datetime.utcnow().replace(tzinfo=timezone.utc)
        dead_diff   = deadline - now 
        start_diff  = now - start
        status      = ""
    
        if dead_diff.days >= 0 and start_diff.days >= 0:
            return { "left_day" : dead_diff.days }
        elif start_diff.days < 0:
            status  = "待機中"
        else:
            if progress >= 100:
                status  = "完了"
            else:
                status  = "期限切れ"
    
        return { "status": status }
    

上記コードは、`left_day`という関数に、締め切り日時(`deadline`)、開始日時(`start`)、進捗状況(`progress`)の数値の3つの引数を与えている。この`left_day`をテンプレートであるHTMLから呼び出し、3つの引数を指定することで実行する。関数内では残り日数と進捗状況に応じて、`status`及び`left_day`が変化する。まだ始まっていない状態は『待機中』、締め切りを過ぎている状態で、なおかつ進捗100%であれば『完了』、100%未満であれば『期限切れ』をそれぞれ`status`に与える。もし、既に始まっており、終わっていない状態であれば、残り日数に当たる`left_day`を返す。そして、関数はいずれも辞書型を返却する。

この辞書型の値の返却先はディレクティブである`@register.inclusion_tag()`で指定したテンプレートである。普段`views.py`にて`render`関数を使用してテンプレートのパスと`context`を指定してレンダリングしていた状況と考えればイメージしやすいだろう。

その、`left_day.html`が下記に当たる。

    {% if status %}
    <div class="project_header_center 
        {% if status == '完了' %}project_header_done
        {% elif status == '期限切れ' %}project_header_expire
        {% elif status == '待機中' %}project_header_wait
        {% endif %}">{{ status }}</div>
    {% else %}
    <div class="project_header_top">あと</div>
    <div class="project_header_bottom {% if left_day < 3 %}left_day_danger{% endif %}" style="">{{ left_day }}日</div>
    {% endif %}

普通のカスタムテンプレートタグ(`simple_tag()`)には真似できない、複雑なHTMLと分岐が並ぶ。それぞれのステータスにおいて、別々のクラス名を与え、残り日数がある場合は、HTMLの構造を変えている。

そして、このカスタムテンプレートタグを呼び出すコードが下記。
    
    {% load diff_day %}
    <!--↑冒頭に設置-->

    {% left_day content.deadline content.start content.progress %}
    
`left_day`は`diff_day.py`にて定義した関数。続く`content.deadline content.start content.progress`この3つは引数に値する。カスタムテンプレートタグで引数を指定するときはカンマ(,)は無しで。

さらに、`settings.py`にて`diff_day.py`を`INSTALLED_APPS`に代入し、実行可能な状態にさせる。

    INSTALLED_APPS = [ 

        """省略"""

        'devlog.templatetags.diff_day',
    ]

埋め込みカスタムテンプレートタグが発動することで、下記のような複雑な表現が可能になるのだ。

<div class="img-center"><img src="/images/Screenshot from 2021-01-26 22-45-19.png" alt="埋め込みカスタムテンプレートタグが発動している"></div>

## 主な実装例

- データの値によってHTMLを構造ごと変えたい場合
- 文字列のみの返却ではテンプレートが煩雑になる場合
- カスタムテンプレートタグで出力した文字列を元に、さらに分岐・繰り返し処理をしたい場合


埋め込みカスタムテンプレートタグは追加するたびにテンプレート(.html)とスクリプト(.py)の2つのファイルが増えていくので、みだりに追加しすぎるとどんどん煩雑になっていく。

返却する値が文字列だけで間に合う場合は、文字列を返す`simple_tag()`の実装に留めたい。なお間違っても`safe`フィルタだけは使わないようにしたいところだ。


## 結論

Djangoはlaravelとは違ってテンプレートの自由度が限られているような気がする。故にカスタムテンプレートタグを使用しないと、詰む可能性がある。その場合、フロントの話なので、JSを使えばなんとかなりそうだが、それではユーザーの負担になるので、可能な限りサーバー側で処理が終わるようにしたい。

カスタムテンプレートタグは市販の教科書には殆ど掲載されていない内容なので、Djangoの公式ドキュメントも確認するべし。カスタムフィルタについても掲載されている。

https://docs.djangoproject.com/en/3.1/howto/custom-template-tags/#writing-custom-template-tags

