---
title: "【Django】開発を始める上で最初に覚えておいたほうがよい Django Templates Language(DTL)"
date: 2021-11-04T08:25:53+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---

[DjangoでHelloWorldを表示](/post/startup-django-helloworld/)させた後、次にやることはDjango Templates Language(DTL)の習得。

DTLを使うことで、ビューから受け取った変数を表示させたり、条件分岐させたり、繰り返して同じ内容のHTMLを表示させたりすることができる。

## Django Templates Language (DTL)とは

例えば、ログイン機能のあるサイトで、未ログインのユーザーにはログインページのリンクを表示、ログイン済みのユーザーにはマイページのリンクを表示させる時、DTLを使用すればこのように表現できる。

    <div>
    {% if request.user.is_authenticated %}
    <a href="hoge">マイページのリンク</a>
    {% else %}
    <a href="huga">ログインページのリンク</a>
    {% endif %}
    </div>

もし、ログイン済みのユーザーには、このように表示される。


    <div>
    <a href="hoge">マイページのリンク</a>
    </div>

未ログイン状態であれば、こうなる。

    <div>
    <a href="huga">ログインページのリンク</a>
    </div>

このようにビューから受け取った変数によって、HTMLの内容や構造そのものを書き換えたい場合、DTLを使うことで解決できる。

## 変数表示

ビューから受け取った変数の表示には`{{ 変数 }}`を使う。

例えば、ビューが下記の状態(クラスベースのビューからテンプレートへレンダリングする状態)であれば、

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            return render(request,"index.html")
    
    index   = IndexView.as_view()

下記のように、辞書型の変数を`render()`の第三引数として指定すれば良い。これでビュー側からテンプレート側に変数を引き渡しできる。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            context = { "test":"あああああああ" }
            return render(request,"index.html",context)
    
    index   = IndexView.as_view()

`index.html`側では、第三引数に指定した辞書型の変数のキーを指定して呼び出す。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {{ test }}
    </body>
    </html>

これで下記のように指定したキーに対応する値を表示できる。今回は`test`に対応した`あああああああ`が表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 09-09-26.png" alt="変数表示"></div>

## テンプレートタグ編

テンプレートタグは`{% タグ名 %}`のように記述する。

### if 

冒頭でも紹介したとおり、if文を使えば、与えられた変数の値によって、表示するHTMLを切り替えることができる。

例えば、ビューが下記の状態である場合、

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            context = { "bool":True }
            return render(request,"index.html",context)
    
    index   = IndexView.as_view()

index.htmlが下記であれば、

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {% if bool %}
        真
        {% else %}
        偽
        {% endif %}
    </body>
    </html>

ページには真と表示される。このように、値もしくは条件式によって描画するHTMLを分岐させる事ができる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 10-13-17.png" alt="条件式もしくは値によって分岐する"></div>

そして、DTLにおけるifはPythonのifとは違って、インデント構文ではなく、ifの終わりを示すためendifを書く。このendifを忘れてしまうと、ブラウザ上にこのようなエラーの表示が出る。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 10-40-49.png" alt="テンプレートエラー"></div>

もしこのようなエラーが出てきた場合、真っ先にテンプレート(HTML)のエラーを疑うことを強くおすすめする。

### for

forを使うことで、同じHTMLをデータに合わせて繰り返し表示させることができる。例えば、ビューから与えられる変数がこのような、リスト型だったとする。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            context = { "numbers":[ 1,2,3,4,5,6,7,8,9,0 ] }
            return render(request,"index.html",context)
    
    index   = IndexView.as_view()

このリスト型の値を変数表示でそのまま表示させてしまうと、

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {{ numbers }}
    </body>
    </html>

出てくるのは、ただのリスト型である。リスト型がそのまま表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 10-54-28.png" alt="リスト型がそのまま表示される。"></div>

では、リスト型の中身の数字を表示させたい時。ここでDTLのforを使う。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {% for number in numbers %}
        <div>{{ number }}</div>
        {% endfor %}
    </body>
    </html>


リスト型の`numbers`から1つ取って`number`という変数に割り当てる、その`number`はforの中にある処理から呼び出しができる。

つまり、先のコードはDTLが解釈されると、下記のようになる。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>0</div>
    </body>
    </html>

その結果、このように表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 10-59-17.png" alt="リスト内のデータが順次表示された"></div>

ちなみに、繰り返し処理のfor文もif文と同様にendforを書かなければ、エラーが出てしまう。

続いて、ビューから与えられる変数がリスト型ではなく、辞書型のリスト型である場合。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):

            members = [ { "id":0,"name":"零郎" },
                        { "id":1,"name":"一郎" },
                        { "id":2,"name":"二郎" },
                        { "id":3,"name":"三郎" },
                        { "id":4,"name":"四郎" },
                        { "id":5,"name":"五郎" },
                        { "id":6,"name":"六郎" },
                        { "id":7,"name":"七郎" },
                        { "id":8,"name":"八郎" },
                        { "id":9,"name":"九郎" },
                    ]

            context = { "members":members }
            return render(request,"index.html",context)
    
    index   = IndexView.as_view()

当然、そのまま`{{ members }}`と書くと、辞書型のリスト型で表示される。だから、先と同じようにfor文を使う。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        <div>
            {% for member in members %}
            <div>ID:{{ member.id }}</div>
            <div>名前:{{ member.name }}</div>
            {% endfor %}
        </div>
    </body>
    </html>


ここで注意しなければならないのは、for文の中で`{{ member }}`と書いてしまうと、`{ "id":0,"name":"零郎" }`などとそのまま辞書型のデータが表示されてしまう点。

だから辞書型の中のキーを指定する必要がある。ただし、Pythonのキーの呼び出し方のように`member["id"]`などと書くのではなく、DTLではオブジェクトの属性参照のように`member.id`、`member.name`と書く。

また、ループさせるHTMLを工夫させることで、さらに見やすくすることができる。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    <td>ID</td>
                    <td>名前</td>
                </tr>
            </thead>
            <tbody>
                {% for member in members %}
                <tr>
                    <td>{{ member.id }}</td>
                    <td>{{ member.name }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </body>
    </html>

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 11-30-10.png" alt=""></div>

### csrf_token

`csrf_token`はHTTPリクエストのPOSTメソッドを送信する時、CSRFの対策として設置される物。

まず、ビューにPOSTメソッドを作る。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            return render(request,"index.html")

        def post(self,request):
            return render(request,"index.html")
    
    index   = IndexView.as_view()


`index.html`の`body`タグ内に下記コードを追加する。

    <form action="" method="POST">
    {% csrf_token %}
    <input type="submit" value="送信">
    </form>

送信ボタンが表示されるので、押すと、ビューのpostメソッドが実行される。この時、`{% csrf_token %}`が設置されていない場合、CSRFトークンの検証に失敗したためエラーがページに表示される。

つまり、Djangoにおいて、POSTメソッドのHTTPリクエストを送信する際には、そのformタグ内に`{% csrf_token %}`が必須である点を覚えておくと良いだろう。

CSRFに関しては下記記事の末尾付近で解説している。

[ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】](/post/startup-web-application-framework/)

### comment

commentはコメントアウトを意味するDTL。通常、HTMLにおいて、コメントアウトと言えば

    <!--
        この部分がコメントアウトされ、ページには表示されない。
    -->

であるが、DTLのcommentはDTLごとコメントアウトする。つまり

    {% comment %}

    この部分はコメントアウトされているため、DTLとして解釈されずテンプレートエラーも発生しない。
    {% for number in numbers %}

    {% endcomment %}

このようにDTLとして解釈されないので、テンプレートエラーは起こらない。

書きかけのDTLをとりあえず一旦無効化させたい場合などに使うと良いだろう。


## テンプレートフィルタ編

テンプレートフィルタは表記を書き換えたりする事ができる。例えば、日付の表記を変えたり、httpから始まる文字列をリンクに仕立てたりすることなどが可能になる。

### length

`length`は指定した変数の要素数や文字列型変数であれば文字列の長さを表示できる。pythonの`len()`と挙動は同じ。ただし、テンプレートフィルタなので、表記はこうなる。

    {{ numbers|length }}

これでnumbersの要素数が表示できる。さらに、この要素数の表示を応用することで、投稿された件数などをわかりやすく表示させることができる。

    {{ topic|length }}件のデータが投稿されています。

### urlize

`urlize`はhttpから始まる文字列をリンクタグ(`<a href=""></a>`)に仕立てることができる。

    {{ comment|urlize }}

これにより、httpから始まる文字列をわざわざコピーしてブラウザのURLバーに貼り付けるなどをしなくとも、ワンクリックですぐにURLへアクセスできる。

SNS等を作るのであれば、後述のlinebreaksbrもセットで使うと良いだろう。

### linebreaksbr

`linebreaksbr`は文字列の改行を意味する`\n`をHTMLの改行を意味する`<br>`に書き換えるフィルタである。

    {{ comment|linebreaksbr }}

textareaタグで投稿したコメントで、改行ありで投稿された場合、通常、改行は無視されて1行で表示される。これは文字列の入力時の改行`\n`がHTMLの改行を意味する`<br>`とは違うから改行として解釈されず、1行で表示されてしまう。

そこで、先の`linebreaksbr`フィルタを使うことで`\n`が`<br>`になり、改行が考慮して表記される。

前項のurlizeとセットで使うことで、httpから始まる文字列はリンクタグにして、改行コードを意味する`\n`は`<br>`に書き換える事が同時にできる。

    {{ comment|urlize|linebreaksbr }}

### date

`date`は日時の表記を変えるフィルタである。下記のように日時型のデータをテンプレートに与える。

    from django.shortcuts import render
    from django.views import View

    import datetime 
    
    class IndexView(View):
    
        def get(self,request):

            dt  = datetime.datetime.now()

            context = { "dt":dt }
            return render(request,"index.html",context)
    
    index   = IndexView.as_view()

`index.html`にて、普通に表示させるとこうなる。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {{ dt }}
    </body>
    </html>

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 14-33-47.png" alt=""></div>

このような表記になる。もし、この日時の表記を変更したい場合は、`date`フィルタを使う。

`date`フィルタは表示させる日時の表記方法を自由に変更させることができる。

例えば下記のように`date`フィルタを指定すれば、

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>DTLのテスト</title>
    </head>
    <body>
        {{ dt|date:"Y-m-d H:i:s" }}
    </body>
    </html>

このように表記される。デフォルトでは秒まで表記されていないので、秒まで表記させたい場合は、`date`フィルタの使用は必須である。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 14-40-37.png" alt=""></div>

ちなみに余談だが、先のようにデフォルトで日本語の日時表記がされているのは、`settings.py`で

    LANGUAGE_CODE = 'ja'

と日本語で表示するように指定しているからである。つまり、これがデフォルトの

    LANGUAGE_CODE = 'en-us'

であれば、表示はこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 14-36-22.png" alt=""></div>

英語表記になる。この状態で`date`フィルタを使うと、表記は日本語で`date`フィルタを使用したときの画像と同様になる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-04 14-40-37.png" alt=""></div>

