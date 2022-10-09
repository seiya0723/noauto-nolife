---
title: "【Django】sorted関数とoperatorでモデルのフィールド、メソッドを指定してソーティング・並び替えをする【ランキングの実装に有効】"
date: 2022-07-30T17:48:17+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

例えば、モデルがこうだったとする。

    from django.db import models
    
    class Topic(models.Model):
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        score   = models.IntegerField(verbose_name="スコア")
    
        def twice(self):
            return self.score*2
    
ビューでこのようにすることで、モデルフィールドもしくはモデルメソッドでソーティングができる。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import TopicForm
    
    import operator
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            
            #フィールド名であればこのようにソーティングできる、reverseを使うことで値が大きい方が上になる。
            #ordered = sorted(topics, key=operator.attrgetter('score'), reverse=True)
            
            #メソッド名であればこのようにソーティングする。methodcaller() 第一引数にメソッド名、第二引数にそのメソッドの引数を
            ordered = sorted(topics, key=operator.methodcaller('twice'), reverse=True)
    
            context = { "topics":ordered }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()



## 結論

ランキングなどの表示時にはこの方法がとても簡単。

後は、DTLのforループを使用し、`forloop.counter`を使用すると良いだろう。


    {% for topic in topics %}
    <div class="border">
        <div>{{ forloop.counter }}位</div>
        {{ topic.comment }}:{{ topic.score }}
    </div>
    {% endfor %}


参照元

- https://docs.python.org/3/library/operator.html#operator.attrgetter
- https://docs.python.org/3/library/operator.html#operator.methodcaller
- https://stackoverflow.com/questions/2412770/good-ways-to-sort-a-queryset-django

