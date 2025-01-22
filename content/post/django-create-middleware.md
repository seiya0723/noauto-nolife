---
title: "【Django】MIDDLEWAREを自作、未ログインユーザーにメディアファイルへのアクセスを拒否する【settings.py】"
date: 2021-08-28T17:17:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","セキュリティ" ]
---

未ログインユーザーに対して動画や画像等のメディアファイルは公開したくない。しかし、何も対策をしていないとメディアファイルは誰でも見放題の状態になってしまう。

たとえそれが有料コンテンツであったとしても、mp4やpngのリンクを直接アクセスするだけで誰でも見れる。これではユーザーは離反する。

そこで、どんなリクエストでも必ず通るDjangoのMIDDLEWAREを利用する。本記事ではMIDDLEWAREの自作方法を解説する。

## MIDDLEWAREとは

まず、DjangoのMIDDLEWAREと、一般的なミドルウェアは別物である。

DjangoのMIDDLEWAREはクライアントから送信されたリクエストをDjangoが受け取った後、ルーティングのurls.pyに行き着く前に必ず通る場所のこと。そして、レスポンスが返却される際にもMIDDLEWAREを経由した上でクライアントに行き着く。つまり、サーバーとクライアントの橋渡しをする係。

行きと帰りで必ず通ることから、デフォルトでCSRFやクリックジャッキング等のセキュリティ対策や、認証状態かどうかをチェックするミドルウェアなどが用意されている。このMIDDLEWAREを自前で作ることで、どんなリクエスト、レスポンスに対しても処理を追加することが可能になる。

## MIDDLEWAREの作り方

コードは[【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)から流用し、画像送信機能を実装させた。

ミドルウェアのファイルを作る。アプリディレクトリ内に`middleware`を作り、ファイルを作成する。下記は`bbs/middleware/only_authorized_show_media.py`とした。

[Django公式](https://docs.djangoproject.com/en/3.2/topics/http/middleware/#writing-your-own-middleware)から引用したクラスを書く。

    class SimpleMiddleware:
        def __init__(self, get_response):
            self.get_response = get_response
            # One-time configuration and initialization.
    
        def __call__(self, request):
            # Code to be executed for each request before
            # the view (and later middleware) are called.
    
            response = self.get_response(request)
    
            # Code to be executed for each request/response after
            # the view is called.
    
            return response


つまり、Djangoサーバーに対してリクエストが送られる度、`__call__`メソッドを通る。そして、urls.pyを通り、views.pyを通り、テンプレートがレンダリングされ、最終的に処理された結果がresponseとして返却される。

もし、ログインしていないユーザーに対して、画像等のメディアファイルへのアクセスがあれば、拒否する仕組みにしたい場合、`self.get_response(request)`を実行するよりも前に、未ログイン状態でありなおかつメディアファイルに対するアクセスである判定を行い、`HttpResponseForbidden`や`HttpResponseNotFound`などを返却すれば良い。

よって、最終的な`only_authorized_show_media.py`のコードはこうなる。

    from django.http import HttpResponseForbidden
    
    class SimpleMiddleware:
        def __init__(self, get_response):
            self.get_response = get_response
    
        def __call__(self, request):
    
            if not request.user.is_authenticated and "media" in request.get_full_path():
                return HttpResponseForbidden()
    
            response = self.get_response(request)
    
            return response

runserverを実行したときのログを見ていると、画像とHTMLのページは別のリクエストとして処理される事がわかる。故に画像に対するリクエストがあれば、それだけ`HttpResponseForbidden`を返せば良い。これで未ログインユーザーは画像が表示されない。

ビューやテンプレート側で`is_authenticated`等で判定してレンダリング結果を変更する方法は普通にアクセスすれば画像は表示されないが、画像に対してURL直接アクセスした場合は丸見え。しかし、ミドルウェアで判定する場合はURL直接アクセスであっても見ることはできない。

このミドルウェアのファイルを書いた後は、`settings.py`の`MIDDLEWARE`に追加しなければ動いてくれない。下記のように`settings.py`を修正する。

    MIDDLEWARE = [ 
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',

        'bbs.middleware.only_authorized_show_media.SimpleMiddleware'
    ]

これで作ったMIDDLEWAREが実装された。

## 動かすとこうなる。

実際に動かすとこうなる。

ログインしていない状態でアクセスすると、画像は表示されない。

<div class="img-center"><img src="/images/Screenshot from 2021-08-29 17-21-48.png" alt="画像が表示されない"></div>

<div class="img-center"><img src="/images/Screenshot from 2021-08-29 17-21-54.png" alt="403"></div>

画像のURLに直接アクセスしても、403とレスポンスが返されるだけで、閲覧できない。

<div class="img-center"><img src="/images/Screenshot from 2021-08-29 17-23-32.png" alt="直接アクセスでも表示はされない"></div>

## 結論

MIDDLEWAREはリクエストをDjangoが受け取った時点で必ず通る。この仕組みは色々と応用できそうだ。

例えば、今回の件を改良して、有料コンテンツを一箇所のディレクトリに配置、そのディレクトリに対して有料会員ユーザー以外がアクセスしたら`HttpResponseForbidden`を返す。特定IPアドレス以外の管理サイトへのアクセスのNotFound化、アクセス解析ツールの自作など、必ず通る特性を利用すれば、主にセキュリティ関係を中心に色々応用できると思われる。特にファイル関係のアクセスはビューを通らないので、有効であると思われる。

問題として、逆にどんなリクエストでも必ずミドルウェアを通る性質上、実装させる処理は必要最低限にとどめないといけないことだ。さらに、今回は未ログインユーザーに対してメディアファイルのアクセスを拒否する事ができたが、ログインユーザーが自らメディアファイルをDLして流出してしまうことも考えられる。その場合はDRM等の別途対策が必要になるが、それはいずれ追加で解説を行う予定。

また余談だが、Twitterでは2021年1月時点で鍵付きのアカウントでアップロードしたメディアファイルは、未ログインのユーザーでも画像URLへ直にアクセスすれば誰でもどこからでも見放題。安全だと思ったら大間違い。鍵付きでも投稿した画像や動画は誰でも見れる。SNSとは本当に恐ろしいところである。

## 参照元

https://ja.wikipedia.org/wiki/HTTP%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89

https://docs.djangoproject.com/en/3.2/ref/request-response/#httpresponse-subclasses

https://docs.djangoproject.com/en/3.2/topics/http/middleware/#writing-your-own-middleware
