---
title: "【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】"
date: 2022-10-01T18:29:58+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け" ]
---

## 多対多の検索をする


### テンプレート

まずは、テンプレート。検索フォームを作る。チェックボックスを使う。

    <form action="" method="get">
        <div>
            {# TODO:チェックしたタグであるかを判定するには、カスタムテンプレートタグを使うしかない #}
            {# 参照: https://stackoverflow.com/questions/34050150/django-templates-get-list-of-multiple-get-param#}
            {# TODO: この場合はcontextプロセッサーを使うと言う方法も考えられる。 #}
            {# https://noauto-nolife.com/post/django-context-processors/ #}

            {% for tag in tags %}
            <label><input type="checkbox" name="tag" value="{{ tag.id }}" {% tag_checked request tag.id %}>:{{ tag.name }}</label>
            {% endfor %}
        </div>

        <div class="input-group">
            <input class="form-control" type="text" name="search" placeholder="キーワード検索">
            <div class="input-group-append">
                <input class="form-control btn btn-outline-primary" type="submit" value="検索">
            </div>
        </div>
    </form>


チェックを入れて多対多の検索時、チェックを入れたinputタグに関してはcheckedを付与する必要が有る。

ただ、それを実現するには、contextプロセッサーかカスタムテンプレートタグしかない。テンプレートタグでは再現できない。

### ビュー



    def get(self, request, *args, **kwargs):

        context = {}
        context["tags"]     = Tag.objects.all()

        query   = Q() 

        if "search" in request.GET:
            search      = request.GET["search"]

            raw_words   = search.replace("　"," ").split(" ")
            words       = [ w for w in raw_words if w != "" ]

            for w in words:
                query &= Q(title__contains=w)


        #ここで一旦queryによる検索を行う
        topics  = Topic.objects.filter(query).order_by("-dt")


        #TODO:タグの検索(指定されたタグが実在するのか確認をする。)
        form    = TopicTagForm(request.GET)

        if form.is_valid():
            cleaned         = form.clean()
            selected_tags   = cleaned["tag"] 

            #タグ検索をする(中間テーブル未使用、指定したタグを全て含む)
            for tag in selected_tags:

                #TODO:指定したタグが、トピックに含まれているかをチェック。含まれていれば追加。
                topics      = [ topic for topic in topics if tag in topic.tag.all() ]

        context["topics"]   = topics

        return render(request,"bbs/index.html",context)



多対多の検索をする時クエリビルダを使用しても、想定した通りの結果が得られないことに注意。

チェックを入れた多対多で検索をする際は、一旦クエリビルダを発動させた上で、そこから絞り込みをかけると良いだろう。


### カスタムテンプレートタグ

検索した時、チェックした要素にcheckedを付与するには、カスタムテンプレートタグ辺りしか方法はない。テンプレート上で`request.GET.getlist("tag")`などと呼び出すことはできないためである。


    #https://noauto-nolife.com/post/django-paginator/
    
    from django import template
    register = template.Library()
    
    #検索時に指定したタグとモデルオブジェクトのtagのidが一致した場合はchecked文字列を返す。
    #カスタムテンプレートタグとして機能させるため、.simple_tag()デコレータを付与する
    @register.simple_tag()
    def tag_checked(request, tag_id):
    
        #検索時に指定したタグのid(文字列型)のリストを作る
        tags    = request.GET.getlist("tag")
    
        #tagsにidが含まれる場合
        if str(tag_id) in tags:
            return "checked"


### 【検索】動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-10-02 14-56-24.png" alt=""></div>

## 多対多の追加・削除をする

主に良いねをする際、良いねを削除する際などに使う事ができる

今回はタグを追加・削除する際に利用した。


### ビュー

    class AddTagView(LoginRequiredMixin,View):
    
        def post(self, request, pk, *args, **kwargs):
    
            topic   = Topic.objects.filter(id=pk).first()
            form    = TopicTagForm(request.POST)
    
            if form.is_valid():
    
                cleaned = form.clean()
    
                selected_tags   = cleaned["tag"] 
    
                #タグ検索をする(中間テーブル未使用、指定したタグを全て含む)
                for tag in selected_tags:
    
                    #このtagはTagモデルクラスのオブジェクト。追加する時はこうする。save()は実行しなくても良い
                    #https://stackoverflow.com/questions/1182380/how-to-add-data-into-manytomany-field
    
                    if tag in topic.tag.all():
                        topic.tag.remove(tag)
                    else:
                        topic.tag.add(tag)
    
            return redirect("bbs:index")
    
    tag     = AddTagView.as_view()


多対多のフィールドに対して、`.remove()`,`.add()`のメソッドをそれぞれ実行すればよい。引数はモデルオブジェクトを与え、そのモデルオブジェクトを追加、削除する

### フォーム

ちなみに、このTagFormは前項の検索の際にも使った。

多対多のリレーションを守るため、存在確認をするためにも、下記フォームクラスを通してバリデーション、型変換を行わなければならない。

    class TopicTagForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "tag" ]
    

### テンプレート

    {% for topic in topics %}
    <div class="border">

        <h2>{{ topic.title }}</h2>

        <div>タグ: {% for tag in topic.tag.all %}{{ tag }} {% endfor %}</div>
        <div>{{ topic.dt }}</div>

        <div>投稿者:{{ topic.user }}</div>
        <div>{{ topic.comment|linebreaksbr }}</div>

        {# 多対多に対して、後から追加する。 #}

        {# TODO:ManyToManyの追加 (良いねも同様の機能で実装できる。) #}

        <h2>タグ追加</h2>

        {% for tag in tags %}
        <form action="{% url 'bbs:tag' topic.id %}" method="POST" style="display:inline-block;">
            {% csrf_token %}
            <input type="hidden" name="tag" value="{{ tag.id }}">
            <input type="submit" value="{{ tag.name }}">
        </form>
        {% endfor %}

    </div>
    {% endfor %}


タグのボタンをクリックした時、そのタグが追加される。

これをいいねボタンにしたい場合は、良いねボタンに変え、`.add()`に与える引数はユーザーモデルのオブジェクトにすると良い。

## 結論

Djangoの多対多は挙動や使いどころが他のフィールドと異なる点が多いようだ。

管理サイトでデータを操作しつつ、挙動を確かめたいところだ。



