---
title: "【Django】models.pyからforms.py及びadmin.pyを自動的に作る【コマンド1発で生成】"
date: 2023-11-11T16:46:34+09:00
lastmod: 2023-11-11T16:46:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "作業効率化","django","Linux" ]
---

Djangoプロジェクトを何度も何度も作っていてふと思う。

models.pyからforms.py、admin.pyを作る時がすごいめんどくさいと。

どれも似たようなコードになるので、これは自動生成してしまったほうが容易いなと。

故に、本記事ではmodels.pyからforms.py及びadmin.pyを自動生成するPythonコードをまとめる。

※ファイルを読み込んで追記する仕様上、実行は自己責任でお願いします。

## 更新情報

- 2023年11月11日: ツール完成
- 2023年12月09日: 引数を指定してアプリ単体のみ、発動させることもできるように仕様変更 
- 2023年12月10日: モデルフィールドの `=` の前後にスペースが含まれていない場合も機能するよう正規表現を修正
- 2023年12月10日: admin.pyにて、idが含まれていない問題の修正。

## ソースコード

### models.pyからforms.pyを自動生成

```
import glob, re, sys 

## 引数の指定がある場合: 特定のアプリのmodels.pyに対して実行する。
## 引数の指定が無い場合: プロジェクトの全アプリのmodels.pyに対して実行する。

if len(sys.argv) > 1:
    models_paths    = glob.glob(f"./{sys.argv[1]}/models.py")
else:
    models_paths    = glob.glob("./*/models.py")

forms_paths     = [ models_path.replace("models", "forms") for models_path in models_paths ]

# すべてのmodels.pyを順次読み込み
for models_path,forms_path in zip(models_paths, forms_paths):

    #====forms.pyの冒頭===========================

    with open(models_path, "r") as mf:

        # models.pyを文字列で読み込み
        models_code     = mf.read()
        model_classes   = re.findall(r'class (\w+)\(models\.Model\):', models_code)

        # forms.pyのimport部を作成
        import_models   = ""
        for model_class in model_classes:
            import_models += f"{model_class},"

        import_models   = import_models.rstrip(",")


        # forms.pyのコードを作る。
        forms_code      = [ "# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-admin/ == #\n"]
        forms_code.append( f"from django import forms\nfrom .models import {import_models}\n" )

    #====forms.pyの冒頭===========================

    #====forms.pyの本体===========================

    with open(models_path, "r") as mf:

        # models.pyをリストで読みこみ
        models_codes    = mf.readlines()
        fields_list     = []

        for models_code in models_codes:
            print(models_code)

            # モデルクラス名を取得
            model_name  = re.search(r'class (\w+)\(models\.Model\):', models_code)
            if model_name:

                # バリデーション対象のフィールドがあれば追加。
                if fields_list:
                    forms_code.append(f"        fields\t= " + str(fields_list) + "\n")
                    fields_list = []

                # モデルクラス名を元に、フォームクラスを作る。
                forms_code.append( f"class {model_name.group(1)}Form(forms.ModelForm):")
                forms_code.append( "    class Meta:" )
                forms_code.append( f"        model\t= {model_name.group(1)}" )

            # モデルフィールド名を取得
            field_name = re.search(r'(\w+).*=\s*models\.', models_code)
            if field_name:
                fields_list.append(field_name.group(1))


        # バリデーション対象のフィールドがあれば追加。
        if fields_list:
            forms_code.append(f"        fields\t= " + str(fields_list) + "\n")
            fields_list = []

        # === 軽微な調整 ===
        # 'を"に
        forms_code  = [ c.replace("'", "\"") for c in forms_code]
        forms_code  = [ c.replace("[", "[ ") for c in forms_code]
        forms_code  = [ c.replace("]", " ]") for c in forms_code]

        # === 軽微な調整 ===

        # 書き込みするコード
        for c in forms_code:
            print(c)

    #====forms.pyの本体===========================

    #====対応するforms.pyへ保存===================

    # 書き込みするコード
    with open(forms_path, "a") as ff:
        for code in forms_code:
            ff.write(code + "\n")

    #====対応するforms.pyへ保存===================
```


以下の場合は別途コードの書き換えが必要

- 特定のアプリにだけフォームを作りたい場合
- dtなどのバリデーションを不要としているフィールドを除外したい場合
- django-summernoteなど独自のバリデーションを追加したい場合

そのほか、saveメソッドの書き換えが必要な場合も別途手動で書く必要がある。

#### 動かすとこうなる。

例えば、モデルが以下のような場合

```
from django.db import models

class Category(models.Model):
    name        = models.CharField(verbose_name="名前", max_length=100)

class Topic(models.Model):

    category    = models.ForeignKey(Category, verbose_name="カテゴリ", on_delete=models.PROTECT)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

class Reply(models.Model):

    topic       = models.ForeignKey(Topic, verbose_name="トピック", on_delete=models.CASCADE)
    comment     = models.CharField(verbose_name="リプライコメント",max_length=2000)
```

先程のPythonコードを実行する。引数にアプリ名を指定することで、指定したアプリだけ発動できる。
```
python create_forms bbs
```
引数が指定されていない場合は、プロジェクト内の全アプリに対して実行される。


作られるforms.pyはこんな感じ
```
# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-admin/ == #

from django import forms
from .models import Category,Topic,Reply

class CategoryForm(forms.ModelForm):
    class Meta:
        model	= Category
        fields	= [ "name" ]

class TopicForm(forms.ModelForm):
    class Meta:
        model	= Topic
        fields	= [ "category", "comment" ]

class ReplyForm(forms.ModelForm):
    class Meta:
        model	= Reply
        fields	= [ "topic", "comment" ]
```




### models.pyからadmin.pyを自動生成

続いて、admin.pyを作る。カスタムアドミンを用意して、list_displayを含めておく。

やり方はforms.pyのときと同様、正規表現を使う。

```
import glob, re, sys 

## 引数の指定がある場合: 特定のアプリのmodels.pyに対して実行する。
## 引数の指定が無い場合: プロジェクトの全アプリのmodels.pyに対して実行する。

if len(sys.argv) > 1:
    models_paths    = glob.glob(f"./{sys.argv[1]}/models.py")
else:
    models_paths    = glob.glob("./*/models.py")

admin_paths     = [ models_path.replace("models", "admin") for models_path in models_paths ]

# すべてのmodels.pyを順次読み込み
for models_path,admin_path in zip(models_paths, admin_paths):

    #====admin.pyの冒頭===========================

    with open(models_path, "r") as mf:
    
        # models.pyを文字列で読み込み
        models_code     = mf.read()
        model_classes   = re.findall(r'class (\w+)\(models\.Model\):', models_code)

        # admin.pyのimport部を作成
        import_models   = ""
        for model_class in model_classes:
            import_models += f"{model_class},"
        
        import_models   = import_models.rstrip(",")

        # admin.pyのコードを作る。
        admin_code      = [ "# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-admin/== #\n"]
        admin_code.append( f"from django.contrib import admin\nfrom .models import {import_models}\n" )

    #====admin.pyの冒頭===========================

    #====admin.pyの本体===========================

    with open(models_path, "r") as mf:

        # models.pyをリストで読みこみ
        models_codes    = mf.readlines()
        fields_list     = []

        for models_code in models_codes:
            print(models_code)
            
            # モデルクラス名を取得
            model_name  = re.search(r'class (\w+)\(models\.Model\):', models_code)

            if model_name:
            
                # バリデーション対象のフィールドがあれば追加。
                if fields_list:
                    admin_code.append(f"    list_display\t= " + str(["id"]+fields_list) + "\n")
                    fields_list = []
                
                # モデルクラス名を元に、フォームクラスを作る。
                admin_code.append( f"class {model_name.group(1)}Admin(admin.ModelAdmin):")

            # モデルフィールド名を取得
            field_name = re.search(r'(\w+).*=\s*models\.', models_code)
            if field_name:
                # ここでManyToManyは除外
                if "ManyToManyField" not in field_name.group(1):
                    fields_list.append(field_name.group(1))


        # バリデーション対象のフィールドがあれば追加。
        if fields_list:
            admin_code.append(f"    list_display\t= " + str(["id"]+fields_list) + "\n")
            fields_list = []
        
        admin_code.append( "" )

        # admin.site.register()
        for model_class in model_classes:
            admin_code.append( f"admin.site.register({model_class},{model_class}Admin)" )
            
        # === 軽微な調整 ===
        # 'を"に
        admin_code  = [ c.replace("'", "\"") for c in admin_code]
        admin_code  = [ c.replace("[", "[ ") for c in admin_code]
        admin_code  = [ c.replace("]", " ]") for c in admin_code]

        # === 軽微な調整 ===


        # 書き込みするコード
        for c in admin_code:
            print(c)

    #====admin.pyの本体===========================

    #====対応するadmin.pyへ保存===================

    with open(admin_path, "a") as af: 
        for code in admin_code:
            af.write(code + "\n")

    #====対応するadmin.pyへ保存===================

```

#### 動かすとこうなる


モデルがこの場合。

```
from django.db import models

class Category(models.Model):
    name        = models.CharField(verbose_name="名前", max_length=100)

class Topic(models.Model):

    category    = models.ForeignKey(Category, verbose_name="カテゴリ", on_delete=models.PROTECT)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

class Reply(models.Model):

    topic       = models.ForeignKey(Topic, verbose_name="トピック", on_delete=models.CASCADE)
    comment     = models.CharField(verbose_name="リプライコメント",max_length=2000)
```

このコードが生成される。

```
# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-admin/== #

from django.contrib import admin
from .models import Category,Topic,Reply

class CategoryAdmin(admin.ModelAdmin):
    list_display	= [ "name" ]

class TopicAdmin(admin.ModelAdmin):
    list_display	= [ "category", "comment" ]

class ReplyAdmin(admin.ModelAdmin):
    list_display	= [ "topic", "comment" ]


admin.site.register(Category,CategoryAdmin)
admin.site.register(Topic,TopicAdmin)
admin.site.register(Reply,ReplyAdmin)
```


list_displayが用意されているので、管理サイト一覧でも見やすい。

## コマンド一発でforms.py、admin.pyを作るように仕立てる

以降、Linuxを前提として話を進めている。

aliasに登録して実行する。

ホームディレクトリに`develop_tools`ディレクトリを作り、その中に各ファイルを格納。

```
alias create_forms="python3 ~/develop_tools/create_forms.py"
alias create_admin="python3 ~/develop_tools/create_admin.py"
```

後はcreate_forms, create_admin コマンドで呼び出せる。


## 結論

このように同じような作業、似たような作業は自動化させるのが良いと思う。

laravelでも、 resourceコマンドを使ってコントローラだけでなくモデルやルーティングも簡単に作れるので、Djangoにもできればそういうコマンドが用意されたいものだ。

ちなみに、urls.pyもどのプロジェクトでも似たようなコードになってくるので、そちらも近日自動生成のコードを作っておく。


