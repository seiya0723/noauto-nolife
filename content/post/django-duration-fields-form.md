---
title: "【Django】DurationFieldのフォームの最適解を考えてみる【JSを使うか、Django側で制御するか】"
date: 2022-11-26T15:51:28+09:00
lastmod: 2022-11-26T15:51:28+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","ウェブデザイン" ]
---


勉強した時間やトレーニングした時間を入力することができる、Djangoの[DurationField](/post/django-models-time-calc/)。

これは、日付や日時の入力とは異なるため、[flatpickr](/post/flatpickr-install/)は通用しない。

そのため別途フォームの作成を考慮する必要がある。


## 普通のinputタグtype="text"のフォーム

これでは`:`を入力しないといけないので、入力がめんどくさい。

<div class="img-center"><img src="/images/Screenshot from 2022-11-26 16-23-28.png" alt=""></div>


## selectタグを使ったフォームに書き換える。

そこで、selectタグを使ったフォームに書き換える。[DTLで指定した回数だけループするには、withとcenterフィルタを使う。](/post/django-template-integer-for-loop/)

```
<form method="POST">
    {% csrf_token %}

    {# withを使った数値指定のループ #}
    {# https://noauto-nolife.com/post/django-template-integer-for-loop/ #}

    {% with hours=""|center:10 range=""|center:60 %}
    <select name="hours">
        {% for x in hours %}
        <option value="{{ forloop.counter0 }}">{% if forloop.counter0 < 10 %}0{% endif %}{{ forloop.counter0 }}</option>
        {% endfor %}
    </select>
    :
    <select name="minutes">
        {% for x in range %}
        <option value="{{ forloop.counter0 }}">{% if forloop.counter0 < 10 %}0{% endif %}{{ forloop.counter0 }}</option>
        {% endfor %}
    </select>
    :
    <select name="seconds">
        {% for x in range %}
        <option value="{{ forloop.counter0 }}">{% if forloop.counter0 < 10 %}0{% endif %}{{ forloop.counter0 }}</option>
        {% endfor %}
    </select>
    {% endwith %}

    <textarea class="form-control" name="comment"></textarea>
    <input type="submit" value="送信">
</form>
```

これが、こんなふうに表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-11-26 16-27-09.png" alt=""></div>

問題は、この3つのselectタグを1つのDurationFieldにさせる必要があるということだ。

方法は2つある。JavaScriptでやるか、それともDjangoでやるか。

### JavaScript(jQuery)で送信する

JavaScriptであれば、送信前に、[FormDataを修正](/post/javascript-formdata-obj-set/)すればよい。


```
window.addEventListener("load" , function (){

    $(document).on("click","#submit",function(){ send(this); });

});
function send(elem){

    let form_elem   = $(elem).parents("form");

    let data        = new FormData( $(form_elem).get(0) );

    //TODO:timeを追加する。
    data.set("time" , Number(data.get("hours"))*3600 + Number(data.get("minutes"))*60 + Number(data.get("seconds")) );

    let url     = $(form_elem).prop("action");
    let method  = $(form_elem).prop("method");

    $.ajax({
        url: url,
        type: method,
        data: data,
        processData: false,
        contentType: false,
        dataType: 'json'
    }).done( function(data, status, xhr ) {
        window.location.replace("");
    }).fail( function(xhr, status, error) {
        console.log(status + ":" + error );
        window.location.replace("");
    });

}
```

上記のように、`.set()`を使って、計算した結果を追加する。

ただ、この時、文字列型で処理されているので、Numberを使って数値に変換した上で計算する。


### Django側でバリデーションをする。

まず、フォームクラスを作る。


```
from django import forms
from .models import Topic

#hours minutes secondsを受け取り、timeを返す
class TimeForm(forms.Form):

    hours       = forms.IntegerField()
    minutes     = forms.IntegerField()
    seconds     = forms.IntegerField()
    
    def clean(self):
        data            = self.cleaned_data
        data["time"]    = data["hours"]*3600 + data["minutes"]*60 + data["seconds"]
        return data


class TopicForm(forms.ModelForm):

    class Meta:
        model   = Topic
        fields  = ["comment","time"]

```

バリデーションした上で、cleanメソッドで手に入る値を格納した上でバリデーションする。


```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic
from .forms import TopicForm,TimeForm

class IndexView(View):

    def get(self, request, *args, **kwargs):

        context             = {}
        context["topics"]   = Topic.objects.all()

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        copied  = request.POST.copy()

        #timeの指定が無い時、hours minutes secondsを計算してtimeを作る。
        if "time" not in copied:
            form    = TimeForm(copied)
            if form.is_valid():
                cleaned         = form.clean()
                copied["time"]  = cleaned["time"]


        #ここで保存
        form    = TopicForm(copied)
        if form.is_valid():
            print("保存")
            form.save()

        return redirect("bbs:index")

index   = IndexView.as_view()
```

こちらは、JavaScriptを使わなくて済むとは言え、このやり方は少々回りくどいかもしれない。


## 結論

おそらく、JavaScriptを使った方法が無難かと思われる。

後は、selectタグを装飾していけば良いだろう。

## ソースコード

https://github.com/seiya0723/django_duration


