---
title: "【Vim】ReactでHTMLをコーディングするときだけ改行でインデントしてほしい"
date: 2024-01-21T15:32:31+09:00
lastmod: 2024-01-21T15:32:31+09:00
draft: false
thumbnail: "images/vim.jpg"
categories: [ "others" ]
tags: [ "vim","react","開発効率化","追記予定" ]
---

ReactをVimでコーディングしているとき、不自由だと感じることが多々ある。

その1つが、.jsxファイルのHTML部をコーディングしているとき、改行でインデントしてくれないこと。

例えば、下記のコードのHTMLで改行をしても、HTML形式でインデントをしてくれない。

```
    return (
        <>

        <textarea id="textarea" className="form-control"></textarea>
        <input onClick={ addTopic } type="button" value="送信" />

        {topics.map( (topic,i) => (

        <div className="border" key={i}>
            <div>
                { topic }
            </div>
            <div className="text-right">
                <input onClick={ deleteTopic } className="btn btn-danger" type="button" value="削除" />
            </div>
        </div>

        ))}
        </>
    );
```

## ファイルタイプを一旦HTMLに直し、オートインデント。


まず、.jsxファイルはvimでは、ファイルタイプが`javascriptreact`とされているので、これを一旦htmlに直す。


```
set ft=html
```

続いて、HTMLの箇所にカーソルを合わせ、

```
=G
```

を実行する。(ファイルの最後の行までオートインデント)

そして、ファイルタイプを`javascriptreact`に戻す。

```
set ft=javascriptreact
```

とはいえ、HTML部のコーディング時に改行したとき、インデントしてくれるわけではない。一旦HTMLをコーディングし、その上で↑の作業をするのは、ちょっとHTMLコーディングが苦痛だ。

## 最初から.jsxファイルをhtmlとして開く。

というより、JavaScriptのインデントはファイルタイプhtmlでも発動しているから、最初からjsxをファイルタイプhtmlで起動すれば良いのでは？

ということで、vimrcにて、以下を追加した。


```
" .jsx ファイルをファイルタイプ html として開く
autocmd BufNewFile,BufRead *.jsx set filetype=html
```

これにより、JavaScriptのシンタックスカラーが発動しなくなり、アロー関数の `=>`の部分でシンタックスの警告が出る。

だが、インデントが発動しないほうが不便なので、ここは妥協することにした。


ファイルタイプを独自に作り、シンタックスカラーはJavaScript、インデントはHTMLなど独自に作ることができれば良いのだが、それは、また次の機会に。


## 結論

そもそもReactの『JavaScriptのファイルの中にHTMLを含める』という、コンセプトが受け入れがたいなとつくづく思う。

このコンセプトさえなければ、スムーズに開発できるのにといつも思う。

この.jsxファイルのHTMLを、別の拡張子(.jsxmlなど)を作って書き、.jsxが読み込みしてくれると助かるのだが。


## VScodeを使えば即解決

全てのVim愛好家に宣戦布告するようだが、この問題、VScodeを使うことで即解決できる。

JavaScriptとHTMLのシンタックスはいずれも正常に機能しており、HTML部の改行インデントも正確に機能している。

だから、Reactの開発時だけ、VScodeを使うというのも手かもしれない。Reactプロジェクトの場所でターミナルから、

```
code .
```

とするだけである。

## 参照

同じようなことで悩んでいる人は多いようだ。検索したらすぐに出たので、記録しておく。

プラグインを利用する方法を推奨していたが、すでに開発終了していたようなので諦めた。

https://stackoverflow.com/questions/35101644/vim-indent-html-code-inside-javascript-file

ちなみに、ChatGPTに質問しても明確な回答は得られなかった。vimの設定関係に関しては、ChatGPTに質問せず、検索したほうが良いのかもしれない。

