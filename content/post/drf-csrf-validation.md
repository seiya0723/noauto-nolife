---
title: "DRFはいつCSRF検証をするのか？"
date: 2024-12-28T16:47:30+09:00
lastmod: 2024-12-28T16:47:30+09:00
draft: false
thumbnail: "images/drf.jpg"
categories: [ "サーバーサイド" ]
tags: [ "drf","セキュリティ","tips" ]
---


開発中、おかしなことが起こった。


これまでCSRFトークン無しで、PUTやDELETEメソッドが送信できていた。

だが、突然、同様の状況で403エラー(CSRF token missing)が起きた。

CSRFトークン無しでリクエストできていたものが、急に403エラーになりCSRF検証を行うようになった。

何故か？

## DRFのビューでは、CSRF検証が免除されている

https://github.com/encode/django-rest-framework/blob/master/rest_framework/viewsets.py#L146

DRFのビューは、このように `.as_view()`の戻り値に、csrf_exempt でCSRF検証が免除(無効化)されている。

urls.pyで、

```
from todolist import views as todolist_views

router = routers.DefaultRouter()
router.register(r"todolist/todo", todolist_views.TodoView, "todo")
router.register(r"todolist/category", todolist_views.CategoryView, "category")

urlpatterns = [
    # api エンドポイント
    path('api/', include(router.urls)),
]
```

このようにDefaultRouterのオブジェクトに登録をした時点で、内部で `.as_view()`が実行されている。

https://github.com/encode/django-rest-framework/blob/master/rest_framework/routers.py#L373

故に、DRFのビューを使っている以上、CSRF検証されない。それは下記サイトでも解説されていた。

- https://zenn.dev/ktnyt/scraps/8ee5e79e09d7b9
- https://qiita.com/romgaran/items/af48606b7188f420f24c


## ではなぜ、突然 403 Forbidden CSRF token missing のエラーが出たのか？

https://note.com/ym202110/n/nfdd86f4f99d1

こちらのサイトによると

> １．Cookie認証を利用する場合
>
> ２．Basic認証やDigest認証を利用する場合
>
> ３．トークン認証やJWT認証を利用し、かつトークンの保存先をCookieにした場合

この場合に限り、CSRF検証を行う。この時はCSRFトークンをリクエストヘッダに用意する必要がある。

つまり、JWT認証でLocalStorageに保存しない限り、CSRFトークンを用意する必要があるということ。

以前、JWT認証を済ませトークンをLocalStorageに記録し、その有効期限が切れ、JWT認証をしていないなら、辻褄があう。

なお、同様の内容が「[現場で使えるdjangoの教科書 Django REST Framework](https://www.amazon.co.jp/dp/B09KN9YRR4/?tag=m68371ti-22) 」の102ページで解説されていた。

### 今回なぜ403エラーが起きたか？時系列は？

1. 前もってJWT認証を済ませた
1. CSRFトークン無しで、PUTやDELETEメソッドの送信ができた。
1. JWT認証の部分を削除し、トークンの有効期限も切れる
1. この状況でPOSTメソッドを送ったため、403エラーになった。

という流れで今回は403エラーが出た。ということがわかる。

### では、CSRF検証がされるという根拠(ソースコード)は？

先のサイトの引用文は、冒頭で説明したDRFのGitHubコードと矛盾している。

- 冒頭のDRFのGitHubコードでは、全てのビューでCSRF検証は免除。
- 先のサイトは、セッションベースの認証、未認証の場合はCSRF検証がされる。

もし、全てのビューでCSRF検証がされなくなるのであれば、後者の説明がつかなくなる。

セッションベースの認証、未認証の場合はCSRF検証がされるという根拠(ソースコード)が必要だ。さらに調べてみた。

#### django.views.decorators.csrf.csrf_exempt 

https://github.com/django/django/blob/main/django/views/decorators/csrf.py#L51

この`csrf_exempt` は非同期、同期を問わず、CSRF検証を免除してくれる。

このコード自体には問題はないようだ。

#### django.middleware.csrf.CsrfViewMiddleware

https://github.com/django/django/blob/main/django/middleware/csrf.py#L165

このコードからは、セッションベースの認証もしくは未認証の場合はCSRF検証がされる、とは確認できなかった。

#### rest_framework.authentication.SessionAuthentication

問題はここにあった。

https://github.com/encode/django-rest-framework/blob/master/rest_framework/authentication.py#L112

ビューで免除したCSRF検証を、ここで実行しているようだ。

```
    def enforce_csrf(self, request):
        """
        Enforce CSRF validation for session based authentication.
        """
        def dummy_get_response(request):  # pragma: no cover
            return None

        check = CSRFCheck(dummy_get_response)
        # populates request.META['CSRF_COOKIE'], which is used in process_view()
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            # CSRF failed, bail with explicit error message
            raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)
```

セッションをベースにした認証をしている場合、CSRF検証を強制にする。先の .csrf_exempt() でdjangoのデフォルトのCSRF検証は無効化される一方。

rest_framework のデフォルト設定で有効になっている、 SessionAuthentication

https://github.com/encode/django-rest-framework/blob/master/rest_framework/settings.py#L40

これが、代わりにCSRF検証をしているようだ。

## 結論

セキュリティ上の話になるので、安易に鵜呑みにせず、公式のドキュメントとGitHubコードを活用して、根拠をしっかり確認していきたいところだ。

まとめると、

- DRFのビューでは、djangoのデフォルトのCSRF検証は免除される。
- セッションをベースにした認証をしている時、DRF側の SessionAuthentication でCSRF検証がされる。

ということになる。

DRFでCSRF検証がされるのは、

- セッションをベースにした認証を使っている時
- 認証情報がCookieに保存されている時
- そもそも認証をしていない時

この3つである。

よって、セッションベースの認証やCookieに認証情報を保存する場合、Ajax(fetchAPIやaxiosなども含む)リクエスト送信のたびに、ヘッダーにCSRFトークンを含める必要がある。

それができない場合は、JWT認証でトークンをLocalStorageに保存する必要がある。

[Django(DRF)+ReactのSPAでJWTを使った認証を実装する](/post/startup-django-react-jwt/)


## 【余談】djangoでCSRFトークンがCookieに記録されるのは脆弱性ではないか？

https://docs.djangoproject.com/ja/5.1/ref/csrf/#is-posting-an-arbitrary-csrf-token-pair-cookie-and-post-data-a-vulnerability

> 中間者攻撃がなければ、攻撃者はCSRFトークンのCookieを被害者のブラウザに送信する方法はない。
>
> 攻撃を成功させるには、XSSを使って被害者のブラウザのCookieを取得する必要がある。だが、その状況下ではCSRF攻撃を必要としていない。
> 
> 被害者が自分でCSRFトークンをCookieから取り出すこともできるが、それは脆弱性とは言わない。


更に、djangoのテンプレートではXSS対策がされているため、被害者のCookieは読み取りできない。

XSSが実現できる場合、あえてCSRF攻撃をする必要はない。というのが公式の見解。

「Cookieを使っている = 危険」というのは、本質的ではないということだ。

### DRFでは？

- DRF側は異なるオリジンからのリクエストを全て受け付ける設定にしておく
- セッションをCookieに保存している
- CSRFトークンの検証を免除している

この場合CSRFが成立する。

DRFではSPA開発のために別のオリジン(Reactサーバーなど)からのリクエストを許可しておく必要がある。

この時、全てのオリジンを許可してしまう設定をしたとして、CSRF検証をしておらず、セッション情報をCookieの中に含めている場合、CSRFが成立する。

django公式は、別オリジンからのCSRFはCORSの設定から成立せず、djangoサイト内でCSRFが成立する状況があれば、それはXSSができる状態なのでCSRFをあえてする必要はない(CSRF脆弱性は存在しない)と言っているのだ。

## 参考文献

- https://qiita.com/romgaran/items/af48606b7188f420f24c
- https://zenn.dev/ryutaro_h/articles/43156e2924f14a
- https://note.com/ym202110/n/nfdd86f4f99d1
- https://docs.djangoproject.com/ja/5.1/ref/csrf/
