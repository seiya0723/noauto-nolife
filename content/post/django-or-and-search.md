---
title: "Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】"
date: 2020-11-11T17:56:10+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---

普通、検索エンジンで検索する時、こう検索するであろう。

    Django UUIDFields 使い方

Djangoのモデルオブジェクトで検索しようとすると、こうなる。

    Model.objects.filter(title__contains="Django UUIDFields 使い方")

これでは検索結果が出てこない。検索時にスペースも文字列の1つとして考えるからだ(『Django UUIDFields 使い方』を含むタイトルを表示)

そこで、スペース区切りのキーワード検索をするときは、Qクラスを使用する。

[40分Django](/post/startup-django/)をベースに検索できるように改良する。



## 検索フォームを作る

まず、`templates/bbs/index.html`にて、下記を追加する。


    <form action="" method="GET">
        <div class="input-group">
            <input class="form-control" type="text" name="search">
            <div class="input-group-apend">
                <input class="btn btn-outline-primary" type="submit">
            </div>
        </div>
    </form>

これで、views.pyのIndexViewのgetメソッドに到達するようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-13 15-28-22.png" alt=""></div>

## クエリビルダでスペース区切りのキーワード検索をする

完成形はこうなる。


    from django.shortcuts import render,redirect
    from django.views import View

    from .models import Topic

    #TODO:クエリビルダをインポート
    from django.db.models import Q
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            
            context = {}
            #クエリを初期化しておく。
            query   = Q()

            #検索キーワードがある場合のみ取り出す
            if "search" in request.GET:
    
                #全角スペースを半角スペースに変換、スペース区切りでリストにする。
                words   = request.GET["search"].replace("　"," ").split(" ")
    
                #クエリを追加する
                for word in words:

                    #空欄の場合は次のループへ
                    if word == "":
                        continue

                    #TIPS:AND検索の場合は&を、OR検索の場合は|を使用する。
                    query &= Q(comment__contains=word)
    
            #作ったクエリを実行(検索のパラメータがない場合、絞り込みは発動しない。)
            context["topics"] = Topic.objects.filter(query)
    
            return render(request,"bbs/index.html",context)
    
    index   = IndexView.as_view()


順に解説する。


### 検索キーワードを取り出す

まず、検索欄に入力されたキーワードを取り出す

例えば、`name="search"`に入力されたデータであれば、

    request.GET["search"]

このように取得する事ができる。

これは[40分Django](/post/startup-django/)でやった`request.POST["comment"]`と同様。

ただ、検索キーワードを指定していない場合、`request.GET["search"]`はキーエラーになってしまう。

そのため、前もって、`search`というキーが存在するかチェックする。

    if "search" in request.GET:
        request.GET["search"]



### 検索キーワードをスペース区切りのリスト型に直す

まず、スペース区切りの検索を実現させるため、検索欄に入力した文字列を、スペースで区切る必要がある。

文字列を半角スペースごとにリスト型にするには、`.split(" ")`を使うと良いだろう。

    if "search" in request.GET:
        request.GET["search"].split(" ") 

ただ、利用者によってはいつも、半角スペースで区切って検索キーワードを入力するとは限らない。

場合によっては全角スペースで区切ることもある。だからこそ、全角スペースは半角スペースに置換しておく必要がある。

`.replace("　"," ")`を使うことで実現できる。

    if "search" in request.GET:
        request.GET["search"].replace("　"," ").split(" ") 

このように、全角スペースを半角スペースとして扱い、半角スペースで区切り、リスト化させる。

次の処理で検索用のクエリを作るため、返り値をwordsとして受け取る。

    if "search" in request.GET:
        words   = request.GET["search"].replace("　"," ").split(" ") 


### クエリを作る

冒頭で説明したとおり、Djangoでは`Model.objects.filter()`を使うことで、絞り込みが実現できる。

ただ、先ほどスペース区切りにしたリストをfilterに入れれば良いという問題ではない。ここでクエリビルダを使ってクエリを作る。

まず、スペース区切りにしたリストを1つずつ取り出す。
    

    if "search" in request.GET:
        words   = request.GET["search"].replace("　"," ").split(" ") 

        for word in words:
            print(word)

ここで、冒頭で作っておいたQのオブジェクトであるqueryに条件を追加する。


    query = Q()

    if "search" in request.GET:
        words   = request.GET["search"].replace("　"," ").split(" ") 

        for word in words:
            query &= Q(comment__contains=word)



スペース区切りでAND検索をしたい時(指定された検索ワード全てを含む場合)、このように`&`で追加をする。


OR検索がしたい場合は下記に書き換える。
    
    query |= Q(comment__contains=word)

ただ、この時、スペースを2個以上連続で入力された場合、空文字列で検索してしまうことになる。そのため、wordが空文字列であれば次のループに行く


    query = Q()

    if "search" in request.GET:
        words   = request.GET["search"].replace("　"," ").split(" ") 

        for word in words:

            if word == "":
                continue

            query &= Q(comment__contains=word)

    
スペース込みの検索は基本的にAND検索なので、今回は&を採用した


### クエリを実行する

最後に、作ったクエリを実行する。.filter()メソッドでOK。contextに入れてレンダリングする。

    context = {}
    query   = Q()

    if "search" in request.GET:
        words   = request.GET["search"].replace("　"," ").split(" ")

        for word in words:
            if word == "":
                continue

            query &= Q(comment__contains=word)

    context["topics"] = Topic.objects.filter(query)


仮に検索していない場合、`.filter()`には検索条件を指定しない空の`Q()`が当てられるので全く問題ない。全て出力される。


## 【補足1】更に詳細な検索を行いたい場合はこうする

フォームを使ってバリデーションを行う。

    from django.shortcuts import render,redirect
    from django.views import View

    from .models import Category,Topic

    #商品のカテゴリ検索用フォーム(Topicモデルを使ったフォーム)
    from .forms import TopicCategoryForm

    
    from django.db.models import Q
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            
            context = {}


            #クエリを初期化しておく。
            query   = Q()


            #カテゴリ検索も同時に行う場合、事前にバリデーションを通す
            form    = TopicCategoryForm(request.GET)

            if form.is_valid():
                cleaned = form.clean()
                
                #バリデーションした結果をクエリに追加させる
                query &= Q(category=cleaned["category"])


            if "search" in request.GET:
    
                words   = request.GET["search"].replace("　"," ").split(" ")
    
                for word in words:
                    if word == "":
                        continue

                    query &= Q(comment__contains=word)


            #(4)作ったクエリを実行(検索のパラメータがない場合、絞り込みは発動しない。)
            context["data"] = Topic.objects.filter(query)
    
            return render(request,"bbs/index.html",context)
    
    index   = IndexView.as_view()


これで、カテゴリ検索と商品名の検索を同時に行う事ができる。

指定したカテゴリであり、なおかつスペース区切りで指定した文字列を含む商品名を検索する事ができる。


## 【補足2】指定したキーワードとカテゴリで検索して結果が0件の場合、カテゴリかキーワードのどちらかを無効化させるには？

クエリをそれぞれ独立させると良いだろう。


    from django.shortcuts import render,redirect
    from django.views import View

    from .models import Category,Topic

    #商品のカテゴリ検索用フォーム(Topicモデルを使ったフォーム)
    from .forms import TopicCategoryForm

    
    from django.db.models import Q
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            
            context = {}


            #クエリを初期化しておく。
            category_query  = Q()

            #カテゴリ検索も同時に行う場合、事前にバリデーションを通す
            form    = TopicCategoryForm(request.GET)

            if form.is_valid():
                cleaned = form.clean()
                
                #バリデーションした結果をクエリに追加させる
                category_query &= Q(category=cleaned["category"])


            search_query   = Q()

            if "search" in request.GET:
    
                #キーワードが空欄もしくはスペースのみの場合、ページにリダイレクト
                if request.GET["search"] == "" or request.GET["search"].isspace():
                    return redirect("bbs:index")
    
                words   = request.GET["search"].replace("　"," ").split(" ")
    
                for word in words:
                    if word == "":
                        continue

                    search_query &= Q(comment__contains=word)

            query = search_query & category_query

            context["data"] = Topic.objects.filter(query)

            #検索件数0件の場合、カテゴリのみで検索。
            if not context["data"]:
                context["data"] = Topic.objects.filter(category_query)

    
            return render(request,"bbs/index.html",context)
    
    index   = IndexView.as_view()



## 結論

ちなみに、実行されるクエリを確認したいのであれば

    print(Topic.objects.filter(query).query)

このように`.query`を末尾に追加して、print文で表示される。詳しくは下記を参照。

[【Django】実行されるクエリを確認する【.query】](/post/django-models-query/)


## 関連記事


### 検索とページネーションを両立させるには？

検索機能とページ移動を両立させる必要がある。

下記記事ではカスタムテンプレートタグを使用して、検索に必要なパラメータとページネーションに必要なパラメータを両立させている。

[Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】](/post/django-paginator/)

ただ、このページネーションの方法よりももっといい方法があると思われるので、見つかり次第、追記する予定。(カスタムテンプレートタグを使用しないでページネーションと検索を両立させる方法)

### 多対多で検索をするには？

多対多は扱いがやや特殊。クエリを実行した後で絞り込みをかける必要がある。

詳細は下記記事にて。

[【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】](/post/django-m2m-search-and-add/)


### 選択されたデータを絞り込むには？

複数選択によって選ばれたデータを検索するには、`__in`を使用する。

詳細は下記にて。

[Djangoで主キーのリスト型を作り、合致するレコードを検索する【values_list + filter】](/post/django-id-list-filter/)


### 年月単位で絞り込むには？

モデルを使用しないフォームクラスにより、入力された年月をバリデーションする。

その上で検索をする。

詳細は下記記事にて。

[【Django】年月検索と、年別、月別アーカイブを表示させる【最新と最古のデータから年月リストを作成(Trunc不使用)】](/post/django-year-month-search-and-list/)


## 参考文献

- https://docs.djangoproject.com/en/3.1/ref/models/querysets/#query-related-tools
- https://docs.djangoproject.com/en/3.1/topics/db/queries/#complex-lookups-with-q


