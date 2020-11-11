---
title: "【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定"
date: 2019-01-12T14:57:56+09:00
draft: true
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Ubuntu", "作業効率化","Linux" ]
---

<p>ほとんど自分用の備忘録です。あまり役に立たないかもしれませんが、トップバーとdockの合成はやっておくと一気に便利になるでしょう。</p>

<ul>
	<li><a href="#chapter1">その1:bashの履歴の上限を開放して、日時を表示させる</a></li>
	<li><a href="#chapter2">その2:日本語のディレクトリ名を英語に変更させる</a></li>
	<li><a href="#chapter3">その3:各種パッケージをインストールする</a></li>
	<li><a href="#chapter4">その4:vimのプラグインをインストールする</a></li>
	<li><a href="#chapter5">その5:vimのデフォルトの設定を変更させる</a></li>
	<li><a href="#chapter6">その6:UbuntuのトップバーとDockを合体させて下部に表示させる</a></li>
	<li><a href="#chapter7">その7:マザーボードの時刻とUbuntuの時刻がずれないようにする</a></li>
	<li><a href="#chapter8">その8:ファイルマネージャーNautilusのパスをテキスト表示させる</a></li>
	<li><a href="#chapter9">その9:OSのアニメーション表示を無効化させる</a></li>
	<li><a href="#chapter10">その10:画面オフを無効化させる</a></li>
	<li><a href="#chapter11">その11:起動時にパスワードを求めないようにする</a></li>
	<li><a href="#chapter12">その12:夜間モードをオンにする</a></li>
	<li><a href="#chapter13">その13:タイトルバーをダブルクリックしたときに最大化させる</a></li>
	<li><a href="#chapter14">その14:Radeonのドライバーをインストールする</a></li>
	<li><a href="#chapter15">その15:Kindleを使えるようにする</a></li>
	<li><a href="#chapter16">その16:FirefoxのUIを改造する</a></li>
</ul>                                   

<h2 id="chapter1">その1:bashの履歴の上限を開放して、日時を表示させる</h2>

<p>まずはbashの履歴の上限を開放します。以下のコマンドを実行して<code>.bashrc</code>を編集します。</p>

<pre><code>vi ~/.bashrc</code></pre>

<p>19行目あたりに<code>HISTSIZE</code>と<code>HISTFILESIZE</code>があるので、以下のように値を書き換えます。</p>

<pre><code>HISTSIZE=100000
HISTFILESIZE=200000
</code></pre>

<p>続いて、コマンドの履歴に実行日時を表示させるようにします。先程記入した行に続いて以下を追記させます。</p>

<pre><code>HISTTIMEFORMAT='%y/%m/%d %H:%M:%S '</code></pre>

<p>これでコマンドを実行した年月日、時刻まで正確に表示されるようになります。何らかの不具合が発生したときにトレースできるでしょう。最終的に下記の画像のようになれば成功です。</p>

<div class="img-center"><img src="/images/20190112001.jpg" alt=".bashrcの設定"></div>

<p>なお、この設定はbashを再起動しなければ適応されないので、次のコマンドを実行するまでに再起動しておきましょう。この設定がうまくいくと、historyコマンドを実行したときに下記のようになります。</p>

<div class="img-center"><img src="/images/20190112002.jpg" alt="historyコマンドに日時まで表示されるようになる。"></div>

<h2 id="chapter2">その2:日本語のディレクトリ名を英語に変更させる</h2>

<p>シェルを使用してディレクトリを移動する際に、日本語のディレクトリ名に設定されていると操作が面倒になります。そこで、日本語のディレクトリ名を英語に変更させましょう。以下のコマンドを入力すれば良いだけです。</p>

<pre><code>env LANGUAGE=C LC_MESSAGES=C xdg-user-dirs-gtk-update</code></pre>

<p>コマンド実行後にダイアログが表示されるので次回から表示しないをチェックして[Update Name]を押します。再起動すれば英語のディレクトリ名になっています。なお、日本語ディレクトリの中に何らかのファイルが格納されていた場合は日本語のディレクトリが残ってしまうので注意しましょう。</p>

<h3>【補足】SSHで接続されたサーバーに対して実行する場合</h3>

<p>上記の方法では、SSHで接続されたサーバーには変更が反映されません。デスクトップが用意されていないサーバー版のUbuntuでも同様です。そこで、以下のコマンドをコピペして、リモートホストのホームディレクトリに移動した上で英語ディレクトリを作ります。</p>

<pre><code>cd ~ && mkdir Desktop Downloads Templates Public Documents Music Pictures Videos</code></pre>

<p>続いて英語名のディレクトリをシステムのデフォルトとして認識させるために、以下のコマンドを実行して設定ファイルを開きます。</p>

<pre><code>vi ~/.config/user-dirs.dirs</code></pre>

<p>設定ファイルを開くと、日本語のファイル名で指定しているので、以下の英語のディレクトリ名に書き換えて保存します。</p>

<pre><code>XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"</code></pre>

<p>あとは、日本語のディレクトリをすべて削除して再起動させるだけです。</p>

<pre><code>rm -d デスクトップ ダウンロード ビデオ ミュージック テンプレート ドキュメント ピクチャ 公開
sudo shutdown -r now</code></pre>

<p>すると、サーバーのホームディレクトリが英語表記になっています。</p>

<h2 id="chapter3">その3:各種パッケージをインストールする</h2>

<p>ここからはパッケージのインストールを行っていきます。人によっては不要なものもあるので各自の判断でインストールしてください。</p>

<h3>VirtualBoxをインストールする</h3>

<p>OSの仮想化を行って実験をしたい場合はVirtualBoxをインストールしておきましょう。ただし、VirtualBoxはUbuntuソフトウェアセンターからインストールすると失敗してしまいます。そこでオラクルの公式サイトから.debファイルをダウンロードして、次のコマンドを実行します。</p>

<pre><code>sudo apt install ./VirtualBox-*.deb</code></pre>

<p>コマンドの*以下はとても長いのでタブキーを押して補完するなりしてください。ちなみに、CPUの仮想化支援機能が有効でなければ起動しても仮想化されたOSが起動しません。マザーボードのBIOS設定から変更しておきましょう。</p>

<h3>vlcをインストールする</h3>

<p>mp3やmp4などの音声や動画のメディアファイルをまとめて再生できるようにするためにもVLCをインストールしておきましょう。</p>

<pre><code>sudo apt install vlc</code></pre>

<p>後はVLCを起動して字幕の非表示やショートカットキーの割り当てなどを行っておくと快適に利用できるでしょう。Ubuntuの設定から動画と音楽のデフォルトアプリをVLCに変更しておくこともお忘れなく。</p>

<h3>remminaをインストールする</h3>

<p>remminaはRDPやSSHなどをサポートしているリモートデスクトップ用のアプリです。主にWindows10に対するリモートデスクトップとして利用します。まずは以下のコマンドを入力してremminaをインストールしましょう。</p>

<pre><code>sudo apt install remmina</code></pre>

<p>まずはWindows10側の設定をします。Windowsキーを押しながらEを押してエクスプローラーを開き、PCを選択してプロパティを表示させます。[コンピューターの基本的な情報]が表示されるので、左側のメニューにある[リモート設定]をクリックします。リモートデスクトップのメニューにあるトグルボタンのうち、[このコンピューターへのリモート接続を許可する]をクリックしてWindows側の設定は完了です。</p>

<p>続いて、Ubuntuにインストールしたremminaの設定に入ります。remminaの画面の左側にある＋ボタンを押します。そしてリモートデスクトップされるWindows10のIPアドレスとユーザー名、パスワードを入力して、[保存]をクリックします。</p>

<div class="img-center"><img src="/images/20190112003.jpg" alt="remminaにリモートデスクトップするWindows10の情報を入力する"></div>

<p>これで設定は完了です。接続したいWindowsを選んでダブルクリックすれば自動的に接続されます。なお、WindowsはProエディションでなければリモートデスクトップできない点に注意してください。それからリモートデスクトップ中は、リモートデスクトップされるWindowsの画面がロックされます。</p>

<h3>libreofficeをインストールする</h3>

<p>Ubuntuで表計算や文書作成などを行いたい場合は、libreofficeをインストールします。ただし、libreofficeのインストールに必要なディスク使用量は500MB程度とかなり大型なのでディスクの残量には注意しましょう。</p>

<pre><code>sudo apt install libreoffice</code></pre>

<p>インストールにかなりの時間がかかるので、待ち時間でシェルで何らかの作業を行いたい場合は<code>Ctrl+Shift+T</code>を押して新しいタブを開くと良いでしょう。</p>

<h3>beepをインストールする</h3>

<p>beepはマザーボードに設置されているビープスピーカーを鳴らせることができるコマンドです。このコマンドをcrontabなどと組み合わせて使うことで合図や時間管理などに利用できます。</p>

<pre><code>sudo apt install beep</code></pre>

<p>Ubuntuでbeepコマンドを実行させてビープ音を発生させるためには、OSの設定を変更させる必要があります。以下のコマンドを実行してpcspkrモジュールをコメントアウトします。</p>

<pre><code>sudo vi /etc/modprobe.d/blacklist.conf</code></pre>

<p>この設定ファイルを起動した後46行目あたりに<code>blacklist pcspkr</code>という行があるので<code>#blacklist pcspkr</code>と書き換えてコメントアウトさせるのです。続いてpcspkrモジュールを読み込ませる次のコマンドを打ち込みます。</p>

<pre><code>sudo modprobe pcspkr</code></pre>

<p>これでbeepコマンドの設定は完了です。試しにbeepコマンドを実行してビープ音が鳴るかどうかを試してみましょう。</p>

<pre><code>beep -f 300 -l 1000</code></pre>

このコマンドは300hzのビープ音を1000ミリ秒（1秒）鳴らすコマンドです。このコマンドを入力しても、ビープ音が聞こえない場合はマザーボードにビープ音用のスピーカーが接続されていないか、壊れている可能性があります。

<p>beepコマンドが使えるようになれば、crontabで一時間おきにビープ音を鳴らして時間管理を徹底させたり、特定のプログラムの処理が終わったら合図として実行させることもできます。ビープ音を鳴らすためのスピーカーはAmazonなどで一個100円程度で購入できます。</p>

<h3>hugoをインストールする</h3>

<p>HUGOは静的サイトジェネレーターです。ほとんどの方はWordpressを使用しているようですが、私はサイト制作に静的サイトジェネレーターを使用するのでインストールします。</p>

<pre><code>sudo apt install hugo</code></pre>

<p>インストール後はホームディレクトリに移動して下記のコマンドを実行して新サイト用のディレクトリを作ります。</p>

<pre><code>hugo new site ./[sitename]</code></pre>

<p>記事の作成には以下のコマンドを実行します。</p>

<pre><code>hugo new post/[articlename].md</code></pre>

<p>.mdファイルはHTMLタグがそのまま使用可能です。</p>

<p>ちなみにWordpressはバックアップをするためにわざわざプラグインを導入する必要がありますが、HUGOはディレクトリをそのままコピーすればいいだけなので簡単です。リストアする際にもバックアップしておいたディレクトリをペーストすれば良いだけです。</p>

<p>テーマも豊富ですし、ブログっぽいサイトを作りたいだけであれば静的サイトジェネレーターを使いましょう。わざわざCMSを組んでまでサイトを運営する必要はないのです。</p>

<h3>huge版のvimをインストールする</h3>

<p>UbuntuにインストールされているデフォルトのvimはSmall版です。元に戻すuコマンドが数値を指定しないとできなかったり、挿入モードでカーソル移動ができないなど、使い勝手が悪いです。だから、以下のコマンドを実行してhuge版のvimをインストールしましょう。</p>

<pre><code>sudo apt install vim</code></pre>

<p>このコマンドを実行してhuge版のvimをインストールした後、下記のコマンドを実行してバージョンを確認します。画像のようにhuge版であることが表示されればインストールは成功です。</p>

<pre><code>vim --version</code></pre>

<div class="img-center"><img src="/images/20190112004.jpg" alt="huge版のvimがインストールされていることがわかる"></div>

<h3>GIMPをインストールする</h3>

<p>pngをjpgに変換したり、サイズを調節したりする単純な作業はimagemagickをコマンドラインで実行すればすぐにできますが、個人情報の黒塗りや文字列の挿入などはGIMPを使ったほうがやりやすいです。</p>

<pre><code>sudo apt install gimp</code></pre>

<p>GIMPは起動に時間がかかってしまうので、できれば常に起動した状態で待機しておいたほうが良いでしょう。矩形選択で塗りつぶしする方法は[ツール]から[矩形選択]を行って、[編集]から[描画色で塗りつぶす]を選択します。</p>

<h3>tweaktoolをインストールする</h3>

<p>UbuntuのUIの変更や挙動などを設定したい場合はtweaktoolをインストールすれば簡単にできます。</p>

<pre><code>sudo apt install gnome-tweak-tool</code></pre>

<p>Ubuntu18.04はGNOMEで、Unityではないので間違ってもUnity-tweak-toolをインストールしないようにしましょう。設定はお好みで構いませんが、[ウィンドウ]から[タイトルバーの挙動]のメニューにある[ダブルクリック]を[Toggle Maximize]に設定しておけばダブルクリックでウィンドウが最大化され、Windowsと同じように扱えます。</p>

<h3>wakeonlanをインストールする</h3>

<p>複数のPCの電源を遠隔で管理したいのであればWOL(Wake On Lan)を使いましょう。Linuxではwakeonlanコマンドを使えば対象のMACアドレスのNICを装備しているPCを起動できます。</p>

<pre><code>sudo apt install wakeonlan</code></pre>

<p>続いてWOLを使用して起動させたいPCのBIOSのWOLを有効化させて、Linuxを使用している場合は以下のコマンドを入力してWOLを有効化させるパッケージをインストールします。続いてOSのWOLを有効化させます。</p>

<pre><code>sudo apt install ethtool
sudo ethtool -s [NICname] wol g</code></pre>

<p>wakeonlanコマンドの使用方法はWOLで起動させたいMACアドレスを控えた上で以下のコマンドを実行するだけです。</p>

<pre><code>wakeonlan xx:xx:xx:xx:xx:xx</code></pre>

<p>これで手元のマシンから離れた場所にあるPCの電源をつけることができるようになりました。離れた場所にあるPCの電源スイッチを押しに行かなくてもいいので楽です。</p>

<p>ちなみにWindows10の場合は何もしなくてもMACアドレスを入力すれば起動します。起動した後はSSHでリモートログインするなりremminaを使ってRDPするなりご自由にどうぞ。</p>

<h3>python3関係のモジュール類をインストールする</h3>

<p>Pythonプログラミングをする方は予め必要なモジュールや開発に必要なパッケージをインストールしておきましょう。</p>

<pre><code>sudo apt install python3-pip #Pythonモジュール管理ツール、PIP3をインストールする
sudo pip3 install beautifulsoup4 #HTML構文解析用のbeautifulsoupをインストールする
sudo pip3 install lxml #高速HTMLパーサーのlxmlをインストールする
sudo pip3 install selenium #Webテストツールのseleniumをインストールする
sudo pip3 install pyautogui #GUIオートメーション開発用のpyautoguiをインストールする
sudo pip3 install python3-xlib #pyautoguiに必要なpython3-xlibをインストールする
sudo apt install scrot python3-tk python3-dev #pyautoguiに必要なパッケージをまとめてインストールする
sudo pip3 install pyperclip #クリップボードを操作するpyperclipをインストールする
sudo apt install xsel #Ubuntu上でpyperclipを正常に動かすためにxselをインストールする
sudo pip3 install nltk #自然言語処理用のnltkをインストールする
</code></pre>

<p>ちなみにウェブのデータをダウンロードするrequestモジュールはbeautifulsoup4をインストールするとセットでついてくるのであえて入力する必要はありません。他にも機械学習やディープラーニング用にnumpyやtensorflowなどをお好みでインストールしてください。</p>

<p>作ったPythonプログラムを実行するときは予め拡張子.pyでファイルを作成しておいて、1行目に下記のシバン行を入力しておきましょう。</p>

<pre><code>#! /usr/bin/python3</code></pre>

<p>そしてchmodで実行権限を付与しておき、実行は対象のファイルを直接指定して実行させます。</p>

<pre><code>chmod 700 ./test.py
#下記のコマンドで実行する
./test.py</code></pre>

<h3>viewniorをインストールする</h3>

<p>viewniorは操作を自由に変更できる画像ビューアーです。Ubuntuにデフォルトでインストールされている画像ビューアーとは違って、軽量で操作を自由に変更できる用になっているので誰でも簡単に操作できます。</p>

<pre><code>sudo apt install viewnior</code></pre>

<p>viewniorを起動して、左上の歯車のボタンをクリックして設定画面に入ります。動作タブをクリックして[マウスホイール]を[画像を移動]に割り当てましょう。これでマウスホイールで次の画像や前の画像を読み込むことができます。拡大する際はCtrlキーを押しながらマウスホイールを動かしましょう。ブラウザの拡大ショートカットと同じです。</p>

<div class="img-center"><img src="/images/20190112005.jpg" alt="viewniorの設定画面"></div>

<h3>vokoscreenをインストールする</h3>

<p>vokoscreenは動画キャプチャーツールです。これがあればGUIオートメーションプログラミングの開発に便利です。</p>

<pre><code>sudo apt install vokoscreen</code></pre>

<p>デフォルトではマウスカーソルを撮影しない設定になっているのでチェックボックスを外してカーソルも撮影するようにしておきましょう。</p>

<div class="img-center"><img src="/images/20190112006.jpg" alt="vokoscreenの設定画面"></div>

<h3>w3mをインストールする</h3>

<p>w3mはシェル上で起動できるCUIウェブブラウザです。JavaScriptが実行されず、デフォルトでは画像も表示されないので通信量が限られているテザリング環境下での情報収集には最適です。</p>

<pre><code>sudo apt install w3m</code></pre>

<p>他にもウェブ開発のテスト用に使用します。w3mに関する詳しい操作方法は下記の内部リンク記事をご覧ください。</p>

<p>【内部リンク】<a href="/post/20181004/">【w3m】CUIで動くウェブブラウザの紹介【Lynx】</a></p>

<h3>thunderbirdをインストールする</h3>

<p>thunderbirdはメールクライアントソフトです。複数のメールのアカウントを統合させて管理できる上に、迷惑メールフィルタも柔軟に設定できるので非常に便利です。</p>

<pre><code>sudo apt install thunderbird</code></pre>

<p>日本語版をインストールしたい方はこちらを入力してください</p>

<pre><code>sudo apt install thunderbird-ja</code></pre>

<p>ちなみにthunderbirdはプロファイルをコピーすることでアカウントや設定の引き継ぎができるようになっていますが、Windowsから持ってきたプロファイルをUbuntuのthunderbirdにコピーしないようにしましょう。正しいパスワードを入力してもバグが発生してしまい、ログインできません。</p>

<p>そのため、元Windowsユーザーの方はthunderbirdのプロファイルの引き継ぎをするのではなく、アカウントの作成からメールアドレスとパスワードを入力して一から設定を施しましょう。また、gmailは信頼性の低いアプリのログインの許可は不要です。二段階認証が設定された状態でもthunderbirdからそのままログインできます。</p>

<h2 id="chapter4">その4:vimのプラグインをインストールする</h2>

<p>vimはそのままではコーディングには不向きです。より使いやすくするために2つのプラグインをインストールしておきましょう。<code>~/.vim/</code>が存在しない場合は<code>mkdir</code>コマンドで作成しておきます。</p>

<h3>emmet.vimのインストール</h3>

<p>emmet.vimは下記のリンクからemmet.zipをインストールして、<code>~/.vim/</code>に解凍するだけです。</p>

<p>【外部リンク】<a href="https://github.com/mattn/emmet-vim">https://github.com/mattn/emmet-vim</a></p>


<h3>surround.vimのインストール</h3>

<p>surround.vimも下記のリンクからsurround.zipをインストールして、<code>~/.vim/</code>に解凍するだけです。</p>

<p>【外部リンク】<a href="https://www.vim.org/scripts/script.php?script_id=1697">https://www.vim.org/scripts/script.php?script_id=1697</a></p>

<p>それぞれの詳しい使い方については下記の内部リンクを参照してください。</p>

<p>【内部リンク】<a href="/post/vim-plugin/">vimプラグインのemmetとsurroundのインストール方法と使い方【NeoBundleは不要】</a></p>

<h2 id="chapter5">その5:vimのデフォルトの設定を変更させる</h2>

<p>vimのデフォルト設定では、行数が表示されずコーディングが難しいです。そのため、デフォルトで行数を表示させるようにしましょう。まずは以下のコマンドを入力してvimの設定ファイルであるvimrcを開きます。</p>

<pre><code>sudo vi /usr/share/vim/vimrc</code></pre>

<p>そして、行末に以下の設定を追記します。</p>

<pre><code>set number</code></pre>

<p>他にもシェルのタイトルにvimのファイル名を表示させる下記の設定も入力しておくと良いでしょう。</p>

<pre><code>set title</code></pre>

<h2 id="chapter6">その6:UbuntuのトップバーとDockを合体させて下部に表示させる</h2>

<p>UbuntuのトップバーとDockを合体させて下部に表示させるとWindows風のUIになって使いやすくなります。</p>

<div class="img-center"><img src="/images/20190112007.jpg" alt="トップバーとDockを合体させて下部に表示させた状態"></div>

<p>まずは下記のコマンドを入力してchrome-gnome-shellをインストールさせます。</p>

<pre><code>sudo apt install chrome-gnome-shell</code></pre>

<p>続いて、下記の外部リンクをクリックしてFirefoxにGNOME Shell integrationというアドオンをインストールさせます。</p>

<p>【外部リンク】<a href="https://addons.mozilla.org/ja/firefox/addon/gnome-shell-integration/">https://addons.mozilla.org/ja/firefox/addon/gnome-shell-integration/</a></p>

<p>下記の外部リンクをクリックして右上のトグルスイッチをONにさせます。後続の画像の用に設定できれば完了です。</p>


<p>【外部リンク】<a href="https://extensions.gnome.org/extension/1160/dash-to-panel/">https://extensions.gnome.org/extension/1160/dash-to-panel/</a></p>

<div class="img-center"><img src="/images/20190112008.jpg" alt="DashtoPanelの設定"></div>

<p>後は、トグルスイッチの左側の設定をクリックしてお好みで変更しましょう。位置タブのパネルの表示位置を下に設定すればWindows風のUIになります。この設定は[tweaktool]の[拡張機能]から[Dash to panel]の項目にある歯車をクリックすれば再び呼び出せます。</p>

<p><b>注意:デフォルトの設定だと、夜間モード時にUIが極端に重くなってしまうことがあります。重すぎる場合は[挙動]及び[微調整]のタブから、アニメーション表示関係をすべて無効化しておきましょう。</b></p>


<h2 id="chapter7">その7:マザーボードの時刻とUbuntuの時刻がずれないようにする</h2>

<p>Ubuntuを使うとマザーボードの時刻が9時間ずれてしまいます。これではBIOSの設定から時刻を指定しての起動ができません。そこで以下のコマンドを実行してマザーボードの時刻とUbuntuの時刻を統一させます。</p>

<pre><code>sudo timedatectl set-local-rtc true</code></pre>

<p>これでマザーボードとUbuntuの時刻が9時間ずれてしまうことはありません。BIOSで指定した時刻にきちんと起動させることができます。</p>

<h2 id="chapter8">その8:ファイルマネージャーNautilusのパスをテキスト表示させる</h2>

<p>ファイルマネージャーのNautilusはデフォルト設定ではアドレスバーの部分がボタン表示になっていて、パスをコピーしてシェルにペーストさせることができません。ショートカットキーとして<code>Ctrl+L</code>でパスを表示させることができるようになっていますが、デフォルトでパスを表示させるようにするには以下のコマンドを入力しておきましょう。</p>

<pre><code>gsettings set org.gnome.nautilus.preferences always-use-location-entry true</code></pre>

<p>戻すときは、上記のコマンドの末尾の<code>true</code>を<code>false</code>に変更して再入力するだけで良いです。</p>

<h2 id="chapter9">その9:OSのアニメーション表示を無効化させる</h2>

<p>OSのアニメーション表示が鬱陶しく感じたり、処理が重く感じるようであれば無効化しておきましょう。アニメーションの無効化設定は先程インストールしたtweaktoolから設定可能です。左メニューの[外観]から、[アニメーション]をオフに設定します。</p>

<div class="img-center"><img src="/images/20190112009.jpg" alt="OSのアニメーション表示を無効化させる設定方法"></div>

<h2 id="chapter10">その10:画面オフを無効化させる</h2>

<p>Ubuntuは何も操作しない状態で一定時間放置していると自動的に画面がオフになってしまい、更に時間が経つとロックされてしまいます。そこで、画面オフとロックを無効化させておきましょう。</p>

<p>設定を起動して左メニューの[電源]をクリックし[ブランクスクリーン]を[しない]に設定、[自動サスペンド]を[オフ]に設定します。</p>

<div class="img-center"><img src="/images/20190112010.jpg" alt="画面オフとオートロックを無効化させる"></div>

<h2 id="chapter11">その11:起動時にパスワードを求めないようにする</h2>

<p>自分しか使用しないPCであることがわかっている場合は、起動時にパスワードを求めないように設定すると快適です。これも設定から変更可能です。</p>

<p>設定を開いて左メニューの[詳細]から[ユーザー]を選択します。左上の[ロック解除]を押して、[自動ログイン]を[オン]にしておきましょう。これで次回の起動時からパスワードを入力しなくてもログインできます。</p>

<div class="img-center"><img src="/images/20190112011.jpg" alt="起動時に自動的にログインするように設定する"></div>


<h2 id="chapter12">その12:夜間モードをオンにする</h2>

<p>夜中にコーディングをやっていると眠れなくなってしまうことがあります。そこで夜間モードをオンに設定して目の疲れを最小限にさせましょう。設定からデバイスを選択し、ディスプレイを選んで夜間モードを表示してオンにさせます。</p>

<div class="img-center"><img src="/images/20190112012.jpg" alt="夜間モードをオンにして目の疲れを最小限にさせる"></div>

<h2 id="chapter13">その13:タイトルバーをダブルクリックしたときに最大化させる</h2>

<p>Ubuntuのデフォルト設定ではWindowsのようにタイトルバーをダブルクリックしても最大化されません。そこで先程インストールしたtweaktoolを起動してタイトルバーの挙動を変更します。</p>

<p>ウィンドウからタイトルバーの挙動の欄にある、ダブルクリックをToggleMaximizeに設定させるだけで完了です。</p>

<div class="img-center"><img src="/images/20190112013.jpg" alt="ウィンドウのダブルクリックで最大化させる設定"></div>

<h2 id="chapter14">その14:Radeonのドライバーをインストールする</h2>

<p>RadeonのグラフィックカードはUbuntuのデフォルトのドライバーでも問題なく動作します。私が使用しているMSI製のRX580も例外ではなく、ドライバーのインストールは不要ですがAMDの公式ドライバーをインストールしたい場合は下記の外部リンクを辿ります。</p>

<p>【外部リンク】<a href="https://www.amd.com/en/support">https://www.amd.com/en/support</a></p>

<p>リンク先のサイトでインストールしたいドライバーの種類を選択し、SUBMITを押します。そしてUbuntu用のドライバをダウンロードします。</p>

<div class="img-center"><img src="/images/20190112014.jpg" alt="Radeonドライバーの種類を選択してダウンロード"></div>

<p>後はダウンロードした.xzファイルを以下のコマンドでインストールします。</p>

<pre><code>tar xf amdgpu-pro*.tar.xz
cd amdgpu-pro*
./amdgpu-pro-install -y
</code></pre>

<p>アンインストールしたいときは下記のコマンドを実行します。</p>

<pre><code>amdgpu-pro-uninstall</code></pre>

<p>ドライバーのインストールに失敗して画面に何も表示されなくなったときのために、予めopenSSHserverをインストールしてリモートで制御できるようにした上でドライバーのインストールをしたほうが安全でしょう。</p>

<h2 id="chapter15">その15:Kindleを使えるようにする</h2>

<p>AmazonKindleはWindowsなどには対応していますがLinux系OSには対応していません。そこで先程インストールしたVirtualBoxから起動したWindows10から起動させましょう。面倒な設定も不要で豆腐化も発生せず、普通に日本語の文章が読めています。Windowsのライセンスキーが余っている方は試してみてはいかがでしょうか。</p>

<p>他にも、VirtualBoxで起動させたAndroidからでも起動できるようです。Windowsのライセンスキーを持っておらず、マシンのスペックも限られている状態であれば試して見る価値はあるでしょう。</p>

<p>他にも、ブラウザ上からKindle本が読めるKindleCloudReaderがあります。画像タイプのKindle本であればブラウザ上で表示できますが、文章タイプのKindle本は読めないので、素直にwineをインストールさせましょう。</p>


<h2 id="chapter16">その16:FirefoxのUIを改造する</h2>

<p>UbuntuにインストールされているFirefoxのUIが使いにくく、ブックマークツールバーにはタブですべて開くが表示されていて、タブのバツボタンも大きいので誤ってクリックしてしまうことが多いです。この2点を解決するために、FirefoxのUIを改造します。まずは以下のコマンドを入力して設定ファイルのディレクトリを作ります。</p>

<pre><code>cd ~/.mozilla/firefox/[プロファイル名].default/
mkdir chrome</code></pre>

<p>プロファイル名は端末によって異なっています。英数字の文字列の後に<code>.default</code>が続いているので<code>ls</code>コマンドで確認しておきましょう。<code>cd</code>コマンドで移動したらchromeディレクトリを作成します。続いて以下のコマンドを入力して設定ファイルを作ります。</p>

<pre><code>vi userChrome.css</code></pre>

<p>起動したら以下の内容をuserChrome.cssに書き込んで保存させます。</p>

<pre><code>@charset "utf-8";
/* ブックマークツールバーの[タブですべて開く]を非表示にさせる */
menuseparator.bookmarks-actions-menuseparator,menuitem.openintabs-menuitem { display: none !important;}
/* タブのバツボタンを非表示にさせる */
#tabbrowser-tabs .tabbrowser-tab .tab-close-button { display: none!important;}
</code></pre>

<p>これでタブのバツボタンや、ブックマークツールバーの[タブで全て開く]を誤ってクリックしてしまうことは無いでしょう。タブを閉じるときは、カーソルを対象のタブに合わせて中ボタンをクリックするか<code>Ctrl+W</code>を押せば良いのです。</p>


