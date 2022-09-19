---
title: "UbuntuにSSHでリモートログインする方法【パスワード認証+公開鍵認証+scpコマンド】"
date: 2018-09-20T18:22:19+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: ["インフラ"]
tags: [ "Ubuntu", "SSH","システム管理","Linux" ]
---

<p>SSH（Secure Shell）とはネットワークに接続されている端末にリモートログインをするための技術のことを言います。</p>
<p>SSHにより直接端末を操作しなくても遠隔地から端末にログインを行い、コマンド入力で簡単に操作できるようになります。それだけでなく、SSHを使用した際にはネットワークを流れる通信がすべて暗号化されるようになるのです。SSHでは暗号化された通信経路を使用するので、通信経路が暗号化されていないtelnetなどとは違ってリモートログインに使用しているパスワードやコマンドなどが外部に漏れる可能性が低くなります。</p>
<p>またSSHによるリモートログインは遠隔地からサーバーの操作を行うために必要な基本事項なので、ネットワーク技術者などを目指す新人社員や学生の方であれば必ず覚えておきましょう。</p>

<p>目次</p>
<ul>
<li><a href="#chapter1">SSHの説明</a></li>
<li><a href="#chapter2">Ubuntu18.04にOpenSSHをインストールする</a></li>
<li><a href="#chapter3">パスワード認証によるログイン</a></li>
<li><a href="#chapter4">scpコマンドを利用したファイルの転送</a></li>
<li><a href="#chapter5">リモートホスト側によるアクセス制御</a></li>
<li><a href="#chapter6">公開鍵認証によるログイン</a></li>
<li><a href="#chapter7">結論</a></li>
</ul>


<h2 id="chapter1">SSHの説明</h2>

<h3>SSHの概要</h3>

<p>SSHとはセキュアシェル（Secure Shell）の省略形で、ネットワークに接続されている端末にリモートログインを実行して操作するための技術です。</p>

<p>同じようにリモートでログインを行う事ができるtelnetとは違って、<span style="color:#ff0000;">SSHではリモートログインされるホストとリモートログインを行うユーザーとの通信内容がすべて暗号化</span>されています。</p>

<p>デフォルトのポート番号は22番ですが、SSHはどこでも利用されているありふれたプロトコルでありログインしてしまえばネットワークを経由して端末を簡単に操作できてしまいます。そのためポート番号22番を狙った攻撃が跡を絶たず、攻撃者に不正にリモートログインをされてしまうことが多いのです。だから<span style="color:#ff0000;">セキュリティ対策のためにもSSHはデフォルトのポート番号である22番では利用しない</span>ようすることが重要になります。</p>

<p>さらにSSHを使用して管理者権限でログインをしてしまうと、サーバーに仕掛けられている可能性があるバックドアが作動してしまい様々な障害が発生してしまうことがあります。SSHを使用して管理者権限でリモートログインさせないためにも明確に禁止しておくべきです。Ubuntuではデフォルトでrootでのログインは禁止されていますが、念の為にも対策を施します。</p>

<h3>SSHの認証方式について</h3>

<p>SSHを利用する際に使用する認証方式には、<span style="color:#ff0000;">主にパスワード認証方式とユーザーの秘密鍵とホストの公開鍵を使用した公開鍵認証方式の2種類</span>があります。</p>

<p>パスワードによる認証方式ではログインを行うユーザーの名前とパスワードを入力することによって認証できるようになっています。パスワードによる認証方式では総当たり攻撃に非常に脆弱であり、簡単に推測できるパスワードだと一瞬で不正アクセスされてしまいます。よってインターネットに公開するサーバーにはパスワードによる認証方式は採用しないようにしたほうが良いでしょう。</p>

<p>ユーザーの秘密鍵とリモートホストの公開鍵を利用する認証方式では、ユーザーの秘密鍵が漏れてしまわない限り不正アクセスされる可能性は低いです。それだけでなくユーザーが秘密鍵を利用する際には、パスフレーズという秘密鍵の利用のために必要な文字列を入力する必要があります。そのため秘密鍵が外部に流出してしまったとしても一定期間は不正アクセスを防ぐことができるのです。<br>ただし、パスフレーズが簡単に推測されるものであれば秘密鍵の流出後の時間稼ぎとして有効に機能しなくなってしまうので、なるべく10文字以上で英数字だけでなく記号も含めて利用すると良いでしょう。特に最近のコンピュータは従来の製品よりも処理性能が飛躍的に向上しているので安全のためにも随時パスフレーズの文字数を増やしていくことをおすすめします。</p>

<p>以上のことからパスワード認証と公開鍵認証の違いをまとめるとこうなります。</p>

<table>
<thead>
<tr>
<th></th><th>パスワード認証</th><th>公開鍵認証</th>
</tr>
</thead>
<tbody>
<tr>
<th>認証に必要な要素</th><th>ユーザー名<br>パスワード</th><th>ユーザー名<br>パスフレーズ<br>秘密鍵</th>
</tr>
<tr>
<th>セキュリティ</th><th>総当たり攻撃に脆弱</th><th>秘密鍵が流出しない限り安全</th>
</tr>
</tbody>
</table>



<p>パスワード認証はユーザー名とパスワードのみの2つの要素を使用してログインします。<br>一方で、公開鍵認証はユーザー名とユーザーが保管している秘密鍵に加え、秘密鍵を利用するために必要なパスフレーズの3つの要素を使用してログインすることになります。</p>

<p>特に<span style="color:#ff0000;">公開鍵認証方式は秘密鍵を流出させないように適切に保管しておくだけで不正アクセスのリスクが大幅に減少する</span>のでセキュリティは高いと言えるでしょう。</p>


<h3>SSHの機能について</h3>

<p>SSHの技術を使用することによりscp（Secure Copy）コマンドなどのネットワークを経由してファイルの転送ができるだけでなく、SSHのポートフォワーディング機能（ポート転送機能）を活用することによって様々なプロトコルを暗号化できるようになります。</p>

<p><span style="color:#ff0000;">ポートフォワーディング機能とは、SSHの暗号化された通信路を使用して暗号化されていないプロトコルを安全に利用するための機能</span>のことを言います。例えばネットワークに通信内容が平文で流れている、電子メールの転送を行うSMTPやファイル転送を行うFTPなどのプロトコルを、SSHのポートフォワーディング機能を活用することで通信内容を暗号化して利用することができるのです。</p>


<h2 id="chapter2">Ubuntu18.04にOpenSSHをインストールする</h2>

<p>説明は以上です。それでは早速SSHを試してみましょう。</p>

<h3>サーバー用OpenSSHのインストールと設定ファイルのバックアップ</h3>

<p>まずはSSHでリモートログインをされる側にサーバー用のOpenSSHをインストールする必要があります。画面右下のアイコンをクリックして端末と検索してEnterを押すか、Ctrl+Alt+Tを押して端末を開きます。サーバー用のOpenSSHインストールするコマンドは以下のとおりです。</p>

<pre><code>sudo apt install openssh-server</code></pre>

<p>インストールが終わったら設定ファイルのバックアップを行いましょう。OpenSSHの設定ファイルのパスは/etc/ssh/sshd_configです。</p>

<pre><code>sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config_backup</code></pre>

<p>このコマンドで設定ファイルのバックアップを行うことが出来ます。上記のように初期設定をバックアップしたファイルであることをわかりやすくするためにコピー先のファイル名は語尾にbackupやoriginalなどの単語を追加しておくと良いでしょう。<br>もしSSHの設定ファイルを以前の状態に復元したいのであれば、以下のコマンドを実行します。</p>

<pre><code>sudo cp /etc/ssh/sshd_config_backup /etc/ssh/sshd_config</code></pre>

<p>これによりバックアップを行ったときの状態に設定ファイルが上書きされます。『設定ファイルが修正不可能な状態になってしまった』『vimの操作を誤ってしまったので以前の状態に戻したい』などという場合は事前にバックアップした設定ファイルを復元して設定をやり直すことですぐに解決します。</p>

<h3>SSHで利用するポート番号の変更</h3>

<p>設定ファイルのバックアップを行ったら、次はSSHを利用するポート番号を変更しましょう。<span style="color:#ff0000;">ポート番号を変更するときには、他のソフトウェアなどが利用しているポート番号と重複しないようにすることが重要です。</span><br>そこで番号の空きを確認するためにも現在利用しているポート番号の一覧を表示するコマンドを実行します。</p>

<pre><code>ss -atl</code></pre>

<p>これにより使用しているポート番号が表示されるので任意の番号を設定ファイルに書き込みましょう。今回はポート番号を2022番に変更させます。設定ファイルを編集するためのエディタ（vim）を開くには以下のコマンドを実行します。</p>

<pre><code>sudo vi /etc/ssh/sshd_config</code></pre>

<p>vimの操作は一般的なGUIのテキストエディタの操作と異なっているので予め操作方法を把握しておくと良いでしょう。以下の内部リンク記事を御覧ください。</p>


<p>設定ファイルを開いてポート番号を22番から別の番号に変更するためには、以下の内容が書かれている行を探して書き換えます。2018年9月25日現時点で下記の行は13行目にあります。</p>

<pre><code>#Port 22</code></pre>

<p>もし探しても見つからない場合は、vimの検索機能を活用するとすぐに見つかるでしょう。この22の番号を2022に変更することによって、SSHはポート番号2022番でアクセスできるようになります。</p>
<p>ちなみに先頭にある#はこの行がコメントであることを意味しています。つまりポート番号の指定は設定ファイルでは行っておらず、デフォルトの22番であることを意味しているのです。よって以下のように書き換えます。</p>

<pre><code>Port 2022</code></pre>

<p><span style="color:#ff0000;">コメントアウトである先頭の#を消去し忘れないように注意しましょう。</span>#を消し忘れるとこの行がコメントであると取り扱われ、設定が反映されません。</p>

<h3>SSHでrootでのログインを禁止する</h3>

<p>続いて、SSHを活用してrootでのログインを禁止させるための設定を施します。以下の内容はrootでログインする際にはパスワードによる認証を禁止する文言です。</p>

<pre><code>#PermitRootLogin prohibit-password</code></pre>

<p>permitは権限を意味しており、prohibitは禁止するという意味を持つ英単語です。rootのログインの際にパスワードによる認証を禁止していたとしても、それ以外の認証方法が存在している場合はrootでのログインを許してしまうことになります。<span style="color:#ff0000;">デフォルト設定ではあくまでも『パスワードによるrootログイン』を禁止しているだけに過ぎない</span>のです。<br>だからrootでのログインを全面的に禁止させるためにも以下のように書き換えます。</p>

<pre><code>PermitRootLogin no</code></pre>

<p>こちらも先頭の#を消去することを決して忘れないようにしてください。先頭の#をそのまま残していると設定が反映されません。これによりrootでのログインを全面的に禁止させることが出来ます。</p>

<p>設定ファイルを書き換えただけであれば、すでに稼働しているOpenSSHserverに設定が反映されないので以下のコマンドを実行して再起動させます。</p>

<pre><code>sudo systemctl restart sshd.service</code></pre>

<h2 id="chapter3">パスワード認証によるログイン</h2>

<p>パスワードを使用したSSHによるログインは非常に単純です。以下にWindowsでSSHサーバーにアクセスする方法とDebianまたはUbuntuを使用してアクセスする方法を紹介します。</p>

<h3>Windowsを使用してリモートログインを行う方法</h3>

<p>WindowsではSSHによるリモートログインを行うための追加のソフトウェアをインストールする必要があります。今回、Windowsでリモートログインのために使用するソフトウェアはTera Termです。</p>


<p>Tera Termを起動したときに現れる画面に設定を施します。<br>以下の画像のように左側のトグルボタンはTCP/IPを選択し、画面上部の『ホスト』にはリモートログインを行うSSHサーバーのIPアドレスかホスト名を入力します。続いて画面中央の『サービス』のトグルボタンがSSHを選択されていることを確認し、画面右上の『TCPポート』には先ほどsshd_configで設定したポート番号を入力するのです。<br>『バージョン』は安全に通信を行うことができるSSH2を選択し、『プロトコル』はUNSPECを選択します。『プロトコル』のUNSPECはunspecifiedという単語の省略形で特に指示しない、明示していないという意味を持ちます。そのためリモートホストに対してIPv6とIPv4でのアクセスを試みるのです。</p>

<div class="img-center"><img src="/images/20181001001.jpg" alt="SSHの初期設定及びアクセスするホストの選択の画像" /></div>

<p>もし、<span style="color:#ff0000;">リモートログインを行うSSHサーバーのIPアドレスがわからない場合は、SSHサーバーの端末から以下のコマンドを入力</span>します。</p>

<pre><code>ip address</code></pre>

<p>上記のコマンドを入力した後、内部ネットワークのIPアドレス（192.168.*.*）が分かるので、それをTera Termの『ホスト』に入力しましょう。</p>

<p>すべての入力が完了した状態でOKを押すと以下の画面が現れます。</p>

<div class="img-center"><img src="/images/20181001002.jpg" alt="セキュリティの警告画面の画像" /></div>

<p>これは<span style="color:#ff0000;">サーバー側の公開鍵（フィンガープリント）がTera Termに記録されていないのでTera Termがセキュリティの警告を出している</span>のです。この画面で表示されている公開鍵は、公開鍵認証を行うときに使用する公開鍵とは別物です。初めてリモートログインを行うSSHサーバーが正規のものであるかどうかを確認するために利用される公開鍵になります。<br>そのためパスワード認証であっても、初めてのリモートログインであれば必ず表示されます。</p>

<p>例えば、SSHサーバーの公開鍵をTera Termが予め登録しておけば、再びSSHでリモートログインをするときにTera Termが予め登録している公開鍵のリストを確認することでそれが正規のサーバーであることがわかります。しかし、この公開鍵がTera Termに予め登録されている公開鍵のリストと一致しなかった場合は悪意のあるサーバーが正規のサーバーであると偽っている可能性があるのです。</p>

<p>そこで、正規のSSHサーバーにアクセスしていることを確認するためにも、このセキュリティの警告の画面の中央に表示されている鍵指紋ハッシュアルゴリズムを確認してみましょう。<span style="color:#ff0000;">Tera Termが表示した鍵指紋ハッシュアルゴリズムと正規のSSHサーバーの端末を操作して公開鍵を表示させることで一致していることを確認します。</span>そのために先ほどOpenSSHをインストールしたサーバーの端末を起動して以下のコマンドを実行させます。</p>

<pre><code>sudo ssh-keygen -l</code></pre>

<p>そうすると、どの鍵ファイルを参照するかを尋ねられるので、先ほど表示された鍵を表示させるために以下のパスを入力します。</p>

<pre><code>/etc/ssh/ssh_host_ecdsa_key.pub</code></pre>

<p>これで表示された鍵ファイルの中身の英数字がTera Termで表示されたものと一致していることを確認するのです。ちなみにこの鍵ファイルの中身である英数字の羅列が一文字でも間違っていると正規のSSHサーバーではない可能性が高まります。</p>
<p>鍵ファイルの文字列は非常に長いので、見間違えてしまうことがあります。そこでTera Termのセキュリティ警告の下部に表示されているアスキーアートを活用します。ホスト側とTera Termに表示されているアスキーアートの模様が一致していることを確認するのです。これは鍵ファイルの文字列を視覚的に確認しやすくするための模様です。この模様をホスト側で表示させるためには先ほど設定した/etc/ssh/sshd_configの任意の行に以下の内容を追記します。</p>

<pre><code>VisualHostKey=yes</code></pre>

<p>これにより、ログイン時にホスト側の鍵ファイルの模様が表示されるようになります。</p>
<p>双方に表示されている鍵ファイルの内容が一致することを確認したら『続行』を押します。そうすると以下のパスワードの入力画面が表示されるようになります。</p>

<div class="img-center"><img src="/images/20181001003.jpg" alt="Tera Termパスワード入力画面の画像" /></div>

<p>今回はパスワードを活用した認証方式なので、リモートログインをされる側（Ubuntu）のユーザー名とパスワードを入力します。最初にUbuntuをインストールしたときに設定したユーザー名とパスワードを『ユーザ名』と『パスフレーズ』に入力するだけで良いです。入力が終わったら『OK』を押します。</p>

<p>正しくユーザー名とパスワードを入力したにもかかわらず、ログインに失敗してしまった場合は、SSHのタイムアウト処理が働いてしまった可能性が考えられます。<span style="color:#ff0000;">ログイン画面で一定時間が経ってしまうとセキュリティ保護のために正しくパスワードを入力しても必ず失敗してしまうようになっているのです。</span>だからもう一度ログインをやり直すことで接続できるようなるでしょう。</p>

<p>ログインが成功すると以下の画面が表示されます。ログアウトするときにはexitと入力するだけでログアウトできます。</p>

<div class="img-center"><img src="/images/20181001004.jpg" alt="ログインが成功したときの画面の画像" /></div>

<h3>DebianまたはUbuntuを使用してリモートログインを行う方法</h3>

<p>DebianまたはUbuntuを使用してリモートログインを行う方法には端末を使用することで対処できます。DebianやUbuntuなどにはデフォルトでSSHクライアントのパッケージがインストールされているので、そのまま端末でリモートログインコマンドを実行します。もしSSHクライアントのパッケージがインストールされていないようであれば、手動でインストールすると良いでしょう。<br>SSHでリモートログインを利用するためには以下のコマンドを実行します。</p>

<pre><code>ssh [オプション] [ユーザー名@][接続先ホストのホスト名もしくはIPアドレス] [コマンド]</code></pre>

<p>つまりポート番号が2022番でユーザー名がserverman、接続先ホストのIPアドレスが192.168.11.9の場合は以下のようになります。</p>

<pre><code>ssh -p 2022 serverman@192.168.11.9</code></pre>

<p>ポート番号がデフォルトの22番の場合は-pオプションを省略することが出来ます。もし接続先ホストのホスト名がexample.comであれば、serverman@example.comとすればよいのです。</p>

<p>上記のコマンドを実行すると、Tera Termのときと同様に<span style="color:#ff0000;">ホストの公開鍵が保管しているリストに登録されていないことを警告されるので、ホストの公開鍵を比較</span>します。鍵ファイルの内容が一致することを確認したらyesと入力します。すると次は接続先のホストのパスワードが求められるのでそちらも正しく入力するとログインできるのです。端末に表示されている名前が変わったらリモートログインは成功です。<br>こちらも同様にexitコマンドを入力すれば簡単にログアウトできます。</p>

<div class="img-center"><img src="/images/20181001005.jpg" alt="Ubuntuでログインが成功したときの画像" /></div>

<h3>パスワードの変更方法とユーザーを追加する方法</h3>

<p>リモートログインされるユーザーパスワードが脆弱であれば、不正にリモートログインされてしまうリスクが高くなります。そのため、パスワードによるログインを行うのであれば、ユーザーパスワードをなるべく強固に設定しておく必要があるのです。</p>
<p>リモートログインされるユーザーパスワードを変更するにはリモートホストの端末から以下のコマンドを実行します。</p>

<pre><code>sudo passwd [ユーザー名]</code></pre>

<p>これで指定したユーザー名のパスワードの入力を求められ、一致していれば新しいパスワードの変更が可能です。新しく設定するユーザーのパスワードは大文字と小文字の英字に加え数字と記号を組み合わせた10文字以上の不規則な文字列を推奨します。</p>
<p>ユーザーを追加してリモートログインできるユーザーを増やしたいのであれば以下のコマンドを実行し、パスワードを設定するだけです。</p>

<pre><code>sudo adduser [ユーザー名]</code></pre>

<h2 id="chapter4">scpコマンドを利用したファイルの転送</h2>

<p>scpとは、SSHの暗号化された通信経路を活用して安全にファイルを転送させることができる仕組みです。こちらもWindowsのTera TermとUbuntuの端末とで使用方法が異なっているので順に説明します。</p>

<h3>Windowsでscpを利用する方法</h3>

<p>Tera Termでscpを利用する方法は非常に簡単です。転送したいファイルをリモートログインしたTera Termのウィンドウにドラッグアンドドロップしてください。すると以下の画面が現れます。</p>

<div class="img-center"><img src="/images/20181001006.jpg" alt="scpによるファイル転送を行うときに表示される画面の画像" /></div>

<p>画像上部の黒色で塗りつぶした部分は先ほどドラッグアンドドロップを行ったファイルのパスが書かれています。トグルボタンはSCPを選択して、送信先のパスを入力して『OK』を押せばそれで完了です。<br>送信先の指定が無い場合はユーザーのホームディレクトリに送信されるようになっています。<span style="color:#ff0000;">同じ名前のファイルがすでに存在していると自動的に上書きされるようになるので、予めlsコマンドなどを使用して確認した上で実行すると安全です。</span>ちなみにファイル名に日本語などの2バイト以上の文字が使用されていると文字エンコードの関係上、文字化けが発生する恐れがあります。</p>

<h3>DebianまたはUbuntuでscpを利用する方法</h3>

<p>DebianまたはUbuntuの端末でscpを利用する場合は、以下のコマンドを実行します。</p>

<pre><code>scp [オプション] [コピー元のパス] [コピー先のパス]</code></pre>

<p>つまりローカルユーザーのホームディレクトリにあるファイルa.txtをユーザー名がservermanでIPアドレスが192.168.11.9であるリモートホストのホームディレクトリにポート番号2022番で転送したい場合は以下のコマンドを実行するのです。</p>

<pre><code>scp -P 2022 ~/a.txt serverman@192.168.11.9:~/</code></pre>

<p><span style="color:#ff0000;">このscpコマンドを行う前に、すでにSSHでリモートホストにログインをしている場合はexitコマンドを使用して一旦ログアウトしましょう。</span>SSHでログインしている状況で上記のコマンドを実行すれば、リモートホストのホームディレクトリにあるa.txtをポート番号2022番を使用してリモートホストのホームディレクトリにコピーするという意味になるので、ローカルユーザーのa.txtが転送されません。<br>そのためローカルユーザーのホームディレクトリにあるa.txtを転送したい場合は、一旦exitコマンドを使用してログアウトすることが重要です。</p>

<p>さらに<span style="color:#ff0000;">scpコマンドでポート番号の指定を行うオプションの-Pはsshコマンドの時とは違って大文字である点に注意しましょう。</span>ちなみにscpのオプションの-pは送信元のタイムスタンプやアクセス権を変更しないように転送するためのオプションです。</p>

<p>リモートホストのパスワードを聞かれるので、正しく入力することで転送は完了です。パスワード認証方式ではなく公開鍵認証方式を利用しているときには、オプション-iで秘密鍵ファイルのパスを入力する必要がある点に注意しましょう。</p>

<h2 id="chapter5">リモートホスト側によるアクセス制御</h2>

<p>パスワードや公開鍵を使用した認証方式だけでリモートホストを運用することには主に2つのリスクが存在します。</p>

<p>ひとつ目は<span style="color:#ff0000;">正規の利用者が正規のパスワードや秘密鍵を利用して、不正な端末でリモートログインを行ってしまうリスク</span>です。たとえアクセスするリモートホストが内部ネットワークに存在しており、なおかつ外部の攻撃者から推測されないパスワードや流出しない秘密鍵であったとしても、正規の利用者が不正な端末を使用してリモートログインを試みてしまうとリモートホストが危機にさらされてしまうのです。具体的な例が、正規の利用者が適切なセキュリティ対策を施していない端末を使用してリモートログインを行うなどがあります。これによりセキュリティ対策を施していない不正な端末に感染しているウイルスがリモートホストにまで拡大してしまい、結果的にネットワーク全体に広がってしまうのです。</p>

<p>ふたつ目は<span style="color:#ff0000;">パスワードや秘密鍵が漏れてしまったとき、不正な端末で簡単にリモートログインを実行できてしまうリスク</span>です。パスワードや秘密鍵ファイルの管理がずさんだと簡単に流出してしまうことがあります。例えば、パソコンのモニターに貼り付けられた付箋にリモートログイン用のパスワードが書かれていたり、共有フォルダなどに秘密鍵を格納していると簡単に流出してしまうのです。リモートホスト側によるアクセス制御が行われていなければ、攻撃者は流出したパスワードや秘密鍵を利用してリモートログインが出来てしまいます。</p>

<p>以上の2つの理由から、リモートホスト側からのアクセス制御を適切に行うことが重要になります。</p>

<p>具体的な制御方法は、TCP Wrapperを活用した方法が良いでしょう。TCP Wrapperとはホストベースのアクセス制御を行うための機能です。許可リスト拒否リストに指定のIPアドレスやホスト名などを入力することでアクセス制御が簡単に出来ます。TCP Wrapperは多くのUNIXやLinuxに標準でインストールされていますが、念の為にも以下のコマンドを実行して確認したほうが良いです。</p>

<pre><code>dpkg -l | grep libwrap0</code></pre>

<p>これでヒットすれば、すでにTCP Wrapperが利用できることを意味しています。存在しない場合はlibwrap0パッケージをインストールすると良いでしょう。</p>

<p>使用方法は非常に簡単で、許可リストである/etc/hosts.allowと拒否リストである/etc/host.denyを編集すればよいのです。<br>許可リストと拒否リストの仕組みは、TCP Wrapperはまずはじめに許可リストに掲載されているホストとサービス名を参照し、存在していればアクセスを許可します。許可リストに存在していない場合は拒否リストを参照し、一致するサービスやホスト名が存在していればアクセスを拒否し、存在していなければアクセスを許可するのです。</p>

<p>拒否リストや許可リストの書式もわかりやすく以下のようにまとめられています。</p>

<pre><code>[サービス名]:[対象のホストのリスト]</code></pre>

<p>サービス名にはTCP Wrapperで指定可能なサービスの名前を記述します。もちろんOpenSSHは指定可能で、サービス名はsshdです。対象のホストのリストにはIPアドレスやドメイン名などを指定します。例えば拒否リストにアクセスを拒否させたいIPアドレスやドメイン名などを記述すると、指定したサービスにアクセスできない状態になります。OpenSSHのサービスにはsshコマンドによるリモートログインだけでなく、scpコマンドによるファイルの転送なども含まれているのでTCP WrapperでOpenSSHサービスの拒否をすることによってsshだけでなくscpなどの機能も利用できなくなります。</p>

<p>まずは拒否リストを編集するために以下のコマンドでvimを起動します。</p>

<pre><code>sudo vi /etc/hosts.deny</code></pre>

<p>vimが正常に起動したら次のように記述を行います。</p>

<pre><code>ALL:ALL</code></pre>

<p>ALLはすべてを意味しています。つまりすべてのサービスとすべてのホストはこの端末のサービスへのアクセスを拒否することを意味しているのです。すべての端末を拒否すると誰もOpenSSHのサービスにアクセスできなくなると思われがちですが、次に指定する許可リストに一致すればアクセスが許可されるので問題はありません。</p>

<p>許可リストを編集するためにvimで起動させます。</p>

<pre><code>sudo vi /etc/hosts.allow</code></pre>

<p>例えば192,168.11.0/24のホストからのみsshdのサービスを許可したい場合は、許可リストに以下のように記述するのです。</p>

<pre><code>sshd:192.168.11.0/24</code></pre>

<p>192.168.168.11.0/24の0/24は省略可能で192.168.11.と表現することが出来ますが今回はわかりやすくするためにあえてこの記述にしました。この設定により、192.168.11.0/24に所属している端末のみsshdのサービスを利用する事ができます。sshによるリモートログインやscpなどOpenSSHを活用したサービスであれば自由に利用できるのです。</p>

<p>基本的に拒否リストにはすべてのサービスとすべてのホストを指定して、許可リストには最小限のサービスと最小限のホストを指定する、ホワイトリスト方式が望ましいです。<br>拒否リストに特定のサービスと特定のホストを指定して拒否をするブラックリスト方式を採用したとしても、別のサービスを利用されたりホストを変更してアクセスされたりする可能性があります。このようにブラックリスト方式では、拒否リストが肥大化してしまい管理が難しくなってしまうだけでなく、確実に防ぐことが出来ないのでセキュリティ上の問題があるのです。<br>だからセキュリティを高めるためにも、<span style="color:#ff0000;">基本的にはすべての権限の利用を拒否して、最小限の権限のみを与えることが望ましい</span>のです。</p>

<p>もちろんリモートログインを行うことによって拒否リストや許可リストなどを編集することが可能なので、必要最小限の端末のみアクセス権限を与えておかなければ容易に設定を変更されてしまう点に注意しましょう。<br>この項目の冒頭で申し上げたとおり、リモートログインの権限を付与する端末のセキュリティ対策なども徹底しておく必要があります。さらに利用しなくなった端末は速やかに許可リストから削除することを推奨します。利用者が存在しないIPアドレスやホストを狙って不正にサービスを利用する可能性も考えられるからです。</p>

<h2 id="chapter6">公開鍵認証によるログイン</h2>

<p>この記事の冒頭で申し上げたとおりSSHを活用したリモートログインでは、パスワードを使用した認証方式だけでなく公開鍵を使用した認証方式が存在します。</p>

<p><span style="color:#ff0000;">公開鍵認証が利用できるまでの流れを箇条書きにすると以下のようになります。</span></p>

<ol>
<li>リモートログインをする側が公開鍵と秘密鍵を生成する</li>
<li>リモートログインされる側に、する側の公開鍵を送付</li>
<li>リモートログインされる側の設定ファイルを変更し公開鍵認証方式を許可</li>
<li>公開鍵認証が利用できる</li>
</ol>

<p>公開鍵認証では、リモートログインをする側が自分の秘密鍵を使用して、事前登録したユーザーであることを証明するのです。事前登録したユーザーの秘密鍵が流出しない限り、正規のユーザーであることが証明されます。</p>

<p>公開鍵認証を行うための手順もWindowsのTera TermとDebianやUbuntuの端末で行う方法とで異なっているので両方説明します。</p>

<h3>Windowsを使用して公開鍵認証方式でリモートログインを行う方法</h3>

<p>WindowsのTera Termで公開鍵認証方式を行う方法は簡単です。まずはTera Termで対象のホストにリモートログインを行い、Tera Termのメニューバーから『設定』を選択し『SSH鍵生成』クリックします。すると以下の画面が現れるので、鍵の種類がRSAを選択していることを確認して『生成』ボタンを押します。</p>

<div class="img-center"><img src="/images/20181001007.jpg" alt="SSH鍵生成画面の画像" /></div>

<p>『生成』ボタンを押すと画面下段にある『鍵のパスフレーズ』『パスフレーズの確認』『コメント』の入力が可能になります。鍵のパスフレーズはパスワード認証で使用していた文字列とは別のものが良いでしょう。<span style="color:#ff0000;">特段の理由がなければパスフレーズの文字列は10文字以上であり、なおかつ不規則で第三者が予想しにくい物が無難です。</span></p>

<p>『鍵のパスフレーズ』『パスフレーズの確認』の入力が終わると『公開鍵の保存』『秘密鍵の保存』を行い、任意のフォルダに保管しておきます。<span style="color:#ff0000;">id_rsaが秘密鍵で、id_rsa.pubが公開鍵</span>です。『秘密鍵を保存』を押すときには鍵のパスフレーズが一致していないと警告が出るので注意しましょう。<br>秘密鍵を保存するフォルダは他のユーザーにアクセスできない場所が無難です。間違っても内部ネットワークの共有ディレクトリには保管しないようにしましょう。今回はドキュメントフォルダの中に新しいフォルダーを作ってその中に保管することにします。</p>

<p>本番の環境などであれば、リモートログインの利用時にしか接続しない専用のUSBメモリなどに秘密鍵ファイルを保管しておくと良いでしょう。秘密鍵ファイルがネットワークから物理的に切断できるだけでなく、金庫などで厳重に保管できるメリットがあります。<br>もちろんそのUSBメモリのアクセス権についても考慮する必要があります。Tera Term以外のソフトウェアが該当のUSBメモリにアクセスできないようにしておくことが有効です。必要であれば所有者であってもアクセスの際にパスワードを要求するように設定しておきましょう。</p>

<p>鍵の生成が終わると、リモートログインを行うサーバーに公開鍵を送信する必要があります。公開鍵は外部に漏れてしまっても問題は無い鍵ではありますが、念の為にもscpを使用して暗号化して送信すると良いでしょう。<br>先ほどのscpの項目で説明したとおり、Tera Termを使用したscpの使用方法は対象のファイルをTera Termのウィンドウにドラッグアンドドロップすれば良いだけです。<span style="color:#ff0000;">公開鍵ファイルの送信先はOpenSSHのデフォルト設定の公開鍵の読み込み先である~/.ssh/authorized_keysにします。</span></p>

<div class="img-center"><img src="/images/20181001008.jpg" alt="公開鍵をSSHで転送する画像" /></div>

<p>公開鍵をscpで転送したら、その公開鍵が書き換えることが出来ないようにファイルの所有者のみ閲覧可能にさせます。リモートホストに以下のコマンドを実行するのです。</p>

<pre><code>sudo chmod 400 ~/.ssh/authorized_keys</code></pre>

<p>もちろん秘密鍵も、書き換えができないように秘密鍵の所有者のみ閲覧可能にします。</p>

<p>さっそく公開鍵を使用したリモートログインを実行してみましょう。<br>すでにリモートログインしている状態であれば一旦exitコマンドを押してログアウトした後、新しい接続を指定して、パスワードの要求画面が出るので以下のように設定します。</p>

<div class="img-center"><img src="/images/20181001009.jpg" alt="公開鍵でSSHにログインをする画像" /></div>

<p>ユーザー名と先ほど鍵を生成するときに設定したパスフレーズを入力します。画面下のトグルボタンは『RSA/DSA/ECDSA/ED25519鍵を使う』を選択して『秘密鍵』ボタンを押して秘密鍵を選択するのです。そして『OK』ボタンを押すとリモートログインに成功します。</p>

<h3>DebianまたはUbuntuを使用して公開鍵認証方式でリモートログインを行う方法</h3>

<p>まずは公開鍵認証方式のリモートログインを利用したい端末で以下のコマンドを実行します。</p>

<pre><code>ssh-keygen -t rsa</code></pre>

<p>上記のコマンドは暗号化方式がRSAの鍵ペアを生成するという意味です。このコマンドを実行すると鍵ファイルの保管方法や保管するディレクトリをどうするか聞かれますが、デフォルトでも問題は無いので、そのままEnterキーを押します。<br>次に秘密鍵を利用するためのパスフレーズの入力を求められます。そのままEnterを押すとパスフレーズ無しで利用することが出来ますが、念の為にもパスフレーズを設定しておきましょう。最後にパスフレーズの確認を求められるのでもう一度パスフレーズを入力し、一致していれば鍵の生成が始まります。</p>

<p>生成した鍵は、~/.sshフォルダに保管されています。後は、同じようにscpを活用して公開鍵認証を行いたいリモートホストに公開鍵を転送すればよいのです。ファイルの転送先のリモートホストが192.168.11.9でユーザー名がservermanであり、ポート番号が2022番の場合は以下のコマンドを実行します。</p>

<pre><code>scp -P 2022 ~/.ssh/id_rsa.pub serverman@192.168.11.9:~/.ssh/authorized_keys</code></pre>

<p>リモートホストのパスワードを聞かれるので入力すると公開鍵の転送が完了します。ちなみにこちらのコマンドでも同じように実行できます。</p>

<pre><code>ssh-copy-id -p 2022 -i ~/.ssh/id_rsa.pub serverman@192.168.11.9</code></pre>

<p>すでに公開鍵認証方式を利用しているユーザーの公開鍵のファイルが存在している場合は上書きされるので注意しましょう。ひとつのユーザーに付き公開鍵の利用はひとつだけなので、複数のクライアントによるリモートログインを行いたい場合はユーザーを追加することで解決できます。</p>

<p>公開鍵の送付が終わったので、以下のコマンドを実行して公開鍵による認証方式が機能しているかを確認します。</p>

<pre><code>ssh -p 2022 serverman@192.168.11.9</code></pre>

<p>すると、Ubuntuの場合は秘密鍵を利用するためのパスフレーズの入力を要求するダイアログが表示されるので、先ほど指定した秘密鍵のパスフレーズを入力します。一度秘密鍵のパスフレーズを入力すると、一定時間パスフレーズの入力が不要になるので非常に便利になりますがセキュリティに問題がある点に注意しましょう。<br>もちろん秘密鍵ファイルと公開鍵ファイルは、そのままでは誰でも閲覧できる上に所有者であれば書き換えも可能なので、アクセス権限を変更しておくことも忘れないように設定します。</p>

<h3>パスワードによる認証方式を禁止して公開鍵認証のみを有効にする方法</h3>

<p>以上の設定によってリモートログインの際に公開鍵認証方式が利用できるようになりました。しかし、このままだとパスワードによる認証方式が利用することが可能です。そのため<span style="color:#ff0000;">設定ファイルを編集してパスワードによる認証方式を無効化します。</span>以下のコマンドを入力してOpenSSHの設定ファイルを開きます。</p>

<pre><code>sudo vi /etc/ssh/sshd_config</code></pre>

<p>以下に該当する箇所を探して書き換えます。下記の文言はパスワードによる認証を許可する設定です。</p>

<pre><code>#PasswordAuthentication yes</code></pre>

<p>書き換え後がこちらになります。これでSSHを利用するときにパスワードを使用したログインが禁止されます。</p>

<pre><code>PasswordAuthentication no</code></pre>

<h2 id="chapter7">結論</h2>

<p>以上の内容を簡潔にまとめると、UbuntuにSSHでリモートログインがするためには以下のコマンドを実行するだけです。</p>

<pre><code>sudo apt install openssh-server</code></pre>

<p>openssh-serverのインストールが終わったら下記のコマンドを使用して設定ファイルを編集します。もちろん編集前には設定ファイルのバックアップを忘れずに行いましょう。</p>

<pre><code>sudo vi /etc/ssh/sshd_config</code></pre>

<p>最後にWindowsの場合はTera Termを起動して接続先のIPアドレスとSSHポート番号、ユーザー名とパスワード（パスフレーズ）に加え必要であれば事前に生成しておいた公開鍵を指定してリモートログインを行います。DebianやUbuntuを使用してログインを行う場合は下記のコマンドを実行するのです。</p>

<pre><code>ssh [オプション] [ユーザー名@][接続先ホストのホスト名もしくはIPアドレス] [コマンド]</code></pre>

<p>重ねて申し上げますが、<span style="color:#ff0000;">sshコマンドでポート番号を指定するときのオプションは-pですが、scpのときには-Pになる点に注意しましょう。</span></p>

<p>そして、SSHを利用するときに推奨されるセキュリティ対策は以下のようになります。</p>

<ul>
<li>事前にOpenSSHの設定ファイルをバックアップしておく</li>
<li>SSHのポート番号をウェルノウンポートではない22番以外に設定する</li>
<li>バックドアの作動を防止するためにSSHによるrootログインを明確に禁止する</li>
<li>TCP Wrapperを使用してSSHのサービスを利用できる端末を限定させる</li>
<li>パスワードによる認証方式ではなく公開鍵認証方式を活用する</li>
<li>秘密鍵のパスフレーズは10文字以上の英数字で記号も追加して推測されないものを指定する</li>
<li>秘密鍵ファイルや公開鍵ファイルのアクセス権はファイルの所有者のみ読み込み可能にする</li>
<li>秘密鍵ファイルが外部に漏れてしまうことがないように適切な場所に保管する</li>
</ul>

