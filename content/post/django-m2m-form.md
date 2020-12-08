---
title: "【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示"
date: 2020-12-01T16:03:44+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "django","tips","html5","css3","上級者向け" ]
---


本記事ではDjangoで一対多、多対多のリレーションを実装した上で、`forms.py`を使用し、フォームをバリデーションする。

また、単に`forms.py`からフォームのテンプレートを作るだけでなく、複数指定が要求されるフォームの作り方についても解説する。

コードは[Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】](/post/django-many-to-many/)から流用。

## 【1】forms.pyを使用したフォームバリデーション+forms.pyで定義したテンプレート

例えば`models.py`が下記の様な状態だったとする。

    from django.db import models
    import uuid
    
    
    class Category(models.Model):
        class Meta:
            db_table    = "category"
    
        id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        name        = models.CharField(verbose_name="カテゴリ名",max_length=10)
    
        def __str__(self):
            return self.name
    
    class Allergy(models.Model):
        class Meta:
            db_table    = "allergy"
    
        id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        name        = models.CharField(verbose_name="アレルギー名",max_length=10)
    
        def __str__(self):
            return self.name
    
    class Menu(models.Model):
        class Meta:
            db_table    = "menu"
    
        category    = models.ForeignKey(Category,verbose_name="カテゴリ名",on_delete=models.PROTECT)
        name        = models.CharField(verbose_name="品名",max_length=20)
        breakfast   = models.BooleanField(verbose_name="朝メニュー",default=True)
        lunch       = models.BooleanField(verbose_name="昼メニュー",default=True)
        dinner      = models.BooleanField(verbose_name="夜メニュー",default=True)
        takeout     = models.BooleanField(verbose_name="テイクアウト",default=True)
        price       = models.IntegerField(verbose_name="価格")
        allergy     = models.ManyToManyField(Allergy,verbose_name="含むアレルギー",blank=True)
    
        def __str__(self):
            return self.name
    

送信するものは`Menu`だけとする場合、`forms.py`は以下のようになる。

    from django import forms 
    from .models import Category,Allergy,Menu
    
    
    class MenuForm(forms.ModelForm):
        class Meta:
            model   = Menu
            fields  = ["category","name","breakfast","lunch","dinner","takeout","price","allergy",]
    

テンプレートはこうなる。フォームタグのみ表示。

    <form action="" method="POST" class="py-2">
        {% csrf_token %}

        {{ form.as_p }}

        <input class="form-control" type="submit" value="送信">
    </form>

続いて、`views.py`。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Menu
    from .forms import MenuForm
    
    class MenuView(View):
    
        def get(self, request, *args, **kwargs):
    
            form    = MenuForm()
    
            data    = Menu.objects.order_by("category")
            context = { "data":data,
                        "form":form}
    
            return render(request,"menulist/index.html",context)
        
        def post(self, request, *args, **kwargs):
    
            form    = MenuForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
    
    
            return redirect("menulist:index")
    
    
    index   = MenuView.as_view()

多対多でも1対多でも、リレーションなしと同様にバリデーションが可能。その後は普通に`.save()`を実行すればよい。

この状態で、開発用サーバーを起動してブラウザで確認するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-12-01 16-40-18.png" alt="多対多のフォームをそのまま表示"></div>

これが`forms.py`で定義したテンプレートをそのまま表示させた場合である。使いづらそうだ。

問題なく投稿とバリデーションを行うことができるが、これでは一般人には受け入れがたいものになってしまう。

## 【2】forms.pyを使用したフォームバリデーション+独自に作ったテンプレート

【1】では使いづらいフォームだったので、主にテンプレート部を修正する。

本項は`models.py`と`forms.py`は同じ、`views.py`とテンプレートが先と違う。まず、views.py。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Menu,Category,Allergy
    from .forms import MenuForm
    
    class MenuView(View):
    
        def get(self, request, *args, **kwargs):
    
            cates   = Category.objects.all()
            alles   = Allergy.objects.all()
    
            data    = Menu.objects.order_by("category")
            context = { "data":data,
                        "cates":cates,
                        "alles":alles }
    
            return render(request,"menulist/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = MenuForm(request.POST)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
    
            else:
                print("バリデーションNG")
    
    
    
            return redirect("menulist:index")
    
    
    index   = MenuView.as_view()

続いて、テンプレート。やや複雑になっている。

    <form action="" method="POST" class="py-2">
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
                    <input id="{{ alle.id }}" class="input_chk" type="checkbox" name="allergy" value="{{ alle.id }}">
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
        <input class="form-control" type="submit" value="送信">
    </form>

これをブラウザから確認するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-12-01 16-51-30.png" alt="見やすくなったフォーム"></div>

とても見やすい。そして扱いやすい。複数選択だった含有アレルギーも押しやすく、PC初心者にも優しい。テンプレート側で自由にフォームを作り、適度にCSSで装飾を施すだけで全然違う。


## 結論

`forms.py`でテンプレートで使うフォームを定義するのはどうかと思う。使用するHTMLと属性がサーバー側に制限され、【1】のようにフォームの操作性が悪くなってしまう。そういう意味で`forms.py`に`widgets`とか要らないんじゃなかろうか？

一方で【2】のように、フロント側で記述するフォームは`models.py`で定義したものとフォームの`name`属性だけ統一させ、後は自由に指定すれば、ユーザー側から見て使いやすいウェブアプリを作ることができる。それだけでなくフロントとサーバーサイドを疎結合化することも可能だ。

いずれにしても、一対多、多対多のリレーションでも`forms.py`のバリデーションはリレーションなしのものと同様に行う。

## ソースコード


【1】forms.pyを使用したフォームバリデーション+forms.pyで定義したテンプレート

https://github.com/seiya0723/django_m2m_forms

【2】forms.pyを使用したフォームバリデーション+独自に作ったテンプレート

https://github.com/seiya0723/django_m2m_customforms
