---
title: "Django-summernoteでアップロード上限を設定する"
date: 2023-07-26T12:40:15+09:00
lastmod: 2023-07-26T12:40:15+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


デフォルトで、Django-summernoteにアップロードできるファイルサイズには上限が設定されている。

こちらで上限を開放できる

```
UPLOAD_SIZE = 200 * 1000 * 1000

SUMMERNOTE_CONFIG = { 
    'attachment_filesize_limit': UPLOAD_SIZE,
    'summernote': {
        'width': '100%',
        'height': '480',
    }   
}
```

参照: https://stackoverflow.com/questions/74588821/how-to-change-file-upload-size-limit-django-summernote
