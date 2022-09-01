---
title: "【Django】16進カラーコードから色名に書き換えるフィルタを自作する【カスタムテンプレートフィルタ】"
date: 2021-05-12T17:35:56+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","カスタムテンプレートタグ" ]
---


`models.py`にて、色の指定を16進数のカラーコードで受け入れる。その16進数カラーコードを、色名(`orange`とか`forestgreen`とか)に書き換える。

そういうカスタムテンプレートフィルタを自作する方法を解説する。

## models.pyのカラーコード受け入れ

    from django.db import models
    from django.core.validators import RegexValidator

    """
    省略
    """

        color_regex = RegexValidator(regex=r'^#(?:[0-9a-fA-F]{3}){1,2}$')
        color       = models.CharField(verbose_name="リボン色",max_length=7,validators=[color_regex],default="#131417")


## カスタムテンプレートフィルタ

辞書型で色名とカラーコードをセットする。それを受け取った値で検索し、対になっているものを返す。無ければ`False`を返す。

    from django import template
    
    register = template.Library()
    
    #ここに16進カラーコードを色名に変換するカスタムテンプレートタグを作る
    
    COLOR   = { "black":"#000000","aliceblue":"#f0f8ff","darkcyan":"#008b8b","lightyellow":"#ffffe0","coral":"#ff7f50","dimgray":"#696969","lavender":"#e6e6fa","teal":"#008080","lightgoldenrodyellow":"#fafad2","tomato":"#ff6347","gray":"#808080","lightsteelblue":"#b0c4de","darkslategray":"#2f4f4f","lemonchiffon":"#fffacd","orangered":"#ff4500","darkgray":"#a9a9a9","lightslategray":"#778899","darkgreen":"#006400","wheat":"#f5deb3","red":"#ff0000","silver":"#c0c0c0","slategray":"#708090","green":"#008000","burlywood":"#deb887","crimson":"#dc143c","lightgray":"#d3d3d3","steelblue":"#4682b4","forestgreen":"#228b22","tan":"#d2b48c","mediumvioletred":"#c71585","gainsboro":"#dcdcdc","royalblue":"#4169e1","seagreen":"#2e8b57","khaki":"#f0e68c","deeppink":"#ff1493","whitesmoke":"#f5f5f5","midnightblue":"#191970","mediumseagreen":"#3cb371","yellow":"#ffff00","hotpink":"#ff69b4","white":"#ffffff","navy":"#000080","mediumaquamarine":"#66cdaa","gold":"#ffd700","palevioletred":"#db7093","snow":"#fffafa","darkblue":"#00008b","darkseagreen":"#8fbc8f","orange":"#ffa500","pink":"#ffc0cb","ghostwhite":"#f8f8ff","mediumblue":"#0000cd","aquamarine":"#7fffd4","sandybrown":"#f4a460","lightpink":"#ffb6c1","floralwhite":"#fffaf0","blue":"#0000ff","palegreen":"#98fb98","darkorange":"#ff8c00","thistle":"#d8bfd8","linen":"#faf0e6","dodgerblue":"#1e90ff","lightgreen":"#90ee90","goldenrod":"#daa520","magenta":"#ff00ff","antiquewhite":"#faebd7","cornflowerblue":"#6495ed","springgreen":"#00ff7f","peru":"#cd853f","fuchsia":"#ff00ff","papayawhip":"#ffefd5","deepskyblue":"#00bfff","mediumspringgreen":"#00fa9a","darkgoldenrod":"#b8860b","violet":"#ee82ee","blanchedalmond":"#ffebcd","lightskyblue":"#87cefa","lawngreen":"#7cfc00","chocolate":"#d2691e","plum":"#dda0dd","bisque":"#ffe4c4","skyblue":"#87ceeb","chartreuse":"#7fff00","sienna":"#a0522d","orchid":"#da70d6","moccasin":"#ffe4b5","lightblue":"#add8e6","greenyellow":"#adff2f","saddlebrown":"#8b4513","mediumorchid":"#ba55d3","navajowhite":"#ffdead","powderblue":"#b0e0e6","lime":"#00ff00","maroon":"#800000","darkorchid":"#9932cc","peachpuff":"#ffdab9","paleturquoise":"#afeeee","limegreen":"#32cd32","darkred":"#8b0000","darkviolet":"#9400d3","mistyrose":"#ffe4e1","lightcyan":"#e0ffff","yellowgreen":"#9acd32","brown":"#a52a2a","darkmagenta":"#8b008b","lavenderblush":"#fff0f5","cyan":"#00ffff","darkolivegreen":"#556b2f","firebrick":"#b22222","purple":"#800080","seashell":"#fff5ee","aqua":"#00ffff","olivedrab":"#6b8e23","indianred":"#cd5c5c","indigo":"#4b0082","oldlace":"#fdf5e6","turquoise":"#40e0d0","olive":"#808000","rosybrown":"#bc8f8f","darkslateblue":"#483d8b","ivory":"#fffff0","mediumturquoise":"#48d1cc","darkkhaki":"#bdb76b","darksalmon":"#e9967a","blueviolet":"#8a2be2","honeydew":"#f0fff0","darkturquoise":"#00ced1","palegoldenrod":"#eee8aa","lightcoral":"#f08080","mediumpurple":"#9370db","mintcream":"#f5fffa","lightseagreen":"#20b2aa","cornsilk":"#fff8dc","salmon":"#fa8072","slateblue":"#6a5acd","azure":"#f0ffff","cadetblue":"#5f9ea0","beige":"#f5f5dc","lightsalmon":"#ffa07a","mediumslateblue":"#7b68ee" }
    
    
    @register.filter
    def hex2color(value):
        print(value)
    
        if value in COLOR.values():
            for k,v in COLOR.items():
                if v == value:
                    return k
    
        return False
    
    @register.filter
    def color2hex(value):
    
        print(value)
    
        if value in COLOR.keys():
            for k,v in COLOR.items():
                if k == value:
                    return v
    
        return False

なぜ、タグではなくフィルタにしたかと言うと、if文で分岐してもらうためである。タグで作ってしまうとif文で分岐させることはできない。

    {% load select_tag %}

    {% if terminal.color|hex2color %}
    <div id="{{ terminal.id }}" class="terminal_power {% if terminal.power %}power_true_{{ terminal.color|hex2color }}{% else%}power_false_{{ terminal.color|hex2color }}{% endif %}">
        <i class="fas fa-power-off wake"></i>
    </div>

    {% else %}
    <div id="{{ terminal.id }}" class="terminal_power" style="{% if terminal.power %}color:{{ terminal.color }};text-shadow:0 0 1rem {{ terminal.color }};{% endif %}">
        <i class="fas fa-power-off wake"></i>
    </div>
    {% endif %}


これでこうなる。マウスホバーすると発色。

<div class="img-center"><img src="/images/Screenshot from 2021-05-12 17-49-37.png" alt="ホバーで着色"></div>

## 結論


なぜこういうことをするかと言うと、ユーザーから受け取った色を元に擬似クラスを使ったクラス名を定義するためにある。`style`属性では擬似クラスを指定することはできない。cssにて擬似クラスを定義する必要がある。そのためにはクラス名が必要。

16進数カラーコードをそのままクラス名にするのは、どうかと思い、このカスタムテンプレートフィルタの作成に至った。



