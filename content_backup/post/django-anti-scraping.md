---
title: "Djangoでスクレイピング対策をする【MIDDLEWAREでUA除外、ランダムでHTML構造変化等】"
date: 2021-10-02T19:05:06+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","セキュリティ","スクレイピング" ]
---

最近ではPythonのスクレイピング関係の書籍が増えてきて、誰でも簡単にスクレイピングできるようになってきている。

その影響か、私が管理しているサイトもしょっちゅうスクレイピングかと思われるアクセスがログから確認できる。

放置しているとさらにエスカレートし、ただの負荷にしかならないので、スクレイピングには対策が必要。本記事では、とりわけ私の得意なDjangoでその方法を記す。

## MIDDLEWAREにPython等のUAを検知したらMethodNotAllowedなどを返却

ちゃちなスクレイピングであればこれで対策できる。

    user_agent  = request.META.get('HTTP_USER_AGENT')

ただ、UAはあくまでも自己申告なので、このような子供だましは何時までも通用しない。下記のようにrequestsライブラリは任意のUAに書き換えできる。

    requests.get("https://example.com", headers={ "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0" })

とは言え、逆に考えれば、UAがカスタムできる仕様を逆手に取り、特定のUAしかアクセスを許可しない設定にすることもできる。

参照元:[Djangoで任意のHTTPレスポンス(ForbiddenやNotFoundなど)を返却する【HttpResponse subclasses】](/post/django-http-response/)

## 乱数を使用してHTMLの構造を書き換える、要素を一意に特定できるid属性を使わない。

もちろん、ユーザー側から見て見た目がわからないように仕立てる必要がある。

まずビューで乱数を生成。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    import random
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            flag    = random.randint(0,1)
            context = { "topics":topics,"flag":flag }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()

テンプレート側で乱数の値によってdivタグを増やしたり減らしたりする。スクレイピングの作りが甘いと再現性の低いバグが生まれる。

    <main class="container">
        <form method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment"></textarea>
            <input type="submit" value="送信">
        </form>

        {% for topic in topics %}
        <div class="border">
            {% if flag %}<div>{% endif %}
            {{ topic.comment }}
            {% if flag %}</div>{% endif %}
        </div>
        {% endfor %}
    </main>

ただ、このようにHTMLの構造を複雑にさせると、コーディング時に煩わしく感じるだろう。

## 一定時間内におけるアクセス数やDL容量を記録、超過したらアクセス拒否

まず、モデルが下記として、リクエストが送られるたびに、MIDDLEWAREでクライアントのIPアドレスを記録する。

    class AccessLog(models.Model):
    
        class Meta:
            db_table = "access_log"
    
        id      = models.UUIDField( default=uuid.uuid4, primary_key=True, editable=False )
        dt      = models.DateTimeField(verbose_name="アクセス日時",default=timezone.now)
        ip      = models.GenericIPAddressField(verbose_name="IPアドレス")


後は、MIDDLEWARE側で現在の日時から、遡って一定期間までのレコードであり、なおかつリクエストを送った端末と同じIPアドレスのレコードを取得。そのレコード数を確認し、一定値を超えていれば、ForbiddenやServerError等のレスポンスを返却すれば良いだろう。

これはNginxなどのミドルウェアとシェルスクリプトを使用すれば対処できるが、こちらのほうがモデルフィールドの追加でよりフレキシブルに対応できそうだ。

ただ、たかだかスクレイピング対策のためだけにDBを使用するべきか否かは、検討したい。

また、低速でスクレイピングをする場合には効果が期待できない。あくまでもサーバーダウンを避けたり、負荷を軽減したい方向け。


- 参照元1:[【Django】MIDDLEWAREを自作、未ログインユーザーにメディアファイルへのアクセスを拒否する【settings.py】](/post/django-create-middleware/)
- 参照元2:[Nginxのログをawkコマンドを使用して調べる【crontabで特定の条件下のログを管理者へ報告】](/post/nginx-log-check-by-awk/)

## アクセスするとAjaxが発動、コンテンツを表示する、もしくはボット判定

Selenium等のブラウザで駆動するタイプのスクレイピングには効果は限られるものの、requestsとBeautifulSoupの組み合わせには非常に有効。

アクセスした時にAjaxが発動して、サーバーにコンテンツを要求した後、Ajaxがデータを受け取ってレンダリングをする。これで、JavaScriptが動かないrequestsやcurl、wgetなどを一網打尽にできる。

ただ、この方法ではビューが増えてしまう。

## ブラウザを閉じるたびにセッションを切って、ログイン時にCAPTCHAを使用してボット対策

ほぼ全てのスクレイピングツールに対して有効。クレジットカードや証券取引所などのログイン画面でよくあるようなセキュリティ対策。

通常、ログイン式のサイトをスクレイピングする際、

- パスワードとIDのリクエストボディを含んだPOSTリクエストを送る
- Seleniumがプロファイルを読み込み、ログイン済みのセッションのあるCookieを使ってログインの工程を省略する

この2通りがある。

しかし、ブラウザが閉じるたびにセッションが破棄され、なおかつログイン時にCHAPTCHAを使用している場合、少なくとも完全自動では動作はしない。CHAPTCHAは手動で回答する必要がある。

スクレイピングは実行して結果が得られるまで放置するのが基本である以上、CHAPTCHAを解くという手間を与えている時点で、スクレイピングの放棄を促すこともできるだろう。

参照元:[独自ドメインのサイトにreCAPTCHAを実装させる方法と仕組み【ボット対策】](/post/recaptcha-setting/)

## 結論

まとめると、スクレイピング対策に有効なのは

- 特定UAの拒否、もしくはアクセスできるUAの限定
- 時間当たりのリクエスト数の制限
- 動的に変化するHTML構造
- JavaScriptを使用したコンテンツの表示
- ブラウザ閉じるたびにセッションの無効化
- CAPTCHAを含めたログインフォームの実装

この辺りかと。JavaScriptが発動しなければコンテンツを表示しないだけでもある程度の効果は期待できる。

とは言え、スクレイピング対策も限度を超えると、検索エンジンのボットも締め出しされ、検索順位が低くなり収益が低下する恐れもある。

何事も程々に。

コーディングが面倒であれば、ミドルウェアのNginx側から対策をすることもできる。

