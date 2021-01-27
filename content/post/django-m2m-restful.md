---
title: "Djangoで多対多のリレーションを含むデータをAjax(jQuery)+DRFで送信させる"
date: 2020-12-01T17:17:52+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","restful","ajax","上級者向け","css3","html5","JavaScript" ]
---

本記事では多対多のリレーションを含んだウェブアプリで、Django REST FrameworkとAjaxを使用した非同期データ送信を実現させる方法を書く。

ソースコードは『[【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示](/post/django-m2m-form/)』の『【2】forms.pyを使用したフォームバリデーション+独自に作ったテンプレート』から流用した。

Ajax(jQuery)+Restful化させているだけなので、外見はほとんど変わりはない。

<div class="img-center"><img src="/images/Screenshot from 2020-12-01 16-51-30.png" alt=""></div>

## テンプレートとJSのコード

Restful+Ajax(jQuery)化させるには、まずはコードから書き換える。以下、`index.html`

    {% load static %}
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>ハンバーガー屋</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    	<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <link rel="stylesheet" href="{% static 'menulist/css/style.css' %}">
        <script src="{% static 'menulist/js/ajax.js' %}"></script>
        <script src="{% static 'menulist/js/send.js' %}"></script>
    </head>
    <body>
    
        <h1 class="text-center text-white" style="background:orange;">メニューリスト</h1>
    
        <main class="container">
    
    
            <form method="POST" class="py-2">
                {% csrf_token %}
    
                <div class="row">
                    <div class="col-sm-6">
                        <div class="py-1">
                            <select name="category">
                                {% for cate in cates %}
                                <option value="{{ cate.id }}">{{ cate.name }}</option>
                                {% endfor %}
                            </select>
                        </div>
    
                        <div class="py-1">
                            <input type="text" name="name" placeholder="メニュー名" required>
                            <input type="number" name="price" placeholder="価格" required>
                        </div>
    
                        <div class="py-1">
                            <div>含有アレルギー</div>
                            {% for alle in alles %}
    
                            <!--TODO:ここを配列で処理できるようにname属性を改修する-->
                            <input id="{{ alle.id }}" class="input_chk" type="checkbox" name="allergy[]" value="{{ alle.id }}">
                            <label class="surround_label" for="{{ alle.id }}">{{ alle.name }}</label>
                            {% endfor %}
                        </div>
                    </div>
    
    
                    <div class="col-sm-6">
                        <div class="row align-items-center">
                            <div class="col-6">朝メニュー</div><div class="col-6 text-right"><input id="breakfast" class="input_chk" type="checkbox" name="breakfast" checked><label class="chk_label" for="breakfast"></label></div>
                            <div class="col-6">昼メニュー</div><div class="col-6 text-right"><input id="lunch"     class="input_chk" type="checkbox" name="lunch"     checked><label class="chk_label" for="lunch"    ></label></div>
                            <div class="col-6">夜メニュー</div><div class="col-6 text-right"><input id="dinner"    class="input_chk" type="checkbox" name="dinner"    checked><label class="chk_label" for="dinner"   ></label></div>
                            <div class="col-6">持ち帰り</div><div class="col-6   text-right"><input id="takeout"   class="input_chk" type="checkbox" name="takeout"   checked><label class="chk_label" for="takeout"  ></label></div>
                        </div>
                    </div>
    
                </div>
                <input id="submit" class="form-control" type="button" value="送信">
            </form>
    
    
    
            <div id="content">
                {% include "menulist/content.html" %}
            </div>
    
        </main>
    
    </body>
    </html>


他のRestful+Ajax(jQuery)と同様に、再描画する部分だけHTMLを独立させている。フォームは以前のコードと同様だが、多対多に当たる含有アレルギーの複数選択部分はname属性を`[]`で終わらせるように指定する。

以下、`include`時に呼び出される`content.html`

    <table>
        <thead>
            <tr>
                <td>カテゴリ</td>
                <td>メニュー</td>
                <td>朝</td>
                <td>昼</td>
                <td>夜</td>
                <td>持ち帰り</td>
                <td>価格</td>
                <td>アレルギー</td>
            </tr>
        </thead>
        <tbody>
            {% for content in data %}
            <tr>
                <td>{{ content.category }}</td>
                <td>{{ content.name }}</td>
                <td>{{ content.breakfast }}</td>
                <td>{{ content.lunch }}</td>
                <td>{{ content.dinner }}</td>
                <td>{{ content.takeout }}</td>
                <td>{{ content.price }}円</td>
                <td>{% for allergy in content.allergy.all %}{{ allergy }} {% endfor %}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

前のコードと代わりはない。多対多のデータ(含有アレルギー)を表示する際のテンプレートタグは要注意。普通に`{{ content.allergy }}`などと指定しても表示されない。詳しくは[Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】](/post/django-many-to-many/)に書いてある。


続いて、JSのコード。send.jsである。

    $(function (){
        $("#submit").on("click", function(){ ajax_send(); });
    });
    
    function ajax_send(){
        
        var allergy_list    = [];
        $("[name='allergy[]']:checked").each(function(){
            allergy_list.push(this.value);
        })
    
        var param   = {
            category    : $("[name='category']").val(),
            name        : $("[name='name']").val(),
            breakfast   : $("[name='breakfast']").prop("checked"),
            lunch       : $("[name='lunch']").prop("checked"),
            dinner      : $("[name='dinner']").prop("checked"),
            takeout     : $("[name='takeout']").prop("checked"),
            price       : $("[name='price']").val(),
            allergy     : allergy_list,
        }
    
        $.ajax({
            url         : "", 
            contentType : 'application/json; charset=utf-8',
            type        : "POST",
            data        : JSON.stringify(param),
        }).done( function(data, status, xhr ) { 
            $("#content").html(data.content);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    
    }

注意するべきは、複数選択の含有アレルギーの指定をリスト(配列)にして送信している点。下記コードで`allergy_list`に、選択されたアレルギーのIDが格納される。

    var allergy_list    = [];
    $("[name='allergy[]']:checked").each(function(){
        allergy_list.push(this.value);
    })

後の処理は他のAjaxと変わりはない。CSRFのトークンを事前に送信するajax.jsもお忘れなく。




## ビューとシリアライザ


Ajaxリクエストを処理するビュー、JSONデータの解析及びバリデーションを行うシリアライザを定義する。やっていることは他のRestfulと変わりはない。シリアライザを通し、DBにデータを格納させる。

    from rest_framework import status,views,response
    from django.shortcuts import render,redirect,get_object_or_404
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Menu,Category,Allergy
    from .serializer import MenuSerializer
    
    
    class MenuView(views.APIView):
    
        def get(self, request, *args, **kwargs):
    
            cates   = Category.objects.all()
            alles   = Allergy.objects.all()
    
            data    = Menu.objects.order_by("category","name")
            context = { "data":data,
                        "cates":cates,
                        "alles":alles }
    
            return render(request,"menulist/index.html",context)
        
        def post(self, request, *args, **kwargs):
    
            serializer      = MenuSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
    
            data        = Menu.objects.order_by("category","name")
            context     = {"data":data}
            content_data_string     = render_to_string('menulist/content.html', context ,request)
            json_data               = { "content" : content_data_string }
    
            return JsonResponse(json_data)
    
    index   = MenuView.as_view()


シリアライザは下記。models.pyで定義したモデルクラスとフィールドを指定してあげるだけ。

    from rest_framework import serializers 
    from .models import Menu
    
    class MenuSerializer(serializers.ModelSerializer):
    
        class Meta:
            model   = Menu
            fields  = ["category","name","breakfast","lunch","dinner","takeout","price","allergy"]



## 結論

多対多になろうが、Restful化でやることはこれまでと大して変わりはない。Ajaxで送られたJSONをシリアライザが解析。その後DBに保管して、JSONレスポンスを返す。Ajaxがフロントの一部を再描画する。

多対多をAjaxで送信する際に注意しなければならないのは、name属性の指定である。IDを配列にまとめてリクエストを送信しなければならないのでJSを工夫する必要がある。

多対多は業務管理系アプリなどでよく使われる。本記事でAjax+Restfulで非同期動作をさせるメリットは、JSからリクエストを何度も送信するロングポーリングに対応させるためでもある。

ロングポーリングをさせることで、数秒〜数十秒間隔ではあるが、リアルタイムで情報を表示させることができるのだ。これでブラウザでF5を連打することはなくなるし、ブラウザ開きっぱなしでも新しい情報は次々と更新されていく。

<div class="img-center"><img src="/images/Screenshot from 2020-12-08 09-10-10.png" alt=""></div>


## 関連記事

この多対多のアプリに画像を送信する場合は下記を参考に。

[DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法](/post/drf-ajax-fileupload/)


## ソースコード

https://github.com/seiya0723/django_m2m_restful

