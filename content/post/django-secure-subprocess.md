---
title: "Djangoでpython3のsubprocessモジュールを使い、任意のコマンドをなるべく安全に配慮して実行させる"
date: 2022-01-05T08:16:48+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","システム管理","セキュリティ" ]
---

ふと思った。

毎度毎度、SSHクライアントがインストールされている端末を起動させ、サーバーにログイン、コマンドで操作するめんどくささ、どうにかできないだろうかと。

ウェブアプリから任意のコマンドを実行することができれば、わざわざSSHを使わなくても、ブラウザだけで簡単にコマンドが実行できる。ただ、問題になってくるのがセキュリティ。

不適切なコマンドを実行されてしまうと、当然システムは壊れる。そこで、なるべくセキュリティに配慮して、事前にサーバーサイドにハードコードしたコマンド、スクリプトを実行させる。

## はじめに

使用されているモジュールの仕様、考えられる脅威等を並べる。

### subprocessモジュールについて

Pythonでは任意のコマンドを実行するsubprocessモジュールがある。本件ではこのモジュールをDjangoのビューに指定して任意のコマンドを実行する。

下記のように実行するコマンドをリスト型にする。

    result  = subprocess.run(["ls","-al"])

ただ、この場合、`cd`コマンドなどは受け付けてくれない。例外が発生する。

そこで、`.run()`メソッドのキーワード引数として`shell=True`を指定する。これで`cd`コマンドなどが実行できる。ただし、`shell=True`の場合、実行するコマンドはリスト型ではなく、文字列型で指定する。

    result  = subprocess.run("cd ../" , shell=True)
    
また、これによって、コマンドが正常終了した後に次のコマンドを実行する`&&`なども有効になってしまう。

ルートに移動して中のファイルを表示することも可能になる。これはウェブアプリとして運用するにはセキュリティ的に問題がありすぎる。

#### カレントワーキングディレクトリを指定する

    result  = subprocess.run(["ls","-al"] , cwd="script/")

これでscriptディレクトリ内のファイルを表示する。


#### 実行結果を参照し、文字列型変数に格納する

Djangoのビューで処理をした後、テンプレートに実行結果をレンダリングしないといけない。実行結果を参照するにはこうする。

    cp      = subprocess.run(command , stdout=subprocess.PIPE ,shell=True)

    if cp.returncode != 0:
        print("失敗")
    
    else:
        #UTF-8でデコードしないと日本語が文字化けする。
        print(cp.stdout.decode("utf-8"))


ここでUTF-8でデコードしなければ日本語が文字化けするので注意。

### 考えられる脅威と対策

クライアント側から任意のコマンドを実行する仕様上、OSコマンドインジェクション攻撃が想定される。

仮にウェブアプリが、実行する予定のコマンドのボタンを押下して実行する形式であった場合、実行するコマンドの文字列をいじって悪意あるコマンドを実行できる。

引数のみを文字列型で自由に指定できる形式であったとしても、先ほどのsubprocessモジュールの例で、`&&`が使用できることがわかっているため、引数に&&を仕込んで、悪意あるコマンドを連結させることも可能である。


故に、実行を許可するコマンドのみを事前に登録するホワイトリスト形式にしておき、なおかつ、引数に`&`や`|`等を仕込まれないよう、正規表現で禁止文字列を含んでいないかをチェックする必要がある。

それから、念のために認証済みのユーザーのみアクセスを許可する形式にしたほうが良いだろう。IDとパスワードで事前のログインした上で、限られたコマンドの実行を許可する。

他にもDjangoのMIDDLEWAREにて、特定IPアドレス以外のユーザーを拒否するなどの対策も状況によっては有効と思われる。

また、実行したコマンドはDBへ記録する。Djangoのモデルを予め定義しておく。これでコマンド実行後に不具合が起こった際、原因の特定がある程度はできるだろう。

### 実行させないほうがよいコマンド

サーバー側でコマンドを実行する都合上、大量にある。ぱっと思いつくだけでも以下の通り。

#### パッケージ管理ツール系のコマンド

yum、apt、dpkg等を実行されると、OSにインストールされているパッケージの一覧が確認できてしまう。管理者であればインストールも削除もできてしまう。

Pythonのライブラリを管理するpipなども実行させないよう配慮したほうがよい。

#### shutdown等のシステム操作系コマンド

勝手にシャットダウン、再起動されてしまう。

#### rm等のファイル、ディレクトリ削除系コマンド

ファイル・ディレクトリ削除系コマンドは実行できる範囲を限定させるか、そもそも禁止しておいたほうが良いだろう。

#### grepやfind等のファイル、ディレクトリ探査系コマンド

findコマンドは-exec評価式を使うことで、簡単に任意のコマンドを実行できる。それ以外のファイル・ディレクトリ探査系コマンドは実行できる範囲を限定させたほうが良いだろう。

catコマンドも例外ではない。下記のようなコマンドを実行されると、攻撃者のヒントになるだろう。

    cat /etc/ssh/sshd_config

#### リダイレクト

echoコマンドとリダイレクトを組み合わせると、簡単に任意のコマンドを実行するシェルスクリプトなどを作られ、それを実行されてしまう。

#### sed等のファイル編集系コマンド

リダイレクトと同様に、ファイルの内容を任意のコマンドに編集して実行できる。

#### telnet、ssh等のリモートログイン系コマンド

踏み台にされる。

## コード解説

### config/settings.py

settings.pyに、実行を許可するコマンドのリストを記載する。ホワイトリスト方式である。

views.pyはこの許可リストを読み込み、投稿されたコマンドが許可リストに該当するかをチェックした後、実行させる。

    #commandアプリ用
    #許可するコマンドの一覧をここに書く
    ALLOW_COMMAND_LIST = [ "ls" ]


今回は`ls`コマンドのみ許可した。

### remote/models.py

コマンドと実行日時を記録する。そのためにまずはモデルを定義する。ただ、実行するコマンドには、コマンドを連続実行できる`&`等を拒否する正規表現を搭載する。

    from django.db import models
    from django.utils import timezone
    
    from django.core.validators import RegexValidator
    
    class History(models.Model):
    
        dt      = models.DateTimeField(verbose_name="実行日時",default=timezone.now)
    
        #禁止する特殊文字( & | > < ; ` )。 ?!.*() の括弧内に指定した文字を含まない文字列。
        command_regex   = RegexValidator(regex=r"^(?!.*(\&|\||\>|\<|\;|\`)).*$")
        command         = models.CharField(verbose_name="実行したコマンド",max_length=300,validators=[command_regex])
    
        def __str__(self):
            return self.command


コマンドを複数書くことができる、`&`や`;`に加え、別コマンドに値を与える`|`も禁止。ファイルの作成や別ファイルの内容を書き換えする際に使える、リダイレクト(`>`と`<`)も禁止にした。

他にもワイルドカードとして使用できるアスタリスク(`*`)などを拒否するべきか迷ったが、状況によっては使う可能性も有るため、今回は対象とはしないことにした。

参照元:http://itdoc.hitachi.co.jp/manuals/3020/30203S3530/JPAS0125.HTM


### remote/forms.py

モデルをそのまま継承して作る。モデルの正規表現バリデーションを引き継ぎ、保存することができる。

    from django import forms 
    from .models import History 
    
    class HistoryForm(forms.ModelForm):
    
        class Meta:
            model   = History
            fields  = [ "command" ]
    

### remote/views.py


    from django.shortcuts import render,redirect
    from django.views import View
    
    from django.contrib import messages
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    from django.conf import settings 
    
    
    from .models import History 
    from .forms import HistoryForm
    
    import subprocess,sys
    
    
    class IndexView(LoginRequiredMixin,View):
    
        def get(self, request, *args, **kwargs):
    
            context                 = {}
            context["histories"]    = History.objects.order_by("-dt")
    
            return render(request,"remote/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            #===========ここで送信されたコマンドのチェックをする=====================
    
            form    = HistoryForm(request.POST)
    
            #不適切な文字列(コマンドの連続実行に使える&や|など)をチェックする。含んでいれば許可しない
            if not form.is_valid():
                messages.info(request, form.errors)
                return redirect("remote:index")
    
            print("OK")
    
            clean   = form.clean()
            command = clean["command"]
    
            #冒頭の空白を除去、リスト型に変換。最初のコマンドをチェックする
            command_list    = command.strip().split(" ")
    
            #このパターンはありえないが、models.py及びforms.pyの仕様が変わるとありえるパターンなので設置
            if len(command_list) == 0:
                messages.info(request, "エラー")
                return redirect("remote:index")
            
    
            #HACK:添字を直指定している。できれば要修正
            if command_list[0] not in settings.ALLOW_COMMAND_LIST:
                messages.info(request, "このコマンドは許可されていません")
                return redirect("remote:index")
    
            #===========ここで送信されたコマンドのチェックをする=====================
    
    
            #============ここでコマンドを実行する============
    
            #shell=Trueにすると、&&を実行したり、cdコマンドが実行できる(※ただし文字列型にして引き渡しをする必要が有る。)
            #stdout=subprocess.PIPEを指定して実行結果を出力できるようにする。
            cp      = subprocess.run(command , stdout=subprocess.PIPE ,shell=True)
    
            if cp.returncode != 0:
                messages.info(request, "コマンドの実行に失敗しました")
                return redirect("remote:index")
    
            #UTF-8でデコードしないと日本語が文字化けする。
            print(cp.stdout.decode("utf-8"))
            messages.info(request, cp.stdout.decode("utf-8"))
            form.save()
    
            #============ここでコマンドを実行する============
    
            return redirect("remote:index")
    
    index   = IndexView.as_view()


subprocessモジュールをインポートして、実際にコマンドを実行する。settings.pyに書いた許可コマンドリストに含まれていれば実行する。

実行結果を表示させる際、UTF-8でデコードしている。こうしないと日本語は文字化けしてしまうため。

他にもユーザー認証済みでなければビューを実行しないようにしている。`LoginRequiredMixin`で実現できる。認証機能は、[allauthを使用せずに認証する方法](/post/django-auth-not-allauth/)を採用した。

### templates/remote/index.html

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Server Command Line</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
    <style>
    .command_area {
        background:black;
        color:#0fc;
        padding:1rem;
        margin:1rem;
        font-size:1.2rem;
        height:30vh;
        overflow:auto;
    }
    </style>
    
    </head>
    <body>
    
        <h1 class="bg-primary text-white text-center">Server Command Line</h1>
    
        <main class="container">
            <div>
                <a href="{% url 'logout' %}">ログアウト</a>
            </div>
    
            <form class="m-2" action="" method="POST">
                {% csrf_token %}
                <div class="input-group">
                    <input class="form-control" type="text" name="command" placeholder="実行するコマンド" maxlength="300" autofocus>
                    <div class="input-group-append">
                        <input class="form-control btn btn-outline-primary" type="submit" value="実行">
                    </div>
                </div>
            </form>
        
            <h2>実行結果</h2>
            <div class="command_area">
                {# TISP:linebreaksbrで\nをbrタグに変換させる。 #}
                {% for message in messages %}
                <div>{{ message|linebreaksbr }}</div>
                {% endfor %}
            </div>
    
            <h2>実行履歴</h2>
            <div class="command_area">
                {% for history in histories %}
                <div>{{ history.dt }}: {{ history.command }}</div>
                {% endfor %}
            </div>
        
        </main>
    
    </body>
    </html>
    

実行結果をdjango-message-frameworkを使用して表示させている。実行したコマンドの履歴も合わせて表示している。

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-18-55.png" alt=""></div>

このように、`models.py`で指定した正規表現に含まれる文字を入力すると拒否される。

今回は`ls -al && shutdown -h now`を実行した。コマンド履歴には記録されない。

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-19-54.png" alt=""></div>

lsコマンド以外を入力するとこうなる。今回は`shutdown -h now`を実行した。

当然拒否されるし、コマンド履歴にも記録はされない。

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-21-07.png" alt=""></div>

認証をしていなければログインページに飛ばされる。

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-22-45.png" alt=""></div>

lsコマンドを実行するとこうなる。引数の入力は許可されている。カレントワーキングディレクトリはプロジェクトディレクトリの直下である。

ターミナルから実行する場合と違って、TABで区切られていないので、若干見づらい。この問題を解決するには、tableタグを使用するなどが考えられる。

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-23-31.png" alt=""></div>

ちなみに、`ls -al /`などと入力すると`/`内のファイル等が見えてしまうため、別途対策は必要である。

## 結論

クライアントが送った任意のコマンドをサーバーに実行させることそのものはとても危険で、適切な管理と厳格な制限がなければ、悪用されかねない。

とは言え、SSHすら使えない環境下や、簡単なコマンドをワンクリックで実行するなど、アイデア次第で様々な場面で役に立つのではないかと考えている。

LAN内にあるプライベート用のサーバーであれば、スマホからサーバーの電源を落としても問題はないわけで。わざわざPCを起動してサーバーにアクセスする面倒はこれで解決できる。

## ソースコード



