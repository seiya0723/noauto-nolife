---
title: "DRFで400 Bad Request エラーが出る時は、Serializerのフィールドを確認する"
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

オブジェクトを送信すると
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
  "is_done": false
  "is_editing": false
  "edit_text": "aaaaaa"
}
```
400 Bad Request エラーになる。

エラーの理由は、

- Serializerに存在しないフィールドが含まれている ( is_editing, edit_text )
- ネストされたフィールドは送信できない
- 日付のフォーマットに従っていない？ ←要検証




## 結論

まとめると、

- Serializerのfieldsに存在しないフィールドは含めてはいけない。
- 1対多などで、ネストしたフィールドはリクエスト時に送信できない。
- 



