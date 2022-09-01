---
title: "【Django】ビュー関数とビュークラスの違い、一覧と使い方"
date: 2022-01-22T17:39:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

ビュー関数とビュークラスの違い。

## 前提 (bbs/urls.py)

`config/urls.py`からアプリ(bbs)の`urls.py`を読み込み、その中身は下記とする。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
    ]
    
## 構文

### 関数ベースのビュー

    from django.shortcuts import render,redirect
    
    from .models import Topic
    from .forms import TopicForm
    
    def index(request):
    
        if request.method == "GET":
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        elif request.method == "POST":
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")

メソッドをif文で分岐させる形式になっている。

### クラスベースのビュー(View)

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()

クラスベースのビューでは`.as_view()`を実行して、`urls.py`から呼び出せる形式にしなければならない。

`config/urls.py`のコメントによると、ビュークラスは`urls.py`にて、`.as_view()`と実行することで呼び出せると書かれているが、これでは関数ベースのビューに書き換えた場合、`urls.py`まで書き換えないといけない。だから`index`という名前の変数に格納することで、`urls.py`まで書き換えなくても済むようにしている。

### クラスベースのビュー(TemplateView)

単純にページを表示させるだけであれば、TemplateViewを使用すれば良い。下記のようにcontextを追加させることもできる。

    from django.shortcuts import redirect
    from .models import Topic
    
    from django.views.generic import TemplateView
    
    class IndexView(TemplateView):
        template_name   = "bbs/index.html"
    
        def get_context_data(self, **kwargs):
            context             = super().get_context_data(**kwargs)
            context["topics"]   = Topic.objects.all()
    
            return context
    
    index   = IndexView.as_view()


しかし、これだけでは、POSTメソッドを受け付けてくれない。だから下記のようにIndexViewクラスにpostメソッドを追加する。これで投稿が実現できる。

    from django.shortcuts import redirect
    from .models import Topic
    
    from django.views.generic import TemplateView
    
    class IndexView(TemplateView):
        template_name   = "bbs/index.html"
    
        def get_context_data(self, **kwargs):
            context             = super().get_context_data(**kwargs)
            context["topics"]   = Topic.objects.all()
    
            return context

        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")

    index   = IndexView.as_view()

### クラスベースのビュー(ListView)

クラスベースのビューとして、ListViewがある。指定したモデルをレンダリングする事ができる。

もし、条件が揃っていれば、単にモデルのデータを表示させるだけのページを作りたい場合、下記で済む。

    from .models import Topic
    from django.views.generic import ListView
    
    class IndexView(ListView):
        model           = Topic
    
    index   = IndexView.as_view()

ただし、大抵そうはならない。40分Djangoは投稿機能もあるし、テンプレートも`topic/topic_list.html`も作られていないので明示的に指定する必要がある。コンテキスト名も違うので、全て手動で指定しなければならない。

    from .models import Topic
    from django.views.generic import ListView
    
    class IndexView(ListView):
        model           = Topic

        #TODO:下記を指定しなければ、topic/topic_list.htmlにレンダリングされる。
        template_name   = "bbs/index.html"
    
        #TODO:下記を指定しなければ、object_listもしくはtopic_listという名前のコンテキストでテンプレートに引き渡される。
        def get_context_data(self, **kwargs):
            context             = super().get_context_data(**kwargs)
            context["topics"]   = Topic.objects.all()
    
            return context
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


たかだか、投稿と表示をするためだけにこれだけの長いコードを書いてしまう。こうならないためにも、最初は通常の`View`を使用すれば良いのではないかと思う。

通常の`View`を使用して、それで短く完結しそうな内容であれば、`TemplateView`もしくは`ListView`等を使用していくのが妥当である。

参照元:https://docs.djangoproject.com/en/4.0/ref/class-based-views/generic-display/#listview


### クラスベースのビュー(DetailView)

DetailViewは指定したモデルの内、1つ取り出して表示させる。これはurls.pyにて呼び出す時に引数を与えなければならない。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [
        path('<int:pk>/', views.index, name="index"),
    ]

レンダリング対象のHTMLは`bbs/topic_detail.html`であるため事前に用意しておく必要がある。

    from .models import Topic
    from django.views.generic import DetailView
    
    class IndexView(DetailView):
        model           = Topic
    
    index   = IndexView.as_view()

メソッドやコンテキストのオーバーライドなどは前項のListViewと同様。こちらもViewで前もって作った上でこのDetailViewで足りるのであれば使う程度にとどめておいたほうが良いだろう。

ちなみに、上記は下記と等価。

    from django.shortcuts import render
    
    from django.views import View
    from .models import Topic
    
    class IndexView(View):
    
        def get(self, request, pk, *args, **kwargs):
    
            context             = {}
            context["object"]   = Topic.objects.filter(id=pk).first()
    
            return render(request,"bbs/topic_detail.html",context)
    
    index   = IndexView.as_view()

参照元:https://docs.djangoproject.com/en/4.0/ref/class-based-views/generic-display/#detailview


## クラスベースのビューと関数ベースのビューの違い

### クラスベースのビューは継承が使える、関数ベースのビューは継承が使えない

当たり前だが、関数はクラスの継承を使用することはできない。継承して一部分を書き換え、実行するなどは関数ベースのビューでは再現できない。

『[【Django】ビュークラスの継承を使い、予めcontextを追加させる](/post/django-add-context/)』にて、この記事にかかれてある内容は関数でも再現できる。

例えば、関数で表現すると下記のようになる。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    def context():
        context = {}
        context["news"]   = Topic.objects.order_by("-id")[:10]

        return context
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            context = context()
            context["topics"]   = Topic.objects.order_by("-id")
    
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


しかし、context関数が返却する内容は、実行するビューによっては異なる可能性も考えられる。例えば、特定ページではニュースだけでなく、閲覧しているページのコンテンツのカテゴリ一覧を集計して表示するとか。

もちろん、その場合は、関数を実行した後に上記例と同様に

    context = context()
    context["topics"]   = Topic.objects.order_by("-id")

このようにcontextを追加すれば良い。

では、Ajaxの場合はどうだろうか？ AjaxではPOSTメソッドでさえレンダリングするためにcontextを作らざるを得なくなる。POSTメソッドにも必要なデータも追加していかなければならないのは、やや大変だ。同じ内容が並んでいる光景はやや可読性を悪化させる結果に至るかもしれない。

しかし、クラスベースのビューでは継承を使うことにより、コードの可読性に配慮したコーディングが可能になる。もちろん、コードを書く開発者全員がクラスベースを理解しなければならないため、実現のハードルは高い。

クラスベースのビューは手放しで推奨できるものではないが、難解なシステムを開発する際には選択肢の1つとして覚えておくのも悪くないと思う。

### クラスベースのビューはLoginRequiredMixin(認証の判定)を使う、関数ベースは@login_reqiredを使う

例えば、ログイン状態をビューの処理の前にチェックしたい場合、クラスベースは`LoginRequiredMixin`を多重継承。

    from django.contrib.auth.mixins import LoginRequiredMixin
    
    class MyView(LoginRequiredMixin, View):
        #TIPS:下記はsettings.pyにLOGIN_REDIRECT_URL,ACCOUNT_LOGOUT_REDIRECT_URLが指定されていれば、あえて指定する必要はない
        login_url = '/login/'
        redirect_field_name = 'redirect_to'
    
関数ベースは`@login_reqired`というデコレータを使用してログイン状態の判定を行う。

    from django.contrib.auth.decorators import login_required
    
    @login_required
    def my_view(request):
        pass

基本的に、クラスベースのビューで継承もしくは多重継承をする場合は、関数ベースのビューではデコレーターを使って再現している。

DjangoRestFrameworkでも例外ではなく、関数ベースのビューの場合は`@api_view()`をデコレーターとして、クラスベースのビューであれば、`APIView`を継承する。そのため、関数ベースのビューだからといって、DRFが使えないということはない。

- 参照元:https://docs.djangoproject.com/en/4.0/topics/auth/default/
- 参照元:https://www.django-rest-framework.org/api-guide/views/

### urls.pyから引数を引き渡したときはこうなる

例えば、urls.pyが下記のようだったとする。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('<int:pk>/', views.index, name="index"),
    ]

クラスベースのビューの場合、下記のように、メソッドの引数に指定する。

    class IndexView(View):
    
        def get(self, request, pk, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, pk, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()


関数ベースのビューの場合、関数ベースのビューそのものに引数を入れる。

    def index(request, pk, *args, **kwargs):
    
        if request.method == "GET":
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        elif request.method == "POST":
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    
書き換える場所が二箇所であるクラスベースのビューが一見、面倒なように見えるが、これはkwargsを使えば良いだろう。下記の場合でも問題なく動く。

    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()



