---
title: "【Django】models.pyとforms.pyからviews.pyを自動的に作る【コマンド1発で生成】"
date: 2023-12-09T14:51:10+09:00
lastmod: 2023-12-09T14:51:10+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","作業効率化","上級者向け" ]
---

以前の自動生成ツール

[【Django】models.pyからforms.py及びadmin.pyを自動的に作る【コマンド1発で生成】](/post/django-auto-create-models-forms-admin/)

この続き。今回はviews.pyを自動的に作る。

いつも同じようなものをimportして、ビュークラスを作り、DB操作とレンダリングしているだけなので。

内容は以前のコードをviews.py仕様にしただけで、特別なものは使っていない。


## ソースコード

```
import glob, re, sys

## 引数の指定がある場合: 特定のアプリのmodels.pyに対して実行する。
## 引数の指定が無い場合: プロジェクトの全アプリのmodels.pyに対して実行する。

if len(sys.argv) > 1:
    models_paths    = glob.glob(f"./{sys.argv[1]}/models.py")
    forms_paths     = glob.glob(f"./{sys.argv[1]}/forms.py")
else:
    models_paths    = glob.glob("./*/models.py")
    forms_paths     = glob.glob("./*/forms.py")


views_paths     = [ models_path.replace("models", "views") for models_path in models_paths ]


# すべてのmodels.pyを順次読み込み
for models_path,forms_path,views_path in zip(models_paths, forms_paths, views_paths):

    # アプリ名を取得しておく。
    app_name        = models_path.replace("./","").replace("/models.py","")

    #====views.pyの冒頭===========================
    views_code      = [ "# == This code was created by https://noauto-nolife.com/post/django-auto-create-views/ == #\n"]

    # 検索(クエリビルダ)、ページネーション、リダイレクト、LoginRequiredMixin をimportしておく。
    views_code.append("from django.shortcuts import render,redirect")
    views_code.append("from django.views import View")
    views_code.append("from django.contrib.auth.mixins import LoginRequiredMixin")
    views_code.append("from django.db.models import Q")
    views_code.append("from django.core.paginator import Paginator")

    views_code.append("")

    # モデルクラスをimportする。
    with open(models_path, "r") as mf:

        models_code     = mf.read()
        model_classes   = re.findall(r'class (\w+)\(models\.Model\):', models_code)

        import_models   = ""
        for model_class in model_classes:
            import_models += f"{model_class},"

        # 末尾の , を削除
        import_models   = import_models.rstrip(",")

        # forms.pyのコードを作る。
        views_code.append( f"from .models import {import_models}" )


    # フォームクラスをimportする
    with open(forms_path, "r") as mf:

        forms_code     = mf.read()
        form_classes   = re.findall(r'class (\w+)\(forms\.ModelForm\):', forms_code)

        import_forms   = ""
        for form_class in form_classes:
            import_forms += f"{form_class},"

        # 末尾の , を削除
        import_forms   = import_forms.rstrip(",")

        # forms.pyのコードを作る。
        views_code.append( f"from .forms import {import_forms}\n" )


    #====views.pyの冒頭===========================

    # 本体は class [モデルクラス名]View(View): でgetメソッド、postメソッドを作っておく。
    # レンダリングするテンプレートは [アプリ名][モデルクラス名(小文字)].html
    # アプリのトップページのView:  IndexViewは作っておく。

    views_code.append(f'class IndexView(View):')
    views_code.append(f'')
    views_code.append(f'    def get(self, request, *args, **kwargs):')
    views_code.append(f'')
    views_code.append(f'        context = {{}}')
    views_code.append(f'        return render(request, "{app_name}/index.html", context)')
    views_code.append(f'')
    views_code.append(f'    def post(self, request, *args, **kwargs):')
    views_code.append(f'')
    views_code.append(f'        return redirect("{app_name}:index")')
    views_code.append(f'')
    views_code.append(f'index   = IndexView.as_view()')
    views_code.append(f'')


    # 作成(Create)、読み込み(Read)、編集(Update)、削除(DELETE)、
    for model_class,form_class in zip(model_classes, form_classes):

        model_class_lower   = model_class.lower()

        # ===読み書き====

        views_code.append(f'class {model_class}View(View):')
        views_code.append(f'    def get(self, request, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        context = {{}}')
        views_code.append(f'        context["{model_class_lower}"] = {model_class}.objects.all()')
        views_code.append(f'')
        views_code.append(f'        return render(request, "{app_name}/{model_class_lower}.html", context)')
        views_code.append(f'')
        views_code.append(f'    def post(self, request, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        form = {form_class}(request.POST)')
        views_code.append(f'')
        views_code.append(f'        if form.is_valid():')
        views_code.append(f'            print("保存")')
        views_code.append(f'            form.save()')
        views_code.append(f'        else:')
        views_code.append(f'            print(form.errors)')
        views_code.append(f'')
        views_code.append(f'        return redirect("{app_name}:{model_class_lower}")')
        views_code.append(f'')
        views_code.append(f'{model_class_lower}   = {model_class}View.as_view()')
        views_code.append(f'')
        views_code.append(f'')

        # ===編集====

        views_code.append(f'class {model_class}UpdateView(View):')
        views_code.append(f'    def get(self, request, pk, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        context = {{}}')
        views_code.append(f'        context["{model_class_lower}"] = {model_class}.objects.filter(id=pk).first()')
        views_code.append(f'')
        views_code.append(f'        return render(request, "{app_name}/{model_class_lower}_update.html", context)')
        views_code.append(f'')
        views_code.append(f'    def post(self, request, pk, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        {model_class_lower} = {model_class}.objects.filter(id=pk).first()')
        views_code.append(f'        form = {form_class}(request.POST, instance={model_class_lower})')
        views_code.append(f'')
        views_code.append(f'        if form.is_valid():')
        views_code.append(f'            print("編集")')
        views_code.append(f'            form.save()')
        views_code.append(f'        else:')
        views_code.append(f'            print(form.errors)')
        views_code.append(f'')
        views_code.append(f'        return redirect("{app_name}:{model_class_lower}_update")')
        views_code.append(f'')
        views_code.append(f'{model_class_lower}_update   = {model_class}UpdateView.as_view()')
        views_code.append(f'')

        # ===削除====

        views_code.append(f'class {model_class}DeleteView(View):')
        views_code.append(f'    def get(self, request, pk, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        context = {{}}')
        views_code.append(f'        context["{model_class_lower}"] = {model_class}.objects.filter(id=pk).first()')
        views_code.append(f'')
        views_code.append(f'        return render(request, "{app_name}/{model_class_lower}_delete.html", context)')
        views_code.append(f'')
        views_code.append(f'    def post(self, request, pk, *args, **kwargs):')
        views_code.append(f'')
        views_code.append(f'        {model_class_lower} = {model_class}.objects.filter(id=pk).first()')
        views_code.append(f'        {model_class_lower}.delete()')
        views_code.append(f'')
        views_code.append(f'        return redirect("{app_name}:{model_class_lower}_delete")')
        views_code.append(f'')
        views_code.append(f'{model_class_lower}_delete   = {model_class}DeleteView.as_view()')
        views_code.append(f'')


    """
    for code in views_code:
        print(code)
    """

    #====対応するforms.pyへ保存===================

    # 書き込みするコード
    with open(views_path, "a") as ff:
        for code in views_code:
            ff.write(code + "\n")

    #====対応するforms.pyへ保存===================
```

冒頭でモデルクラスとフォームクラスを全てimportしており、

クエリビルダ、ページネーション、LoginRequiredMixin等必要なものもimportした。

閲覧と新規作成、編集と削除をそれぞれ用意した。

もっとも、個人的には編集と削除にgetメソッドは不要だと考えているので、コメントアウトしておく。

### 注意

- 読み込み時のコンテキストのキー名が単数形になっている
- 検索とクエリビルダはとりあえずimportはしたが、使ってはいない
- リダイレクト先のURL名の指定、及びpkの指定までは考慮していない。
- アプリ名の単語の途中で_がない(スネークケースになっていない) ← 生成後に置換で対処する。


## 結論

状況によってビューの書き方は大きく異なるので、この自動生成ツールの効果は未知数である。

あとは実際に使ってみて、問題箇所を調べ、改良を繰り返す。

次は、urls.pyの自動生成を作りたい。

その次はテンプレートの自動生成だ。簡単なウェブアプリならモデル作った後、コマンド1発で作れるようにするのが理想。

