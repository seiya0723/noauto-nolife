---
title: "sedコマンドの使い方と活用例"
date: 2018-12-12T16:35:53+09:00
draft: false
thumbnail: "images/command.jpg"
categories: [ "command" ]
tags: [ "スタートアップシリーズ","Linux","作業効率化", "テキスト編集" ]
---

<p>sedはコマンドラインからテキストの抽出や置換、削除などの処理を正規表現を使用して行うことができるストリームエディタ（Stream EDitor）プログラムです。</p>

<p>例えば、ようやく仕上がった原稿に、大量の誤字が見つかりました。誤字のあるファイルが一つだけの場合は、vimなどのエディタを起動して置換処理をすればすぐに終わるでしょう。しかし、同じ誤字が複数のファイルに点在していて、時間が限られている状況では、この方法はとても非効率です。</p>

<p>そこでsedコマンドの出番です。sedコマンドなら複数のファイルに点在している誤字であってもコマンドライン一行で全て修正できます。</p>

<ul>
<li><a href="#chapter1">sedコマンドの使用方法について</a></li>
<li><a href="#chapter2">活用例</a></li>
<li><a href="#chapter3">結論</a></li>
</ul>

<h2 id="chapter1">sedコマンドの使用方法について</h2>

<p>sedコマンドの書式は下記のようになっています。</p>

<pre><code>sed [オプション] [スクリプト] [対象ファイル]</code></pre>

<h3>オプションについて</h3>

<p>sedにはオプションとスクリプトの2つが用意されています。これによって非常に強力なテキストの編集が可能になるのです。オプションには以下のようなものがあります。</p>

<table>
<thead>
<tr>
<th>オプション</th><th>機能</th>
</tr>
</thead>
<tbody>
<tr>
<th>-n<br>--quiet<br>--silent</th><th>全ての出力を制限する。次項のpコマンドを指定した場合は該当する行のみ出力する。</th>
</tr>
<tr>
<th>-e [スクリプト]<br>--expression=[スクリプト]</th><th>次項のスクリプトを使用する際に指定する。</th>
</tr>
<tr>
<th>-f [スクリプトファイル]<br>--file=[スクリプトファイル]</th><th>次項のスクリプトを書き込んだファイルを指定する。</th>
</tr>
<tr>
<th>--follow-symlinks</th><th>処理の際にシンボリックリンクを辿る</th>
</tr>
<tr>
<th>-i[拡張子]<br>--in-place[=拡張子]</th><th>[拡張子]を省略すると、該当するファイルを直接編集する。[拡張子]を指定すると該当ファイルのバックアップを作成する。</th>
</tr>
<tr>
<th>-l [長さ]<br>--line-length=[長さ]</th><th>lコマンドの行の折り返しの長さを指定する</th>
</tr>
<tr>
<th>--posix</th><th>全てのGNU拡張を無効にする。</th>
</tr>
<tr>
<th>-E<br>-r<br>--regxp-extended</th><th>拡張正規表現を活用する。</th>
</tr>
<tr>
<th>-s<br>--separate</th><th>複数の入力ファイルをひとつのファイルとして取り扱わず、個別のファイルとして取り扱う。</th>
</tr>
<tr>
<th>--sandbox</th><th>サンドボックスモードで起動させる</th>
</tr>
<tr>
<th>-u<br>--unbuffered</th><th>入力ファイルからデータをごく少量ずつ取り込んで、頻繁に出力バッファに流す(flush)。</th>
</tr>
<tr>
<th>-z<br>--null-data</th><th>NUL文字で行を分割する。</th>
</tr>
</tbody>
</table>

<p>テキストファイルを直接編集する<code>-i</code>オプションを活用することによって、複数のファイルを一括処理することができます。冒頭の誤字が複数のファイルに点在している場合などに利用すると便利です。</p>


<h3>スクリプトについて</h3>

<p>オプション<code>-e</code>で指定できるスクリプトは以下のようなものがあります。</p>

<table>
<thead>
<tr>
<th>スクリプト</th><th>機能</th>
</tr>
</thead>
<tbody>
<tr>
<th>[数値]</th><th>[数値]行目を処理の対象にする。省略した場合は全ての行が対象になる。</th>
</tr>
<tr>
<th>[数値],[数値]</th><th>[数値]行目から[数値]行目までを処理の対象にする。</th>
</tr>
<tr>
<th>[数値]=</th><th>[数値]行目の行番号を出力する。[数値]を省略した場合は全ての行に出力。</th>
</tr>
<tr>
<th>[数値]a [文字列]</th><th>[数値]行目の次の行に[文字列]を挿入する。[数値]が省略されている場合は各行に[文字列]を挿入する。</th>
</tr>
<tr>
<th>[数値]i [文字列]</th><th>[数値]行目の前の行に[文字列]を挿入する。[数値]が省略されている場合は各行に[文字列]を挿入する。</th>
</tr>
<tr>
<th>[数値]c [文字列]</th><th>[数値]行目に[文字列]を置換する。[数値]が省略されている場合は全ての行に[文字列]を置換する。</th>
</tr>
<tr>
<th>s/[置換対象]/[置換文字]/</th><th>[置換対象]に一致するものを検索し、[置換文字]で置き換える。</th>
</tr>
<tr>
<th>y/[変換前の文字]/[変換後の文字]/</th><th>[変換前の文字]に一致する文字を検索し[変換後の文字]に変換する。</th>
</tr>
<tr>
<th>[数値]d</th><th>[数値]行目を削除する。[数値]を省略した場合は全ての行が対象になる。</th>
</tr>
<tr>
<th>p</th><th>-nオプションで指定した場合に有効。処理または指定を行った行だけを出力する。</th>
</tr>
<tr>
<th>g</th><th>置換を利用する際に全ての行を対象とする</th>
</tr>
</tbody>
</table>

<h4>置換について</h4>

<p>sedコマンドで置換を利用するには先述の通り<code>s/[置換対象]/[置換文字]/</code>を使用します。</p>

<pre><code>sed -e 's/abc/ABC/'</code></pre>

<div class="img-center"><img src="/images/20181212001.jpg" alt="行の中から最初にヒットした文字列のみを置換する" /></div>

<p>これでabcという文字列がABCに置換されます。ただしこれでは置換対象が行の中から最初にヒットした文字列のみなので、末尾にgを加えることで全ての行を置換することができます。</p>

<pre><code>sed -e 's/abc/ABC/g'</code></pre>

<div class="img-center"><img src="/images/20181212002.jpg" alt="全てのabcを検索対象にしてABCに置換する" /></div>

<p>また、文字の変換とは違うので、指定する文字数が[置換対象]と[置換文字]で不一致であっても問題はありません。次のようなコマンドも認められます。</p>

<pre><code>sed -e 's/abcd/ABC/g'</code></pre>

<div class="img-center"><img src="/images/20181212003.jpg" alt="全てのabcdを検索対象にしてABCに置換する" /></div>

<h4>変換について</h4>

<code>y/[変換前の文字]/[変換後の文字]/</code>で指定する文字は[変換前の文字]と[変換後の文字]の文字数が一致している必要があります。例えば以下の例は誤りです。

<pre><code>誤った例
sed -e 'y/abcd/ABC/'</code></pre>

<p>これではエラーが発生してしまいます。正しくはこう書きます。</p>

<pre><code>正しい例
sed -e 'y/abcd/ABCC/'</code></pre>

<p>これでテキストの中に含まれるaはAに、bはBに、cとdはCに変換されます。置換ではなく変換なので文字単位で書き換えられます。</p>

<div class="img-center"><img src="/images/20181212004.jpg" alt="全てのabcdを検索対象にしてそれぞれをABCCに変換する" /></div>

<h2 id="chapter2">活用例</h2>

<h3>複数のファイルの誤字の一括修正</h3>

<p>冒頭の誤字が点在しているテキストファイルを一括修正処理する方法になります。まずは普通にテキストファイルを指定して誤字を修正してみましょう。abcが誤字で、ABC
に修正させます。</p>

<pre><code>sed -i -e 's/abc/ABC/g' ./testsed.txt</code></pre>

<div class="img-center"><img src="/images/20181212005.jpg" alt="テキストファイルの置換を行って上書きする" /></div>

<p>次は2つ以上のファイルを指定して誤字の修正を行います。</p>

<pre><code>sed -i -e 's/abc/ABC/g' ./testsed.txt ./testsed2.txt</code></pre>

<div class="img-center"><img src="/images/20181212006.jpg" alt="2つ以上のテキストファイルの置換を行って上書きする" /></div>

<p>無事成功しました。続いて、誤字のあるファイル名がわからない場合はこうします。</p>

<pre><code>grep -l abc ./*.txt | xargs sed -i -e 's/abc/ABC/g'</code></pre>

<p>まずは<code>grep</code>コマンドを<code>-l</code>オプションで検索することによって誤字を含んでいるファイルパスだけを出力します。この時、検索するファイルは、カレントディレクトリに存在する<code>.txt</code>の拡張子を持つファイルが対象です。</p>

<div class="img-center"><img src="/images/20181212007.jpg" alt="grepで誤字のあるファイルパスが出力される" /></div>

<p>続いて、この<code>grep</code>の処理結果を<code>xargs</code>コマンドを使って<code>sed</code>コマンドに引き渡します。<code>xargs</code>はパイプで処理結果を渡すことで、後述のコマンドを実行できるコマンドです。今回は<code>sed</code>コマンドにgrepの検索結果で出力されるパスを引き渡します。</p>

<div class="img-center"><img src="/images/20181212008.jpg" alt="grepで誤字のあるファイルを検索して、sedで全て置換する" /></div>

<p>無事、全てのファイルが置換できました。<code>grep</code>には再帰的に検索する<code>-r</code>オプションも用意されているので、カレントディレクトリ以下のファイルを再帰的に検索したいのであればこうします。</p>

<pre><code>grep -rl abc ./* | grep .txt | xargs sed -i -e 's/abc/ABC/g'</code></pre>

<div class="img-center"><img src="/images/20181212009.jpg" alt="grepで誤字のあるファイルを再帰的に検索して、sedで全て置換する" /></div>

<p>最初の<code>grep</code>で再帰的にabcを含むファイルのパスを表示し、次の<code>grep</code>で<code>.txt</code>の拡張子を持つファイルのみに限定させ、<code>xargs</code>で出力結果を<code>sed</code>に引き渡して置換しています。</p>

<p>このように複数のファイルに点在している誤字を一括で修正するこのコマンドは非常に便利なので、覚えておきましょう。誤字の修正だけでなく、検閲などにも有効です。</p>

<div class="img-center"><img src="/images/20181212010.jpg" alt="複数ファイルの文字列の検閲もsedなら簡単にできる" /></div>

<h3>特定の行の抽出と削除</h3>

<p>特定の行の削除を行いたいのであれば、行を指定して<code>d</code>コマンドを使用します。</p>

<pre><code>sed -e '2,4d' ./test/hoge.txt</code></pre>

<div class="img-center"><img src="/images/20181212011.jpg" alt="2行目から4行目を削除して出力する" /></div>

<p>これで2行目から4行目が削除されました。</p>

<p>逆に特定の行の抽出を行いたい場合は<code>-n</code>オプションと<code>p</code>コマンドを使用します。下記のコマンドは2行目から4行目を抽出しています。</p>

<pre><code>sed -e -n '2,4p' ./test/hoge.txt</code></pre>

<div class="img-center"><img src="/images/20181212012.jpg" alt="2行目から4行目を抽出して出力する" /></div>

<p>この機能を応用して、複数のテキストファイルの先頭部分を一括確認することができます。</p>

<pre><code>find ./* -iname '*.txt' -exec sed -n -e '1,4p' {} \;</code></pre>

<div class="img-center"><img src="/images/20181212013.jpg" alt="カレントディレクトリから再帰的に確認して1行目から4行目を抽出して出力する" /></div>

<p><code>find</code>コマンドの評価式<code>-exec</code>を使用しました。表示するファイルの並び替えに<code>sort</code>コマンドを使用するのも良いでしょう。</p>

<p>このコマンドで、静的サイトジェネレーターHUGOの記事ごとの設定の確認も簡単です。</p>

<div class="img-center"><img src="/images/20181212014.jpg" alt="テキストファイルの設定行の抽出も簡単" /></div>

<p>これで記事ごとのカテゴリ分けが間違っていないか、下書きモードになっていないか、サムネイルはきちんと設定されているか、などを一気に確認することができます。vimエディタでひとつずつ起動するよりも圧倒的に早いです。</p>

<p>ただし再帰的ではなく、ファイルの上から順に一定数の行を出力する場合は<code>head</code>コマンドの方が簡単です。</p>

<pre><code>head -n 4 ./*.txt</code></pre>

<div class="img-center"><img src="/images/20181212017.jpg" alt="テキストファイルの上から4行を出力する" /></div>

<p>しかも、<code>head</code>コマンドはファイルパスまで表示してくれるので分かりやすいというメリットがあります。</p>

<h3>複数のファイル名、拡張子を一括で変更する</h3>

<p>複数のファイル名や拡張子を一括で変更できれば、その後の処理が楽です。特にJPEGファイルは<code>.jpg</code>と<code>.jpeg</code>の2通りが存在しており、大文字表記である<code>.JPG</code>まで含めると処理に手間取ります。</p>

<p>そこで、この場合はbashにパイプさせることでファイル名を変更する<code>mv</code>コマンドを実行させましょう。例えばカレントディレクトリ以下から再帰的に<code>.jpeg</code>のファイルを探し出し、<code>.jpg</code>に改名させる処理は以下のように書きます。</p>

<pre><code>find ./* -iname '*.jpeg' | sed -r -e 's/(.*)\.jpeg$/mv & \1.jpg/' | bash</code></pre>

<p>拡張正規表現を活用するために<code>-r</code>オプションを使用しました。このコマンドは<code>find</code>で拡張子が<code>.jpeg</code>のファイルパスをカレントディレクトリから再帰的に検索し、sedに出力結果を引き渡して<code>mv</code>コマンドが実行できるように置換します。</p>

<div class="img-center"><img src="/images/20181212015.jpg" alt="mvコマンドが実行できるように置換して出力" /></div>

<p><code>mv</code>コマンドが実行できるように置換した後、bashに出力結果を引き渡して実行させるのです。</p>

<div class="img-center"><img src="/images/20181212016.jpg" alt="mvコマンドが実行できるように置換して出力" /></div>

<p><code>ls</code>コマンドでも代用可能なように思えますが、<code>ls</code>コマンドの<code>-R</code>オプションで再帰的に出力されるファイル名にはパスまで書かれておらず、bashで処理をつなげることはできません。</p>

<p>更に<code>find</code>コマンドを使用するメリットは多彩な評価式にあります。対象とするファイルサイズやパーミッション、ファイルのタイプの指定など<code>ls</code>コマンドとは違って自由度が高いです。</p>

<p>ただしカレントディレクトリのファイルだけを対象としたいなら<code>ls</code>コマンドの方が簡単です。上記のコマンドでカレントディレクトリだけを対象とする場合は以下のように書き換えることができます。</p>

<pre><code>ls | sed -r 's/(.*)\.jpeg$/mv & \1.jpg/' | bash</code></pre>

<h2 id="chapter3">結論</h2>

<p>sedはたった一行だけでテキストの様々な処理を速やかに行うことが可能であり、他のコマンドと組み合わせて利用することで無限の可能性を秘めています。作業の効率化と短時間化を推進するためには、sedコマンドを必ず覚えて使いこなすことが先決です。</p>

<p>もちろんテキスト処理にはsedだけでなく<code>awk</code>や<code>xargs</code>、<code>tr</code>や<code>grep</code>系列など使えるコマンドがたくさんあります。正規表現もマスターすると、より高度な検索と置換を行うことができます。</p>

<p>テキストの処理が効率化できれば、プログラミングやウェブ開発だけでなく、文書やレポートの提出、ログの操作など文字列を取り扱う大半の作業が効率化されるでしょう。</p>

