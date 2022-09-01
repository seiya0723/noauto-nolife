---
title: "Django-allauthのメールを使用したログイン方式で、アカウント新規作成時、確認URLにアクセスしていないにもかかわらず、ログインできてしまうのはなぜか？"
date: 2022-06-19T16:12:44+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","allauth","tips" ]
---

allauthはそういう仕様になっているから。

前提として、下記記事の『メールアドレスとパスワードを使用した認証方法の実装』のコードを採用している場合に限る。

[【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)



## メールの確認の仕様を考慮するとわかる

1. アカウント新規作成時に送信されるメールの中にあるURL
1. このURLに対してGETリクエスト送信
1. Django側はこのURLに対してallauthの処理を行い、メールの確認をする

これがメールの確認の流れである。

では、未ログイン状態で、いかにしてallauthはリクエストオブジェクトからユーザーを特定するのか。

アカウント作成時にメールアドレスを指定した。メールアドレスはアカウントに紐付いている。ログインをせずして、どうしてメールの確認をしようというのか。


## 未ログイン状態でメールの確認をすると何が問題か？

仮に未ログイン状態でメールアドレスの確認をする仕様であれば、URLが漏れたら第三者が勝手にメールの確認ができてしまう。

allauthに欠陥があり、勝手にメールアドレスの追加をされた場合。未ログイン状態で確認ができると、部外者のメールアドレスが確認済みになる。


## メールの確認をしていない状態で処理を限定させるには

任意のビュークラスにて下記のように判定をすると良いだろう。

    #中略#

    from allauth.account.admin import EmailAddress

    class IndexView(View):

        def get(self, request, *args, *kwargs):
    
            if not EmailAddress.objects.filter(user=request.user.id,verified=True).exists():
                print("メールの確認が済んでいません")

                return redirect("account_email")







## 結論

メールの確認はあくまでもメールの存在確認。ログインとは切り離して考えるべきだろう。

参照元:https://stackoverflow.com/questions/54467321/how-to-tell-if-users-email-address-has-been-verified-using-django-allauth-res

