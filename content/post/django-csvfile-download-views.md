---
title: "【Django】2次元配列をCSVファイルとしてダウロードできるようにする【HttpResponse】"
date: 2023-06-10T15:44:50+09:00
lastmod: 2023-06-10T15:44:50+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---



```
from django.views import View


from django.http import HttpResponse
import csv

class DownloadView(View):

    def get(self, request, *args, **kwargs):

        data    = [
                    [ 10,20,30 ],
                    [ 10,20,30 ],
                    [ 10,20,30 ],
                    ]

        # レスポンスとして返すCSVファイル名
        file_name   = 'data.csv'

        # HttpResponseを使ってCSVのデータを書き込む
        response    = HttpResponse(content_type='text/csv')

        # ファイル名を指定
        response['Content-Disposition'] = f"attachment; filename={file_name}"

        # HttpResponseにCSVファイルデータを書き込む
        writer      = csv.writer(response)
        writer.writerows(data)

        return response

download    = DownloadView.as_view()
```

HttpResponseはこのように`csv.writer()`の引数に指定することができる。

これにより、配列のデータをそのままCSVファイルとしてDLできるようになる。

