---
title: "1対多のモデル構造で、ネストしたserializers.pyを作る"
date: 2024-12-23T11:09:06+09:00
lastmod: 2024-12-23T11:09:06+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","drf","serializers.py","react" ]
---

通常、

```
class Category(models.Model):
    name = models.CharField(max_length=100)

class Todo(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
```

このモデル構造の場合、シリアライザはこうなる。


```
from rest_framework import serializers
from .models import Todo, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TodoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Todo
        fields = ['id', 'title', 'category']
```

ただこれだと、フロントサイドで得られる、JSONは、

```
[
    {
        "id": 1,
        "title": "Todo 1",
        "category": 1
    },
    {
        "id": 2,
        "title": "Todo 2",
        "category": 2
    }
]
```

このように、categoryのidのみであり、カテゴリ名を表示することはできない。



## ネストしたSerializerを指定する。

そこで、このように、TodoSerializer で `category = CategorySerializer()` とCategorySerializerを呼び出す。

```
from rest_framework import serializers
from .models import Todo, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TodoSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = Todo
        fields = ['id', 'title', 'category']
```

これにより、フロント側で得られるJSONは。

```
[
    {
        "id": 1,
        "title": "Todo 1",
        "category": {
            "id": 1,
            "name": "Work"
        }
    },
    {
        "id": 2,
        "title": "Todo 2",
        "category": {
            "id": 2,
            "name": "Personal"
        }
    }
]
```

このようにcategoryの詳細を含んだものがネストされてくる。


## Reactで表示をする場合。

Reactで表示をする場合、` todo.category `とオブジェクトをそのまま表示をすることはできないので、nameやidなどのプロパティを指定する。

```
    return (
        <>  
            <div className="todolist">
                { Object.entries(todos).map( ([id, todo]) => (
                    <div className="todo" key={todo.id}>
                        <div className="todo_inner">
                            <div>作成日: { todo.created_at }</div>
                            <div>カテゴリ: { todo.category.name }</div>
                            <div>締切: { todo.deadline }</div>
                            <div>やること: { todo.content }</div>
                            <div>実施済み: { todo.is_done ? "はい" : "いいえ" }</div>
                            <div>編集中か: { todo.is_editing ? "はい" : "いいえ" }</div>
                            <input type="button" value="編集する" />
                            <div>編集フォーム: 
                                <textarea className="form-control" value={todo.edit_text}></textarea>
                            </div>
                        </div>
                    </div>
                ))} 
            </div>
        </>
    );
```


