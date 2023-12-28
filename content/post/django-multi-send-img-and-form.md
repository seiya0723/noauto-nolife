---
title: "【Django】getlistを使って複数枚の画像をまとめて送信する【サムネイルが表示される専用フォームあり】"
date: 2023-09-22T22:37:07+09:00
lastmod: 2023-12-22T22:37:07+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","JavaScript","ウェブデザイン","追記予定" ]
---


以前解説した、

[inputタグのtype='file'で画像のサムネイルを表示させる](/post/input-tag-type-file-thumbnail/)

を使って、複数の画像をgetlistを使ってアップロードできるように仕立てる。

通販サイトでは、1つの商品に複数枚の画像がセットされることが多いので、そちらに対応させる。

## 解説


### モデル


```
from django.db import models
from django.utils import timezone

class Topic(models.Model):

    dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def images(self):
        return TopicImage.objects.filter(topic=self.id).order_by("dt")   #上から順に 123456

class TopicImage(models.Model):

    dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    topic       = models.ForeignKey(Topic,verbose_name="トピック",on_delete=models.CASCADE)
    content     = models.ImageField(verbose_name="画像",upload_to="bbs/topic_image/content")
```

1つのTopicに複数のTopicImageが紐づく形となっている。

何枚でも画像の投稿ができるようにした。

### テンプレート


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <style>

    img {
        max-width:100%;
    }


    .image_input_area {
        display:inline-block;
        border:dashed 0.2rem var(--gray);
        width:5rem;
        height:5rem;

        position:relative;
        cursor:pointer;
    }
    .image_input{ display:none; }
    .image_input_preview{ width:100%; height:100%;position:absolute; }
    .image_input_icon{ width:100%; height:100%;position:absolute; }
    .image_input_icon i{ 
        font-size:2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
    </style>


</head>
<body>

    <main class="container">
        {# ここが投稿用フォーム #}
        <form method="POST" enctype="multipart/form-data">
            {% csrf_token %}
            <textarea class="form-control" name="comment"></textarea>

            <div id="image_input_areas">
                <label class="image_input_area" data-id="1">
                    <input class="image_input" type="file" name="content" accept="image/*">
                    <div class="image_input_icon"><i class="fas fa-image"></i></div>
                    <img class="image_input_preview" src="" alt="">
                </label>
            </div>


            <input type="submit" value="送信">
        </form>

        <div id="image_input_area_init" style="display:none;">
            <label class="image_input_area">
                <input class="image_input" type="file" name="content" accept="image/*">
                <div class="image_input_icon"><i class="fas fa-image"></i></div>
                <img class="image_input_preview" src="" alt="">
            </label>
        </div>




        {# ここが投稿されたデータの表示領域 #}
        {% for topic in topics %}
        <div class="border">
            {{ topic.comment }}

            {% for image in topic.images %}
            <div>
                <img src="{{ image.content.url }}" alt="">
            </div>
            {% endfor %}
        </div>
        {% endfor %}

    </main>

<script>
window.addEventListener("load" , function (){

    document.addEventListener("change", (event) => {
        // type="file"のinputタグがchengeした時。クラス名の中に image_input が含まれている場合。
        if (event.target && event.target.classList.contains("image_input") ) {
            image_input(event);
        }
    });


});

const image_input = (e) => {

    // inputタグの親要素のlabelタグを取る
    const label = e.target.closest(".image_input_area");

    // https://qiita.com/noobar/items/afe7fc9994b448672c88
    // labelタグの子要素のimgタグのsrc属性に、inputタグに指定された画像を当てる
    if (e.target.files && e.target.files[0]) {
        const reader    = new FileReader();
        reader.onload   = function() {
            label.querySelector(".image_input_preview").src = reader.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }   

    // inputタグに指定した画像の表示
    // 最後のinputタグに画像が指定された時、入力欄を一つ増やす
    const areas = document.querySelector("#image_input_areas");

    //  ↓ 入力欄の数を調べる                   入力があったlabelの番号を取得
    if (String(areas.children.length) === label.getAttribute("data-id")){
        const input_area_element    = document.querySelector("#image_input_area_init").children[0].cloneNode(true);
        input_area_element.setAttribute("data-id", String(areas.children.length+1) );
        areas.appendChild(input_area_element);
    }   
}
</script>

</body>
</html>
```

Topicモデルのメソッドのimagesを呼び出し、レンダリングしている。

画像のフォームはサムネイルが表示されるようにしてあり、画像がセットされたら次の画像のフォームが自動的に表示されるようになっている。

今回、キャンセル機能は用意していないが、Fontaweosmeのバツボタンでもサムネイルの右端に表示させ、type="file"のinputのvalueを消すと良いだろう。

機会があれば追加する。

### ビュー

request.FILES.getlist() を使い、複数の画像をリストで取得している。

```
from django.shortcuts import render,redirect

from django.views import View

from .models import Topic
from .forms import TopicForm,TopicImageForm

class IndexView(View):

    def get(self, request, *args, **kwargs):

        context             = {}
        context["topics"]   = Topic.objects.order_by("-dt")

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        form    = TopicForm(request.POST)

        if not form.is_valid():
            return redirect("bbs:index")

        topic       = form.save()

        # name属性contentを複数個取り出すため、request.FILES.getlist() を使う。
        contents    = request.FILES.getlist("content")

        print(contents)

        for content in contents:
            dic             = {}
            dic["topic"]    = topic
            dic["content"]  = str(content)

            file_dic            = {}
            file_dic["content"] = content

            # request.POST と request.FILES を作る。
            form    = TopicImageForm(dic, file_dic)

            if form.is_valid():
                form.save()
            else:
                print(form.errors)

        return redirect("bbs:index")

index   = IndexView.as_view()
```

.save() 実行時の返り値は実際に保存されたモデルオブジェクトになる。これを利用し、紐づく画像を保存していく。

.getlist() は 同じname属性が複数リクエストボディに含まれる場合、リストで取得することができる。

通常のrequest.POST[""] では末尾の1件のみであるが、getlistであれば全てをリストで取得できる。


## ソースコード

https://github.com/seiya0723/django-multisend-image


## 関連記事

- [inputタグのtype='file'で画像のサムネイルを表示させる](/post/input-tag-type-file-thumbnail/)
- [【Django】Ajaxで複数枚の画像を一回のリクエストでアップロードする。](/post/django-ajax-multi-img-upload/)
