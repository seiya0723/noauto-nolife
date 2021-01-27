---
title: "【django-cleanup】画像等のファイルを自動的に削除する"
date: 2021-01-26T16:18:42+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---

例えば、Djangoの画像掲示板で削除をする時、ビューでレコードを削除すると同時に、レコードに紐付いた画像も同時に削除すると思う。その時、パスを抜き取り、`os.remove()`などを使用して画像を削除しているようでは、ビューの処理がどんどん増えていく。

Djangoでは、レコードに紐付いたファイルの削除処理記述の手間を減らしてくれる`django-cleanup`なるものがある。本記事ではその使用方法を解説する。


## 使い方

まず、インストールする。

    pip install django-cleanup

後は`settings.py`の`INSTALLED_APPS`に`"django_cleanup"`を追加するだけ。

    
    INSTALLED_APPS = [ 

        ....
    
        'django_cleanup',
    
    ]

これだけで実装は完了。レコードに紐付いたファイルは、レコードが削除されると同時に削除されていく。

## django-cleanupの落とし穴

django-cleanupによって、ファイル削除が発動するのは、ファイルに紐付いたレコードが削除されたときのみである。つまり、編集に対しては発動しない。手動で削除する必要がある。

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 08-55-49.png" alt="編集時にはDjango-cleanupは発動しない"></div>

## 結論

django-cleanupはサードパーティー製のライブラリなので、デプロイ時にはデプロイ先の端末にもインストールさせることを忘れなく。

