---
title: "vimプラグインのemmetとsurroundのインストール方法と使い方【NeoBundleは不要】"
date: 2019-01-11T19:19:12+09:00
draft: true
thumbnail: "images/vim.jpg"
categories: [ "others" ]
tags: [ "vim", "作業効率化" ]
---


<p>vimを使用して本格的にHTMLのコーディングをしたいと思ったので、有名なemmet.vimとsurround.vimをインストールすることにしました。忘れてはいけないので備忘録として使い方や活用例なども含めて書き残します。</p>

<p>巷では、プラグイン管理ツールであるNeoBundleをインストールする必要があると言われていますが、無くても問題なくできました。むしろ<b>NeoBundleはすでに開発が止まっていて、公式からも使用は非推奨であると言われているようです。</b>今回はNeoBundleは無しでプラグインを実装させます。</p>

<ul>
	<li><a href="#chapter1">emmet.vimの概要とインストール方法</a></li>
	<li><a href="#chapter2">emmet.vimの使い方</a></li>
	<li><a href="#chapter3">emmet.vimの活用例</a></li>
	<li><a href="#chapter4">surround.vimの概要とインストール方法</a></li>
	<li><a href="#chapter5">surround.vimの使い方</a></li>
	<li><a href="#chapter6">surround.vimの活用例</a></li>
	<li><a href="#chapter7">結論</a></li>
	<li><a href="#chapter8">関連記事</a></li>
</ul>

<h2 id="chapter1">emmet.vimの概要とインストール方法</h2>

<h3>emmet.vimの概要</h3>

<p>emmet.vimは挿入モードで文字列を入力してショートカットキーを押すことでHTMLを自動的に組み立てる機能を持つプラグインです。例えば挿入モードで以下のように入力します。</p>

<pre><code>p</code></pre>

<p>このpを入力した状態で&lt;c-y&gt;,を押すとこうなります（Ctrlキーを押しながらyを押して,を押す）。すぐに押さないと待ち時間が切れてしまうのですぐに押しましょう。待ち時間はおよそ1秒から2秒ほどです。</p>

<pre><code>&lt;p&gt;&lt;/p&gt;</code></pre>

<p>他にも<code>span</code>や<code>code</code>など代表的なタグが使用できるようになっています。他にも以下のような使い方もできます。</p>

<pre><code>ul&gt;li*4（ここで&lt;c-y&gt;,を押す）
&lt;ul&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
&lt;/ul&gt;
</code></pre>

<p><code>ul&gt;li*4</code>は<code>ul</code>タグの配下に<code>li</code>タグを4個挿入させます。このように&gt;などを使用することで柔軟なコーディングにも対応可能です。</p>

<h3>emmet.vimのインストール方法</h3>

<p>emmet.vimは【外部リンク】<a href="https://github.com/mattn/emmet-vim">https://github.com/mattn/emmet-vim</a>からダウンロードが可能です。リンクからダウンロードしたzipファイルは<code>~/.vim/</code>にコピーして展開します。</p>

<pre><code>cp ~/Download/emmet-vim-master.zip ~/.vim/
cd ~/.vim/
unzip ~/emmet-vim.master.zip</code></pre>

<p>これでインストールは完了です。最初からNeoBundleは不要だったのです。<code>~/.vim</code>ディレクトリが存在しない場合は<code>mkdir</code>で作ってください。</p>

<h2 id="chapter2">emmet.vimの使い方</h2>

<p>emmet.vimの使い方を下記に列挙します。</p>

<h3>タグの配下にタグを設置する</h3>

<p>タグの配下にタグを設置する場合は&gt;を使います。</p>

<pre><code>実行前のコード
ol&gt;li
実行後のコード
&lt;ol&gt;
    &lt;li&gt;&lt;/li&gt;
&lt;/ol&gt;</code></pre>

<h3>タグを指定した回数だけ作る</h3>

<p>タグを指定した回数だけ作るには*を使用して数値を指定します。</p>

<pre><code>実行前のコード
ol&gt;li*5
実行後のコード
&lt;ol&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
	&lt;li&gt;&lt;/li&gt;
&lt;/ol&gt;</code></pre>

<h3>タグの次に別のタグを作る</h3>

<p>タグの次にタグを作るには+を使用します。</p>

<pre><code>実行前のコード
h2+div
実行後のコード
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;</code></pre>

<h3>タグをグループ化させる</h3>

<p>タグを()でグループ化させることによって*で指定した回数の繰り返し処理を正常にまとめることができます。</p>

<pre><code>実行前のコード
(h2+div)*5
実行後のコード
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;
&lt;h2&gt;&lt;/h2&gt;
&lt;div&gt;&lt;/div&gt;</code></pre>

<h3>タグにクラスやIDを指定する</h3>

<p>IDを指定するときには#を、クラスを指定する際には.を入力しましょう。</p>

<pre><code>実行前のコード
h2#chapter1+div.sample
実行後のコード
&lt;h2 id=&quot;chapter1&quot;&gt;&lt;/h2&gt;
&lt;div class=&quot;sample&quot;&gt;&lt;/div&gt;</code></pre>

<h3>クラス名やID名をナンバリングさせる</h3>

<p>$と*を使用すれば簡単にナンバリングができます。</p>

<pre><code>実行前のコード
ol&gt;li.sample$*5
実行後のコード
&lt;ol&gt;
	&lt;li class=&quot;sample1&quot;&gt;&lt;/li&gt;
	&lt;li class=&quot;sample2&quot;&gt;&lt;/li&gt;
	&lt;li class=&quot;sample3&quot;&gt;&lt;/li&gt;
	&lt;li class=&quot;sample4&quot;&gt;&lt;/li&gt;
	&lt;li class=&quot;sample5&quot;&gt;&lt;/li&gt;
&lt;/ol&gt;
</code></pre>

<h3>タグの中にテキストを挿入する</h3>

<p>タグの中にテキストを挿入する場合は{}を使用します。</p>

<pre><code>実行前のコード
a{これがリンクです}
実行後のコード
&lt;a href=&quot;&quot;&gt;これがリンクです&lt;/a&gt;</code></pre>

<h3>タグの中にデータを挿入する</h3>

<p>aタグやimgタグを使用するときに中のデータを挿入しておきたい場合は[]を使用します。</p>

<pre><code>実行前のコード
a[href=http://example.com/]{example.com}
実行後のコード
&lt;a href=&quot;http://example.com/&quot;&gt;example.com&lt;/a&gt;</code></pre>

<h2 id="chapter3">emmet.vimの活用例</h2>

<p>以上の使い方を踏まえて、具体的な活用例を紹介します。</p>

<h3>目次を作る</h3>

<pre><code>ul&gt;(li&gt;a[href=&quot;#chapter$&quot;])*5
</code></pre>

<p>*は指定されたタグを繰り返して書き込む機能があり、それがグループ化されたliタグに反映されているので以下のようになります。liタグの個数を増やしたい場合は行末の5を任意の数字に変更してください。</p>

<pre><code>&lt;ul&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter1&quot;&gt;&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter2&quot;&gt;&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter3&quot;&gt;&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter4&quot;&gt;&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter5&quot;&gt;&lt;/a&gt;&lt;/li&gt;
&lt;/ul&gt;
</code></pre>

<p>このように$でナンバリングも可能です。予め作っておいた見出しを矩形選択でヤンクしてペーストすれば、一瞬でこんなふうになります。</p>

<pre><code>&lt;ul&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter1&quot;&gt;見出し1&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter2&quot;&gt;見出し2&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter3&quot;&gt;見出し3&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter4&quot;&gt;見出し4&lt;/a&gt;&lt;/li&gt;
	&lt;li&gt;&lt;a href=&quot;#chapter5&quot;&gt;見出し5&lt;/a&gt;&lt;/li&gt;
&lt;/ul&gt;
</code></pre>

<p>手順は予め作っておいた見出しを矩形選択して$を押してヤンク、先の展開したコードの先頭のaタグのテキスト部分にpキーを押してペーストさせるだけです。</p>

<h3>h2見出しを作る</h3>

<p>h2見出しを作る際にも先程と同じように*を使用して繰り返しタグを表示させます。</p>

<pre><code>h2#chapter$*5
</code></pre>

<pre><code>&lt;h2 id=&quot;chapter1&quot;&gt;&lt;/h2&gt;
&lt;h2 id=&quot;chapter2&quot;&gt;&lt;/h2&gt;
&lt;h2 id=&quot;chapter3&quot;&gt;&lt;/h2&gt;
&lt;h2 id=&quot;chapter4&quot;&gt;&lt;/h2&gt;
&lt;h2 id=&quot;chapter5&quot;&gt;&lt;/h2&gt;
</code></pre>

<p>こちらも先程と同様に見出しの矩形選択によって一気に作れます。</p>

<pre><code>&lt;h2 id=&quot;chapter1&quot;&gt;見出し1&lt;/h2&gt;
&lt;h2 id=&quot;chapter2&quot;&gt;見出し2&lt;/h2&gt;
&lt;h2 id=&quot;chapter3&quot;&gt;見出し3&lt;/h2&gt;
&lt;h2 id=&quot;chapter4&quot;&gt;見出し4&lt;/h2&gt;
&lt;h2 id=&quot;chapter5&quot;&gt;見出し5&lt;/h2&gt;
</code></pre>

<h3>テーブルタグで表を作る</h3>

<p>theadとtbodyで分けてテーブルを作る場合は以下のようにしましょう。</p>

<pre><code>table&gt;(thead&gt;tr&gt;th+th)(tbody&gt;(tr&gt;th+th)*3)</code></pre>

<p>tbodyのtrタグを増やしたい場合は*の数値を適当に変更してください。展開すると以下のようになります。</p>

<pre><code>&lt;table&gt;
    &lt;thead&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;/th&gt;
            &lt;th&gt;&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;/th&gt;
            &lt;th&gt;&lt;/th&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;/th&gt;
            &lt;th&gt;&lt;/th&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;/th&gt;
            &lt;th&gt;&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
&lt;/table&gt;</code></pre>

<p>入力するヘッダの文字列が決まっているのであれば{}を使用して入力しておけば簡単です。</p>

<pre><code>table&gt;(thead&gt;tr&gt;th{コマンド}+th{効果})(tbody&gt;(tr&gt;th+th))</code></pre>

<pre><code>&lt;table&gt;
    &lt;thead&gt;
        &lt;tr&gt;
            &lt;th&gt;コマンド&lt;/th&gt;
            &lt;th&gt;効果&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;/th&gt;
            &lt;th&gt;&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
&lt;/table&gt;</code></pre>


<h3>内部リンクを挿入する</h3>

<p>内部リンクの貼付けはpタグとaタグを使います。</p>

<pre><code>p{【内部リンク】}&gt;a[href=/post/xxxx/]{記事タイトル}</code></pre>

<pre><code>&lt;p&gt;【内部リンク】&lt;a href=&quot;/post/xxxx/&quot;&gt;記事タイトル&lt;/a&gt;&lt;/p&gt;</code></pre>

<p>[]と{}を使用してaタグの中の値とタグで囲む文字列を指定します。</p>

<h3>emmet.vimを効率的に使うためには</h3>

<p>これらの長い文字列を使うたびに、一から入力していると時間がかかってしまいます。だから雛形によく使うコードを予め入力しておくことをおすすめします。</p>

<p>例えば、HUGOを利用している方は<code>default.md</code>に以下の内容をまとめて記入しておけば記事の編集が容易です。</p>

<pre><code>&lt;!-- Emmet用の雛形
##目次を表示させる##
ul&gt;(li&gt;a[href=&quot;#chapter$&quot;])*10
##見出しを表示させる##
h2#chapter$*10
##内部リンクを表示させる##
p{【内部リンク】}&gt;a[href=/post/2019xxxx/]{記事タイトル}
##画像を貼る##
p&gt;img[src=/images/2019xxxxxxx.jpg alt=test]
##テーブルを作る##
table&gt;(thead&gt;tr&gt;th+th)(tbody&gt;(tr&gt;th+th))
--&gt;
</code></pre>

<p>起動時にこれらのコメントが表示されるので、編集の際にコードをヤンクしてペーストした後、emmetのショートカットキーを押して展開しましょう。このコードの行番号を覚えておけば一瞬でヤンクすることも可能です。</p>

<h2 id="chapter4">surround.vimの概要とインストール方法</h2>

<h3>surround.vimの概要</h3>

<p>surround.vimはビジュアルモードで指定した文字列を指定したタグで囲むことができます。例えば以下のようにpタグで囲みたい文字列があるとします。</p>

<pre><code>ここをpタグで囲む</code></pre>

<p>ビジュアルモードで選択した後、Sを押してsurround.vimを呼び出し、&lt;p&gt;を入力するとこのようになります。</p>

<pre><code>&lt;p&gt;ここをpタグで囲む&lt;/p&gt;</code></pre>

<p>emmet.vimとは違って、囲むことができるタグは一つしか指定できない点に注意しましょう。ビジュアルモードで一行を選択するときは<code>BvE</code>と入力することで、改行させずに一行まるごと選択してタグで囲むことができます。</p>

<h3>surround.vimのインストール方法</h3>

<p>surround.vimのインストール方法もemmet.vimと同様で、~/.vim/ディレクトリにダウンロードしたzipファイルを展開すれば良いだけです。surround.vimは【外部リンク】<a href="https://www.vim.org/scripts/script.php?script_id=1697">https://www.vim.org/scripts/script.php?script_id=1697</a>から最新版の<code>surround.zip</code>をダウンロードします。</p>

<p>そして以下のコマンドを実行して展開させます。</p>

<pre><code>cp ~/Download/surround.zip ~/.vim/
cd ~/.vim/
unzip ~/surround.zip</code></pre>

<p>これだけです。surround.vimにもNeoBundleは不要です。</p>

<h2 id="chapter5">surround.vimの使い方</h2>

<p>先の項目で説明したとおり、surround.vimはビジュアルモードで範囲を選択した後、Sを押して任意のタグ名を入力するだけで自動的に補完して文字列を囲んでくれます。</p>

<p>もちろん、タグだけでなく&quot;や&#039;などでも囲むことはできます。</p>

<h3>任意の文字またはタグで囲む</h3>

<p>ビジュアルモードを使用して任意の文字やタグで囲むには先ほど説明したとおり、vキーを押して範囲を選択した後、Sを押して文字やタグを入力するだけです。</p>

<p>例として、文字列が<code>Hello vim world</code>でHからdまで選択した状態から以下のコマンドを実行した結果をまとめます。</p>

<table>
	<thead>
		<tr>
			<th>コマンド</th>
			<th>実行結果</th>
			<th>覚え方</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>S[</th>
			<th>[ Hello vim world ]</th>
			<th>Surround [ (訳:[で囲む）</th>
		</tr>
		<tr>
			<th>S]</th>
			<th>[Hello vim world]</th>
			<th>Surround ] (訳:]で囲む）</th>
		</tr>
		<tr>
			<th>S@</th>
			<th>@Hello vim world@</th>
			<th>Surround @ （訳:@で囲む）</th>
		</tr>
		<tr>
			<th>S&lt;p&gt;</th>
			<th>&lt;p&gt;Hello vim world&lt;/p&gt;</th>
			<th>Surround &lt;p&gt; （訳:pタグで囲む）</th>
		</tr>
		<tr>
			<th>S(</th>
			<th>( Hello vim world )</th>
			<th>Surround ( （訳:(で囲む）</th>
		</tr>
		<tr>
			<th>S)</th>
			<th>(Hello vim world)</th>
			<th>Surround ) （訳:(で囲む）</th>
		</tr>
	</tbody>
</table>

<p>普通の括弧の記号でくくると、文字列の前後に空白がひとつできてしまいます。これを避けるためには逆側の括弧を指定すれば良いのです。</p>

<h3>文字列を囲んでいる要素を除去する</h3>

<p>文字列を囲んでいる要素を除去する場合は、タグを除去する場合と普通の記号を除去する場合によってコマンドが異なります。</p>

<p>文字列が<code>@Hello vim world@</code>の場合に<code>ds@</code>コマンドを実行すると<code>Hello vim World</code>になります。<code>ds@</code>コマンドは[delete surround @]と覚えましょう。</p>

<p>一方でタグで囲まれた部分の除去は簡単で<code>dst</code>コマンドを実行するだけです。[delete surround tag]と覚えましょう。</p>

<table>
	<thead>
		<tr>
			<th>コマンド</th>
			<th>実行結果</th>
			<th>覚え方</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>ds@</th>
			<th>Hello vim world</th>
			<th>delete surround @ (訳:囲んでいる@を削除する）</th>
		</tr>
		<tr>
			<th>ds[</th>
			<th>Hello vim world</th>
			<th>delete surround [ (訳:囲んでいる[を削除する）</th>
		</tr>
		<tr>
			<th>dst</th>
			<th>Hello vim world</th>
			<th>delete surround tag （訳:囲んでいるタグを削除する）</th>
		</tr>
	</tbody>
</table>

<h3>文字列を囲んでいる要素を変更する</h3>

<p>文字列を囲んでいる要素を変更したい場合は<code>cs</code>コマンドを使用します。</p>

<p>例えば<code>@Hello vim world@</code>を<code>[Hello vim world]</code>に変更したい場合は<code>cs@]</code>と入力すればいいのです。</p>

<p>一方でタグをで囲まれている文字列を別のタグに変更したい場合は<code>cst&lt;div&gt;</code>と入力しましょう。</p>

<table>
	<thead>
		<tr>
			<th>コマンド</th>
			<th>実行結果</th>
			<th>覚え方</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>cs@]</th>
			<th>[Hello vim world]</th>
			<th>change surround @ to ] (訳:囲んでいる文字を@から]に変更する）</th>
		</tr>
		<tr>
			<th>cs@$</th>
			<th>$Hello vim world$</th>
			<th>change surround @ to $ (訳:囲んでいる文字を@から$に変更する）</th>
		</tr>
		<tr>
			<th>cst&lt;div&gt;</th>
			<th>&lt;div&gt;Hello vim world&lt;/div&gt;</th>
			<th>change surround tag to &lt;div&gt; （訳:囲んでいるタグをdivタグに変更する）</th>
		</tr>
	</tbody>
</table>

<h3>ビジュアルモードを使用せずに任意の文字で囲む</h3>

<p>ビジュアルモードを使用しなくても任意の文字で囲むことができます。<code>ys</code>コマンドを使いましょう。[you surround]と覚えます。</p>

<p>1単語を@で囲みたいのであれば<code>ysaw@</code>コマンドを使用します。[you surround a word @]と覚えます。文字列一行を@で囲みたい場合はyss@と入力します。</p>

<table>
	<thead>
		<tr>
			<th>コマンド</th>
			<th>実行結果</th>
			<th>覚え方</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>ysaw@</th>
			<th>@Hello@ vim world</th>
			<th>you surround a word @ (訳:一単語を@で囲む）</th>
		</tr>
		<tr>
			<th>yss@</th>
			<th>@Hello vim world@</th>
			<th>you surround sentence @ (訳:一文を@で囲む）</th>
		</tr>
		<tr>
			<th>yss&lt;div&gt;</th>
			<th>&lt;div&gt;Hello vim world&lt;/div&gt;</th>
			<th>you surround sentence &lt;div&gt; （訳:一文をdivタグで囲む）</th>
		</tr>
	</tbody>
</table>

<h2 id="chapter6">surround.vimの活用例</h2>

<p>surround.vimの活用例は上記の使い方をマスターしていれば十分でしょう。emmet.vimでタグを作り忘れたときに、文字列をタグで囲んだりできるので便利です。</p>

<p>HTMLのコーディングには<code>yss</code>コマンドを使用した一文のタグ囲みとビジュアルモードで選択してからのSコマンドを頻繁に使用するので、それだけ覚えていれば特に問題はありません。</p>

<h2 id="chapter7">結論</h2>

<p>結論を言うと、<b>emmet.vimとsurround.vimのインストールにはNeoBundleは不要</b>です。vimのプラグイン管理ツールであるNeoBundleは開発が止まっているので、インストールすると何らかの不具合が発生してしまうことを考慮しておきましょう。</p>

<p>基本的にはプラグインのzipを<code>~/.vim/</code>に展開すればいいだけなので簡単です。後は使い方を覚えるまでチートシートを紙に印刷してそのへんに貼り付けておきましょう。</p>

<h2 id="chapter8">関連記事</h2>

<h3>vimの操作方法について</h3>

<p>【内部リンク】<a href="/post/20181001/">Small版vimの基本的な操作方法について</a></p>

<p>プラグインを使ったとしても、基本的な操作方法をマスターしていないと、GUIのテキストエディタにも劣ります。操作方法の習得が不十分の場合は復習しておきましょう。</p>

