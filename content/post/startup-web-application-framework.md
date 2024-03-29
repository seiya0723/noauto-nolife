---
title: "ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】"
date: 2021-10-21T14:44:50+09:00
draft: false
thumbnail: "images/Screenshot from 2021-10-22 13-56-36.png"
categories: [ "サーバーサイド" ]
tags: [ "初心者向け","スタートアップシリーズ","ネットワーク","データベース","セキュリティ" ]
---

DjangoやLaravel、Ruby on Rails等のウェブアプリケーションフレームワーク(以下、フレームワーク)を使うことで、効率的にウェブアプリの開発ができる。

しかし、前提となる知識をおろそかにしているようでは大したものは作れないし、問題だらけのウェブアプリを知らぬ間に世に出してしまうことになるだろう。

本記事ではフレームワークを扱う際に知っておきたい知識を記す。

## ネットワーク


### ウェブが動く仕組み

まずウェブアプリケーション云々以前に、なぜウェブが動くのかというところから知る必要がある。

ウェブはクライアントとサーバーという2つの役割によって成立している。ウェブサイトにアクセスする側がクライアント。クライアントにウェブサイトを表示させるための情報を提供しているのがサーバー。

<div class="img-center"><img src="/images/Screenshot from 2021-10-21 17-26-06.png" alt="ウェブサイトにおけるサーバーとクライアントの関係"></div>

サーバーはクライアントにウェブサイトを表示させるため、HTML、CSS、JavaScriptの情報を提供している。

クライアントはウェブサイトを表示させる際、EdgeやChrome、Firefox等のブラウザを使ってサイトにアクセスしているが、このブラウザがサーバーから送られたHTML、CSS、JavaScriptを解釈し、ウェブサイトが正常に表示される。

つまり、サーバー内にHTMLやCSS、JavaScriptなどの情報が保管されているということ。サーバーはクライアントの要求に応じて、保管されているデータを提供しているに過ぎない。

とりわけ、このようにHTMLやCSS、JavaScript等のウェブに関わる情報を提供しているサーバーをウェブサーバーという。サーバーにも種類があり、ウェブサーバーの他に

- ファイルを共有するファイルサーバー
- メールを送受信するメールサーバー
- 顧客情報などのデータを一元管理しているデータベースサーバー
- アクセスを代行するプロキシサーバー
- IPアドレスとドメイン名を関連付けるDNSサーバー

など枚挙に暇がない。

### フロントサイド言語とサーバーサイド言語

ウェブサーバーを利用してウェブを開発する際にはフロントサイト言語とサーバーサイド言語の2つの種類の言語を扱う。

フロントサイド言語とは、ブラウザ上で動くHTML、CSS、JavaScript等の言語のこと。単にフロントもしくはフロントサイド、フロント言語、フロント系などとも言う。サイトの見た目に関係する。ブラウザの開発ツールを起動すればHTML、CSS、JavaScriptの処理内容は全て確認・編集できる。

一方で、サーバーサイド言語とはサーバー上で動くスクリプト言語のこと。PHP、Python、Ruby、Go、C#などがあり、いずれかひとつの言語が実行される。単にサーバーサイドなどとも言う。サーバー上で動く仕様上、クライアント側からは処理の内容は一切見えない。そのため、データベースへのアクセスなど機密性が求められる処理系は全てサーバーサイドに書く。

つまり、ウェブサーバーではクライアントの要求によってはサーバーサイドが動き、その処理結果に応じて、フロントサイドの情報が提供されるということ。例えば、通販サイトなどで『〇〇さん、こんにちは』と表示されるが、『〇〇さん』はどこから来たのかと言うと、サーバーサイドの処理が発動し、顧客情報が保管されているデータベースへアクセスがされたから表示されているのだ。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 13-47-14.png" alt="サーバーサイドとフロントサイドの関係"></div>

### HTTPリクエストとレスポンス

前項まで便宜的にサイトへアクセスと表現していたが、専門用語で言うとHTTPリクエストである(単にリクエストと言う場合もある)。クライアントのHTTPリクエストに対してサーバーがHTTPレスポンスを返す。

HTTPリクエストには主に2種類がある。GETメソッドとPOSTメソッドである。それぞれGET文、POST文、あるいは単にGET、POSTなどとも呼ばれる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 13-56-36.png" alt=""></div>

GETメソッドは主にサイトへのアクセス、検索やページ移動などで利用される。ネットサーフィンをしていると、URLの末尾に`?page=2`や`?page=5&search=hoge`などが表示されたりすることがある。これをクエリストリング(クエリ文字列)、もしくはURLクエリパラメーター(URLパラメーター)などと言う。このクエリストリングの値に応じて、サーバーサイドで処理が行われる。例えば、`?page=2`であれば、サーバーサイドは`page`を参照して`2`を取り出し、2ページ目のデータを出力する。同様に`?search=hoge`であれば、サーバーサイドでは`hoge`で検索を行い、その結果を出力する。

GETメソッドはURLにアクセスすることで発動するので、URLをシェアしたりブックマークすることで再度呼び出しを行うことができる。そのため、検索やページ移動などの処理は、URLが残り、再度呼び出し可能なGETメソッドで行うのが定石である。

また、GETメソッドはリンクをクリックしたり、URLに直接アクセスする以外に、`form`タグを使用しても実行できる。下記がその例である。

    <form action="" method="GET">
        <input type="text" name="search">
        <input type="submit" value="検索する">
    </form>

GETメソッドを送信するため、`form`タグの`method`属性の値として`GET`を指定している(未指定でも可)。`name`属性がクエリストリングのキーになり、その`name`属性に書き込まれた内容が値になる。つまり、`name="search"`のテキストボックスに`hoge`と入力して、『検索する』ボタンを押せば、クエリストリングは`?search=hoge`となる。

その一方でPOSTメソッドはフォームを使用した投稿、通販サイトにおける注文など、1回限りのリクエストで利用される。下記のコードがPOSTメソッドを送信する`form`タグの例。

    <form action="" method="POST">
        <input type="hidden" name="csrftoken" value="XXXXXXXXXXXXX">
        <input type="text" name="comment">
        <input type="submit" value="送信">
    </form>

POSTメソッドを実行しても、GETメソッドとは違ってURLにはクエリストリングは付かない。`name="comment"`及び`name="csrftoken"`はPOSTメソッドのパラメータはリクエストのボディに内包される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 14-23-41.png" alt=""></div>

上記図のように、リクエストは送信元や送信先、メソッド等を指定するヘッダと、データを内包するボディ(ペイロードとも言う)の2つによって成り立っている。

- 参照:https://ja.wikipedia.org/wiki/Hypertext_Transfer_Protocol#HTTP%E3%83%98%E3%83%83%E3%83%80%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89
- 参照:https://ja.wikipedia.org/wiki/Hypertext_Transfer_Protocol#HTTP%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8


例えば、通販サイトで商品を購入する時、自分が購入した商品を第三者に知られないために暗号化の処理を施す必要がある。ただし、この暗号化の処理によって完全に暗号化されるのはリクエストのボディだけ。ヘッダも一部は暗号化はされるが、リクエスト送信先であるURLは暗号化されない。もしURLにクエリストリングが含まれていた場合、その内容は第三者に丸見え。

だから、秘匿する必要があるデータはクエリストリングやURLに含めてはいけない。注文処理や投稿などは秘匿する必要があるので、値がリクエストボディに内包され、暗号化できるPOSTメソッドで送信を行う。

また、POSTメソッドはGETメソッドとは違い、URLにアクセスして再度実行されるものではないので、注文など1回限りのリクエストで利用する。

### IPアドレスとドメイン名

IPアドレスはネットワークに接続されている全ての端末に割り当てられている。PCであれ、スマホであれ、タブレットであれ、ルーターやIoT機器であれ、ネットワークに接続した時点でIPアドレスが与えられる。このIPアドレスを元にサーバーへアクセスが行われる。

IPアドレス、とりわけIPv4は、4つの区切りで表記される。それぞれの区切りを第1〜第4オクテットと呼ぶ。オクテットの最大値は255、最小値は0であるため、IPアドレスは`0.0.0.0`から`255.255.255.255`までが実在する。そのため`100.200.300.400`などの、いずれかのオクテットが255を超過したIPアドレスは存在し得ない。

<!--ここにIPアドレスとDNSの図を-->

IPアドレスを指定すれば、ウェブサイトにもアクセスできる。しかし、一般的なウェブサイトにアクセスする時、このIPアドレスを直接指定してアクセスする事は難しいし、どこのサイトなのかよくわからない。そこで出てきたのがドメイン名。ドメイン名をIPアドレスと関連付けることで`google.com`や`yahoo.co.jp`等のドメイン名を指定してサイトにアクセスすることができる。これでユーザーはアクセスする前にどこのサイトかを把握できるし、覚えることもできる。

このIPアドレスとドメイン名を関連付けているのが、DNS(ドメインネームシステム)という技術、そして、DNSを使用し、IPアドレスに対応したドメイン名をクライアントにレスポンスしているのがDNSサーバー。IPアドレスに対応したドメイン名を回答することを名前解決と言う。

## データベース

データベースは一言で言ってしまえば、エクセルのようなもの。シートを選び、格子状のセルにデータを入れていく。

ただ、エクセルと違う点は、主に

- 入力するデータの形式が列ごとに決まっていること
- 1行分を1レコード(1件分のデータ)として扱うこと
- SQLを使用してデータの読み書きを行うこと
- マクロや関数は使えない

などがある。

### データベースの仕組み

データベースはテーブル(エクセルで言うシートみたいなもの)をまとめたもの。テーブルにデータを格納していく。縦の列はカラム(もしくはフィールド)、横の行はレコードと言う。レコード1つが1件分のデータである。

カラムごとに入力するデータの形式は決まっている。金額のように数値しか入力を許してはいけないもの、配送日のように日付しか入力を許してはいけないものなど、それぞれのデータの形式に合わせて入力をする。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 14-31-41.png" alt="DBの仕組み"></div>

もし、予め指定されたデータの形式に沿っていないレコードを挿入しようとした場合、DB側がエラーを出す。このように列ごとに入力するデータ形式が、エクセルと違って厳格であるため、正しく計算処理が行われる。数値は数値、日付は日付、文字列は文字列、ブーリアン値はブーリアン値と厳格に決まっている。

### SQLとは

SQLとは、データベースを動かすための言語である。DB上のデータの読み書きはSQLを使用して行われる。以下はSQLの例である

    #topicテーブルから全てのカラムを参照する
    SELECT * FROM topic;

    #topicテーブルの中から、idが1のレコードを削除する
    DELETE FROM topic WHERE id = 1;

ただし、フレームワークではSQLを直接記述して、DBを操作する必要はない。安易にウェブアプリ上でSQLを実行してしまうと、後述のSQLインジェクションを引き起こしてしまう可能性があるからだ。

そのため、SQLはそこまで重視して覚えなくても良い。あくまでもフレームワーク初心者の段階では。

## セキュリティ

最近のフレームワークはデフォルトでセキュリティ対策が行われており、何もしなくてもセキュリティ的な問題が発生することはない。

とは言え、不適切な開発手法を採用していると、簡単に攻撃を許してしまう。だからこそ、具体的にどのような攻撃手法があり、どのようにしてフレームワーク側が対策をしているのかを知る必要がある。

### XSS(クロスサイトスクリプティング)

本来であれば、`<`や`>`は通常エスケープ処理され、文字列として扱われるが、これがエスケープ処理されずHTMLとして解釈されるために通用する攻撃手法。

下記図のように、通常は文字列として扱われる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 14-34-55.png" alt=""></div>

しかしXSS脆弱性があると文字列ではなくHTMLとして解釈される。それ故、任意のJavaScriptを発動させることができる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 14-35-09.png" alt=""></div>

これを悪用して、悪意のあるサイトに誘導されたり、ウイルス等のダウンロードが勝手に行われたりすることがある。何も知らずにやってきたサイトの訪問者が被害者になってしまうので、サイト開発者はくれぐれもこのような脆弱性を生み出さないようにしたいところだ。

### SQLインジェクション

SQLインジェクションとは、サーバーサイドの処理系でDBへアクセスする際、直接SQLを実行し、なおかつユーザーから受け取った値をエスケープ処理せずに、そのまま実行しているため発生する攻撃手法。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 14-57-21.png" alt=""></div>

上図のように、ユーザーが送信した内容がSQLの一部として解釈され、結果的に本来であればDB内の顧客情報を全てを表示させたり、削除させたりすることができる。通販サイトなどの個人情報を取り扱うサイトでSQLインジェクションが発生した場合、その被害は尋常ではないだろう。

対策として、サーバーサイドの処理では『SQLを書かない』『SQLを実行しない』を徹底すること。もしどうしてもSQLを使いたいのであれば、前述の通りエスケープ処理を行い、特殊文字をSQLとして解釈されないようにする必要がある。

最近のフレームワークではSQLに変わって、安全に利用できるORM(オブジェクトリレーショナルマッピング)というものがある。このORMはユーザーから受け取った値を自動的にエスケープして、SQLとして解釈されないようにDBへアクセスしてくれるので、特別なことをしなくてもSQLインジェクションの対策ができるのだ。

フレームワークを始めてすぐの段階では、SQLインジェクション対策として、SQLではなくORMを使う。これは鉄則である。

参照元:https://ja.wikipedia.org/wiki/SQL%E3%82%A4%E3%83%B3%E3%82%B8%E3%82%A7%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

### CSRF(クロスサイトリクエストフォージェリ)

リクエストが送信された時にクライアントが使用していたサイトが、偽サイトなのか正規サイトなのか判定できないため、発生する攻撃手法。

登場人物は3人。CSRF脆弱性のあるECサイト(以下、ECサイト)、悪意あるサイト(以下、悪サイト)、CSRF脆弱性のあるECサイトの顧客(以下、顧客)。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 15-03-52.png" alt=""></div>

以下流れ。

1. 予め顧客はECサイトにログインしておく
1. 悪サイトの運営者は、何らかの方法で顧客を悪意あるサイトに誘導する
1. 悪サイトではアクセスしたらすぐにJavaScriptが発動し、ECサイトへリクエストが送信される
1. そのリクエストの内容は、悪サイトの運営者のアジトに換金性の高い商品を送る注文
1. CSRF脆弱性のあるECサイトでは、悪サイトから勝手に送られたリクエストであることが判定できない
1. 結果、顧客は換金性の高い商品の代金を知らぬ間に支払わされる
1. 悪サイトの運営者は換金性の高い商品を換金、てきとうにマネーロンダリングして逃走

つまり、ECサイトは悪サイトから送られたリクエストなのか、ECサイトから送られたリクエストなのか判定できないから、このように不正なリクエストが送られてしまうわけだ。

これがクロスサイトリクエストフォージェリ(サイト横断リクエスト偽造)と言われる所以である。

対策としてCSRFトークンを発行する。正規サイトにアクセスした時、送信元のIPアドレスとアクセスした日時に応じて、不規則な英数字で作られたトークンを付与する。このトークンはアクセスされるたびに再発行される上に、有効期限が付与されている。

第三者がこのトークンを盗み見ることはできず、顧客が自分からトークンを教えない限り、理論上CSRFは発生することは無い。先の例だと、仮に悪サイトの運営者が自分でECサイトにアクセスして、CSRFトークンを手に入れたとしても、それは悪サイトの運営者のCSRFトークンであり、顧客のトークンではないため、CSRFトークンの検証に失敗、リクエストは拒否される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-22 15-08-57.png" alt=""></div>

実際に、HTMLでは下記のように書く。

    <form action="" method="POST">
        <input type="hidden" name="csrftoken" value="XXXXXXXXXXXXX">
        <input type="text" name="comment">
        <input type="submit" value="送信">
    </form>

フレームワークによって異なるが、テンプレートタグを記載することで、フレームワークがレンダリングする際に、

    <input type="hidden" name="csrftoken" value="XXXXXXXXXXXXX">

のようなHTMLタグを自動で生成する。これがCSRFトークンとして機能する。valueの値は実際にはランダムの英数字が指定されており、更新ボタンを押すたびに値は切り替わる。予測不能で有効期限が定められているため、第三者がCSRFトークンを知ることはできない。これでCSRF対策ができる。


CSRFの実例として、先ほどのECサイト以外にある。

掲示板サイトでCSRF対策が疎かだと、全く関係のない人に犯罪予告等を掲示板に投稿させてしまうことができる。この事件は過去に発生しており、警察は投稿者のIPアドレスだけで事件の捜査をしていたので、誤認逮捕が多々あった。

最近はログインも不要で、住所と電話番号、注文だけで送信できる出前サイトなどが流行しているようだが、ここでCSRF対策が疎かだと、全く関係のない人にニセの出前の注文を大量発注させ、店を混乱させることもできるだろう。その結果、店が営業妨害だと訴え、警察がこれまでと同様に送信元のIPアドレスだけで事件の捜査をすると、第二第三の誤認逮捕者が出てしまう。

参照元:https://ja.wikipedia.org/wiki/%E3%82%AF%E3%83%AD%E3%82%B9%E3%82%B5%E3%82%A4%E3%83%88%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%AA

## フレームワークの学習方法

最後にフレームワークの学習方法を記す。

### コンポーネントごとの役割を知る

フレームワークはプロジェクト内の複数のファイルが集まって、ひとつの大きなウェブアプリを作り上げる。

ファイルにはそれぞれ役割が与えられている。この特定の役割に関連したファイル、及びファイルの集まりのことをコンポーネントと言う。フレームワークの開発ではコンポーネントの役割に注目してコードを書く。

フレームワークごとにコンポーネントの呼称や役割はやや異なるが、主なコンポーネントの役割として

- サーバー側の処理を一挙に担当する物
- データベースの構造を定義する物
- HTMLなどのブラウザに表示される物
- CSSやJavaScript、画像などを配信する物
- URLに対する処理を割り当てる物

などがある。

コンポーネントごとの役割を知り、役割に注目して開発をすることで、

- エラーの箇所がすぐにわかる
- 機能を追加したい時、何を編集すればよいかわかる
- 効率的な開発と保守ができる

などのメリットがある。

### エラーのパターンを知る

フレームワークのエラーは通常のプログラミングと同様にパターンがある。ある程度のパターンを覚えてしまえば、解決策はすぐにわかる。

前項のコンポーネントごとの役割を知り、エラーのパターンを知れば、自ずと何をすればよいかわかるだろう。

フレームワークによって異なるが、代表的なエラーのパターンと原因は

|エラー|原因|
|----|----|
|HTMLファイル読み込みエラー|レンダリング対象のHTMLのファイル名かパスが間違っている。|
|404 NotFound|リクエスト先のURLが登録されていない・間違っている|
|csrf検証失敗|POSTメソッド送信時にCSRFトークンが無い|
|マイグレーションエラー|手動でDBへアクセスしてテーブル等を削除した、マイグレーションファイルとDBの内容が食い違っている、日付フィールドに文字列型のデフォルト値を指定するなどの型問題など|
|バリデーションがうまく行かない|HTML側でname属性が指定されていない、バリデーション対象のフィールドが間違っているなど|

などがある。

<!--

### 市販の書籍 VS 英語で検索

<p style="font-size:1.2rem;font-weight:bold;color:cyan;">結論:英語で検索</p>

昨今のプログラミングブームにより、初心者向けの書籍が大量に出版されるようになった。フレームワーク関係の書籍も同様に相次いで出版されている。

しかし、その内容はいずれもお粗末で、中には前項で挙げたセキュリティ攻撃が発生しうる手法を、さも正しいやり方かのように平然と解説している悪質な本もある。表紙がそこそこ小綺麗で、定価3000円以上の値がついており、『超簡単』『超入門』等の謳い文句があるため一見期待できそうだが、何も知らない初学者の方は騙されて買わないように気をつけたいところだ。

よって繰り返しになるが、学習の際には検索をしたほうが良い。とりわけ重要なのが、日本語ではなく<span style="font-weight:bold;color:cyan;">『英語で検索』</span>をすること。

日本語で検索すると業者のサイトばかりヒットして、肝心な解決策がなかなか見つからない。一方で英語で検索をすれば、そういったサイトはヒットせず、すぐに解決策が見つかる。

英語で検索をすると、検索の上位には公式のドキュメント、stackoverflow、GitHub、Qiitaなどが出てくるのでそちらを確認したほうが良いだろう。

-->
