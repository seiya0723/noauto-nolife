---
title: "【Django】要素数が同じモデルオブジェクトをDTLで一緒にループして表示させる【.annotate()やモデルクラスにメソッドを追加などが通用しない場合の対策】"
date: 2021-10-13T15:22:14+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

例えば、マイリストフォルダに保存されている、マイリスト動画。マイリストフォルダの一覧を表示している時に、フォルダ内の動画のサムネイル1つを表示させたい時、どうやって再現させましょうかと言うのが今回の課題。

こういう時は、zipとlistを使用して対処する他に、生成されたモデルオブジェクトを加工することで対処する。

この方法を使えば、複雑なORMを考えたり、モデルクラスにメソッドを追加したりするなどを考慮しなくても良い。

## 状況(モデルクラス)


    class VideoMyListFolder(models.Model):
        class Meta:
            db_table    = "video_mylist_folder"
    
        id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        dt          = models.DateTimeField(verbose_name="作成日",default=timezone.now)
        title       = models.CharField(verbose_name="フォルダタイトル",max_length=50)
        description = models.CharField(verbose_name="フォルダ説明文",max_length=300)
    
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="フォルダ所有者",on_delete=models.CASCADE)
    
        public      = models.BooleanField(verbose_name="フォルダ公開設定",default=False)
        search      = models.BooleanField(verbose_name="検索表示設定",default=False)
        
        """
        #XXX:これは実現できない
        def typical(self):
            return VideoMyList.objects.filter(folder=self.id).order_by("-dt").first()
        """

        def __str__(self):
            return self.title
    
    
    class VideoMyList(models.Model):
    
        class Meta:
            db_table    = "video_mylist"
    
        id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        dt          = models.DateTimeField(verbose_name="登録日時",default=timezone.now)
    
        folder      = models.ForeignKey(VideoMyListFolder,verbose_name="所属フォルダ",on_delete=models.CASCADE,null=True,blank=True)
        target      = models.ForeignKey(Video,verbose_name="マイリスト動画",on_delete=models.CASCADE)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="登録したユーザー",on_delete=models.CASCADE)
    
    
        def __str__(self):
            return self.target.title
    

VideoMyListFolderにて、フォルダのサムネイル画像を手に入れるため、VideoMyListからひとつ取ってtypicalとしているが、これは実現できない。

なぜなら、VideoMyListはVideoMyListFolderよりも後に書かれているため、定義されていないと言われ、エラーになってしまう。かと言って、VideoMyListをVideoMyListよりも先に書くと、今度は、VideoMyListのfolderで、定義されていないと言われ、エラーになってしまう。

このジレンマを解決するのが次項。

## zipで要素数の同じモデルオブジェクトをひとまとめにする

まず、ビューにて、

    def get(self,request,*args,**kwargs):

        context = {}
        context["contains"]     = VideoMyList.objects.filter(user=request.user.id,folder=None).count()
        context["typical"]      = VideoMyList.objects.filter(user=request.user.id,folder=None).order_by("-dt").first()

        #フォルダ毎にマイリスト数をカウントして追加。
        context["folders_full"] = VideoMyListFolder.objects.filter(user=request.user.id).annotate(contains=Count("videomylist")).order_by("-dt")
        paginator               = Paginator(context["folders_full"],settings.SEARCH_AMOUNT_PAGE)

        if "page" in request.GET:
            context["folders"]  = paginator.get_page(request.GET["page"])
        else:
            context["folders"]  = paginator.get_page(1)

        #マイリストフォルダに格納されている代表的なマイリストを表示させるため、zipとlistを使って2つのモデルオブジェクトをループさせる
        typical = []
        for f in context["folders"]:
            typical.append(VideoMyList.objects.filter(user=request.user.id,folder=f.id).order_by("-dt").first())

        context["folder_typical"]   = list(zip(context["folders"],typical))
            
        return render(request,"tube/mylist.html",context)


まず、`context["folders"]`に1ページ分の`VideoMyListFolder`のモデルオブジェクトを代入させる。

`context["folders"]`をループさせ、フォルダのIDを抜き取る。`VideoMyList`からフォルダのIDで検索を行い、`.first()`で1つ取る。それをリスト型の`typical`に`.append()`する

`context["folder_typical"]`には`list(zip(context["folders"],typical))`を代入する。zip()だけでなくlist()を使用しないとDTLで読み取りできない点に注意。

続いて、テンプレート。

    {% for folder,typical in folder_typical %}
    <div class="large_content">

        <div class="large_content_inner">
            <div class="large_content_views_area">
                <div class="large_content_views_dt">{{ folder.dt|date:"Y年m月d日 H時i分s秒" }}</div>
            </div>

            <a href="{% url 'tube:mylist_folder_single' folder.id %}">
                
                <div class="large_content_thumbnail_area" style="text-align:center;">
                    {% if typical %}
                    <img src="{{ typical.target.thumbnail.url }}" alt="">
                    {% else %}
                    <i class="far fa-folder" style="font-size:5rem;"></i>
                    {% endif %}
                </div>
                <div class="large_content_description_area">
                    <div class="large_content_description_title">{{ folder.title|truncatechars_html:15 }}</div>
                    <div class="large_content_description_body">{{ folder.description|truncatechars_html:20 }}</div>
                    <div class="large_content_description_body">{{ folder.contains }}件の動画</div>
                </div>
            </a>

            <div class="large_content_control_area">
                <button class="large_content_control_button mylist_folder_delete_button" value="{{ folder.id }}">フォルダを削除</button>
            </div>
        </div>

    </div>
    {% endfor %}

1回のループで2つの値が抜き取れるので、変数に割当、表示させる。

## 別解(ビュー側でモデルオブジェクトをループして属性付与)

今回の場合、先の項のようにzipでひとまとめにする他に、ビュー側で属性として付与してしまえば済む話である。


    def get(self,request,*args,**kwargs):

        context = {}
        context["contains"]     = VideoMyList.objects.filter(user=request.user.id,folder=None).count()
        context["typical"]      = VideoMyList.objects.filter(user=request.user.id,folder=None).order_by("-dt").first()

        #フォルダ毎にマイリスト数をカウントして追加。
        context["folders_full"] = VideoMyListFolder.objects.filter(user=request.user.id).annotate(contains=Count("videomylist")).order_by("-dt")
        paginator               = Paginator(context["folders_full"],settings.SEARCH_AMOUNT_PAGE)

        if "page" in request.GET:
            context["folders"]  = paginator.get_page(request.GET["page"])
        else:
            context["folders"]  = paginator.get_page(1)

        """
        #マイリストフォルダに格納されている代表的なマイリストを表示させるため、zipとlistを使って2つのモデルオブジェクトをループさせる
        typical = []
        for f in context["folders"]:
            typical.append(VideoMyList.objects.filter(user=request.user.id,folder=f.id).order_by("-dt").first())

        context["folder_typical"]   = list(zip(context["folders"],typical))
        """ 

        #モデルオブジェクトに属性値の付与
        for f in context["folders"]:
            f.typical   = VideoMyList.objects.filter(user=request.user.id,folder=f.id).order_by("-dt").first()

        return render(request,"tube/mylist.html",context)

テンプレートはこうなる。

この場合、DTLのループを書き換える必要がなくなるので、状況によってはこちらのほうが手がかからなくて済む。

    {% for folder in folders %}
    <div class="large_content">

        <div class="large_content_inner">
            <div class="large_content_views_area">
                <div class="large_content_views_dt">{{ folder.dt|date:"Y年m月d日 H時i分s秒" }}</div>
            </div>

            <a href="{% url 'tube:mylist_folder_single' folder.id %}">
                
            <div class="large_content_thumbnail_area" style="text-align:center;">
                {% if folder.typical %}
                <img src="{{ folder.typical.target.thumbnail.url }}" alt="">
                {% else %}
                <i class="far fa-folder" style="font-size:5rem;"></i>
                {% endif %}
            </div>
            <div class="large_content_description_area">
                <div class="large_content_description_title">{{ folder.title|truncatechars_html:15 }}</div>
                <div class="large_content_description_body">{{ folder.description|truncatechars_html:20 }}</div>
                <div class="large_content_description_body">{{ folder.contains }}件の動画</div>
            </div>
            </a>

            <div class="large_content_control_area">
                <button class="large_content_control_button mylist_folder_delete_button" value="{{ folder.id }}">フォルダを削除</button>
            </div>
        </div>

    </div>
    {% endfor %}

## 結論

もし、`.annotate()`等では対処しきれない問題はこのように属性の付与などで対処する。



