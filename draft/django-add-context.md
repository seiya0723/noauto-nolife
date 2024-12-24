---
title: "【Django】ビュークラスの継承を使い、予めcontextを追加させる"
date: 2021-12-31T08:29:13+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

クラスベースのビューであれば、継承をするだけで、継承関係にある全てのビューに同じ機能を追加できる。

どのページでも表示させるデータ(例えば、サイトのトップバーに表示するニュースなど)にも継承を使えば、予めの追加が実現できる。

以下は、[40分Django](/post/startup-django)にビュークラスの継承を行い、contextを追加するメソッドを呼び出せるようにしている。


    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    class ContextView(View):
        
        def context(self):
            context = {}
            context["news"]   = Topic.objects.order_by("-id")[:10]
    
            return context
    
    class BbsView(ContextView):
    
        def get(self, request, *args, **kwargs):
            context = self.context()
            context["topics"]   = Topic.objects.order_by("-id")
    
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()



もし、既にビュークラスが作られており、この継承をするのがめんどくさい場合、[MIDDLEWAREによる呼び出し](/post/django-create-middleware-add-request-attribute/)でも問題はないとおもう。

とは言え、リクエストオブジェクトに直接属性追加をするぐらいなら、`context_processers`を作り、`settings.py`にて追加したほうが安全で良いかもしれない。もっとも、いずれも今回のビュークラスを継承する形式とは違い、全てのリクエストでDBアクセスが発生するので、少々無駄が多い点は明らかである。

コードで楽してDBに負荷をかけるか、それともしっかりコードを書いてDBを楽させるかは、開発者次第かと。

