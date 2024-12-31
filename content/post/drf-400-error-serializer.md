---
title: "DRFで400 Bad Request エラーが出る時、Serializerを確認する"
date: 2024-12-24T09:21:14+09:00
lastmod: 2024-12-24T09:21:14+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "drf","tips" ]
---

このモデルと

```
class Todo(models.Model):
    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
    created_at  = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    content     = models.CharField(verbose_name="内容",max_length=100)

    deadline    = models.DateTimeField(verbose_name="締切")
    is_done     = models.BooleanField(verbose_name="やった",default=False)
```

このシリアライザで、

```
class TodoSerializer(serializers.ModelSerializer):
    created_at  = serializers.DateTimeField(format="%Y年%m月%d日 %H:%M:%S")
    deadline    = serializers.DateTimeField(format="%Y年%m月%d日 %H:%M:%S")
    category    = CategorySerializer()

    class Meta:
        model   = Todo
        fields  = ("id", "category", "created_at", "content", "deadline", "is_done")
```

このオブジェクトを送信すると
```
{
  "id": 2,
  "category": {
    "id": 1,
    "created_at": "2024-12-23T12:00:00+09:00",
    "name": "テスト",
    "color": "#00ffcc"
  },
  "created_at": "2024年12月25日 12:00:00",
  "content": "aaaa",
  "deadline": "2024年12月25日 12:00:00",
  "is_done": false,
  "is_editing": false,
  "edit_text": "aaaaaa",
}
```
400 Bad Request エラーになる。

エラーの理由は、

- ~~Serializerに存在しないフィールドが含まれている ( is_editing, edit_text )~~ ←含まれていても問題はない。切り捨てられる
- ネストされたフィールドは送信できない
- 日時フォーマットが ISO 8601 に沿っていない

この2つにある。


## ネストしたフィールドは送信できない

```
class TodoSerializer(serializers.ModelSerializer):
    category    = CategorySerializer()

    class Meta:
        model   = Todo
        fields  = ("id", "category", "created_at", "content", "deadline", "is_done")
```

このようにネストしたフィールドを含んでいる場合、GETメソッドの場合は、

```
{
  "id": 2,
  "category": {
    "id": 1,
    "created_at": "2024-12-23T12:00:00+09:00",
    "name": "テスト",
    "color": "#00ffcc"
  },
  "created_at": "2024年12月25日 12:00:00",
  "content": "aaaa",
  "deadline": "2024年12月25日 12:00:00",
  "is_done": false,
}
```

CategorySerializerのフィールドがネストされて手に入る。

ただ、このSerializerはバリデーション(POSTとPUT)には使えない。先のようにリクエストを送信しても

```
{
  "id": 2,
  "category": 1,
  "created_at": "2024年12月25日 12:00:00",
  "content": "aaaa",
  "deadline": "2024年12月25日 12:00:00",
  "is_done": false,
}
```

このようにリクエストを送信しても、400エラーになる。対策として、Serializerを書き換える必要がある。


このようにかえって複雑になってしまうため、ハイブリッド型のSerializerを使う。

## 日時フォーマットが ISO 8601 に沿っていない

```
  "deadline": "2024年12月25日 12:00:00",
```

このように年月日を含む日時は受け付けられない。

## TIPS: DRFのModelViewSetはバリデーションエラーは400エラーを出すようになっている

DRFのviews.pyは、以下のようにModelViewSetを継承して作る。


```
from rest_framework import viewsets

from .models import Category,Todo
from .serializers import CategorySerializer,TodoSerializer

class CategoryView(viewsets.ModelViewSet):
    serializer_class    = CategorySerializer
    queryset            = Category.objects.all()


class TodoView(viewsets.ModelViewSet):
    serializer_class    = TodoSerializer
    queryset            = Todo.objects.all()
```


このModelViewSet、以下を多重継承して作られている。


```
mixins.CreateModelMixin,
mixins.RetrieveModelMixin,
mixins.UpdateModelMixin,
mixins.DestroyModelMixin,
mixins.ListModelMixin,
GenericViewSet
```

https://github.com/encode/django-rest-framework/blob/master/rest_framework/viewsets.py#L245

このCreateModelMixinは、serializer.is_valid() 時に 例外を出すようにしている。

https://github.com/encode/django-rest-framework/blob/master/rest_framework/mixins.py#L12


この例外を、キャッチしているのが、exception_handler() 。ここでレスポンスを返している。

https://github.com/encode/django-rest-framework/blob/master/rest_framework/views.py#L72

ただし、APIViewはこれらのMixinを継承していないため、400エラーは出ない。(DRFのAPIViewは、django.generic.views.View を継承している。)

https://github.com/encode/django-rest-framework/blob/master/rest_framework/views.py#L105

Restfulの観念に従うのであれば、APIViewでも例外と400エラーをレスポンスするように仕立てたほうが良いだろう。


## バリデーションエラー(400エラー)にならないようにするには？

```
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Todo
        fields  = ("id", "category", "created_at", "content", "deadline", "is_done")
```

シリアライザがこの場合、idを除いた全てのフィールドを指定する

```
{ 
  "category": 1,
  "content": "タスクの内容",
  "deadline": "2025-01-09T05:00",
  "created_at": "2025-01-09T05:00",
  "is_done": false,
},
```

モデルのフィールドオプションでdefaultを指定していたとしても、null=True,blank=Trueではないものは入力必須扱い。

よって、サーバー側で値を入れる予定のcreated_atもフロント側で指定する必要がある。

## 結論

まとめると、

- 1対多などで、ネストしたフィールドはリクエスト時に送信できない。
- 日付のフォーマットを送信する場合は、フォーマットを考慮する。

この2つを徹底する。でないと400エラーになる。


