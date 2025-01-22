---
title: "【Django】カスタムテンプレートタグ(フィルタ)でリンク付きのハッシュタグを実現する。【#から始まる正規表現】"
date: 2021-09-05T17:30:49+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","カスタムテンプレートタグ","XSS","セキュリティ" ]
---

Djangoのカスタムテンプレートタグ(フィルタ)を使うことでTwitterやyoutube等のハッシュタグを実現できる。

だが、ちょっとでも間違えると、簡単にXSS脆弱性を生み出してしまう可能性があるため、十分注意して実装する。

## 方法論

まず、普通のDTLはXSS対策のため、`<`や`>`等の特殊記号をエスケープしている。ハッシュタグを実現させるのであれば、まずはこれを除外する。そのため、`mark_safe`関数を使用して値を返却する。これにより、カスタムテンプレートタグ(フィルタ)で作ったHTMLタグの文字列がそのままHTMLとして解釈される。

ただ、これだけだと一般ユーザーが送信したHTMLタグ文字列までHTMLとして解釈されてしまう。そこで、予めエスケープ処理を実行した上で、ハッシュタグの箇所のリンクタグを作り、DTLのエスケープ処理を解除する。

つまり、順序はこんな感じ

1. カスタムテンプレートタグ(フィルタ)呼び出し時にデータの特殊文字をただの文字列にする(エスケープ処理)
1. エスケープした文字列からハッシュタグに該当する部分を正規表現で全て抜き取る
1. 正規表現で抜き取った全ての箇所をHTMLのリンクタグに変換
1. 返却時にDTLのエスケープ処理の解除(`mark_safe`関数)してHTMLのままレンダリングする

DTLでは自動的にエスケープ処理を行ってくれるので、正規表現を使ってHTMLのリンクタグを作ったとしても、それもエスケープされてしまう。

そこで、`mark_safe`関数を使用して自動的に行ってくれるDTLのエスケープ処理を無効化させる。実質`safe`フィルタと同様の処理ではあるが、safeフィルタを後付けする場合、うっかり付け忘れる可能性も考慮すればカスタムテンプレートタグ(フィルタ)の中に含ませたほうが良い。

また、この方法では最初に受け取った値のエスケープ処理が行われなければ、確実にXSS脆弱性が生まれる。十分注意して実装する。

## ソースコード

[参照元](https://stackoverflow.com/questions/42137455/make-all-hashtags-clickable-in-template-with-templatetags)から丸コピ。

    import re
    from django import template
    from django.utils.html import escape
    from django.utils.safestring import mark_safe
    
    register = template.Library()
    
    def create_hashtag_link(tag):
        url = "/tags/{}/".format(tag)
        return '<a href="{}">#{}</a>'.format(url, tag)
    
    @register.filter()
    def hashtag_links(value):
        return mark_safe( re.sub(r"#(\w+)", lambda m: create_hashtag_link(m.group(1)), escape(value) ) ) 
        
予めエスケープしておいたデータを、正規表現の置換を使用し、ハッシュタグに当たる文字列(#から始まる文字列)をaタグに置換。その後エスケープ処理をせずにレンダリングさせる。

原理自体はそれほど難しくはない。後は、テンプレート側で、loadした上でフィルタを発動させる。

    {% load custom_filter %}
    {{ data|hashtag_links }}

リンクタグのリンクをクエリストリングにしたい場合は、`create_hashtag_link`の部分をこうする。

    def create_hashtag_link(tag):
        url = "/search/?tag={}".format(tag)
        return '<a href="{}">#{}</a>'.format(url, tag)

他のパラメータもキープしたいのであればリクエストオブジェクトも引数に入れたほうが良いだろう。[ページネーションのカスタムテンプレートタグ](/post/django-paginator/)と原理は同じだ。

もし、`urls.py`に書かれてあるnameを逆引きしたい場合は、[django.urlsの中にあるreverse関数](https://docs.djangoproject.com/en/3.2/ref/urlresolvers/#reverse)を使う。おそらく`reverse`を使う方法が現実的かも知れない。URLを直書きしてしまうと保守が面倒だから。

## 結論

この方法を応用すれば、Djangoのマークダウン実装もカスタムテンプレートタグ(フィルタ)で実現できそうだ。正規表現が大変なことになりそうだが。

参照元: https://stackoverflow.com/questions/42137455/make-all-hashtags-clickable-in-template-with-templatetags


追記: Djangoにマークダウンを実装させた。Pythonライブラリを使った。

[DjangoでPythonライブラリのマークダウンを試してみる【pip install Markdown】](/post/django-markdown/)





