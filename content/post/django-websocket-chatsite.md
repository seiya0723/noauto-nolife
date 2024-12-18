---
title: "DjangoでWebSocketを使って、チャットサイトを作る"
date: 2024-12-17T16:33:35+09:00
lastmod: 2024-12-17T16:33:35+09:00
draft: false
thumbnail: "/images/Screenshot from 2024-12-17 16-32-56.png"
categories: [ "サーバーサイド" ]
tags: [ "WebSocket","django","JavaScript" ]
---

[django-channelsを使ってWebSocketを実現させる【チャットサイト開発に】](/post/startup-django-channels-web-socket/)

ここで、チャットサイトを作ったが、ページリロードで全て消えてしまう。

チャンネルレイヤーにメッセージを与えるだけでなく、DBにも記録するように仕立てた。




## consumers.py 

```
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

from .forms import ChatLogForm
from django.utils import timezone 

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name          = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name    = 'chat_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    
    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data):

        text_data_json  = json.loads(text_data)
        message         = text_data_json['message']

        chat_log = await self.save_chat_log(message)

        if chat_log == None:
            return False

        local_created_at    = timezone.localtime(chat_log.created_at)
        created_at_str      = local_created_at.strftime('%Y年%m月%d日%H:%M')  # 文字列に変換

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': chat_log.message ,
                'created_at': created_at_str ,
            }
        )


    # TODO: djangoの通常のORM動作は非同期ではないため、sync_to_async でラップする。
    @sync_to_async
    def save_chat_log(self, message):
        dic = {}
        dic["room"]     = self.room_name
        dic["message"]  = message
        form    = ChatLogForm(dic)

        if not form.is_valid():
            print(form.errors)
            return None
        
        return form.save()


    async def chat_message(self, event):
        message         = event['message']
        created_at      = event['created_at']

        await self.send( text_data=json.dumps({'message': message, "created_at": created_at }) )
```

DBの記録は同期的処理であり、async 関数内で直接実行することはできない。

そのため、`@sync_to_async` デコレータで関数をラップして呼び出している。

```
    # TODO: djangoの通常のORM動作は非同期ではないため、sync_to_async でラップする。
    @sync_to_async
    def save_chat_log(self, message):
        dic = {}
        dic["room"]     = self.room_name
        dic["message"]  = message
        form    = ChatLogForm(dic)

        if not form.is_valid():
            print(form.errors)
            return None
        
        return form.save()
```

DBに保存後、保存したデータをsendしている。

```
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': chat_log.message ,
                'created_at': created_at_str ,
            }
        )
```

## ソースコード

一部、非効率な箇所(テンプレートの継承してないなど)があるが、後に、DRF+Reactでの開発を考慮して、あえて細かく作り込まないようにした。

https://github.com/seiya0723/django-websocket-chatsite

DRF+ReactのSPAでWebSocketを実現する場合。SerializerやStateなどが加わるため、ここからコードの内容は大きく変わる。

## 結論

今回は、WebSocketとDB記録を両立させるため、django単体で作った。

次はDRF+ReactのSPAでWebSocketを作る。


