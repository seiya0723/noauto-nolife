---
title: "HUGOにシェルスクリプトとJavaScriptの記事検索機能を実装させる"
date: 2021-04-13T08:18:45+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","シェルスクリプト","hugo","静的サイトジェネレーター" ]
---


タイトルの通り。

静的サイトジェネレーターのHUGOはサーバーサイドのスクリプトが存在しない(全てフロント言語)。そのため、検索機能を実装させるとなると、検索対象と検索機能の全てをフロントに記述する必要がある。フロントで完結する検索機能に必要になるのが、JavaScript。

それから、検索対象である記事の文字列をJSが読み取れる形式でジェネレートしてあげる必要もある。その際にコマンド一発でジェネレートできるのがシェルスクリプト。

本記事では検索機能を実装させるための、シェルスクリプト及びJavaScriptのコードを解説する。


## 記事文字列をジェネレートするシェルスクリプト

    #! /bin/bash
    
    target="./content/post/*"
    generate="./static/data/search.js"
    
    
    #下書きではないものを選び、そのタイトル行を抜き取ってリダイレクト生成
    
    grep -l "draft: false" $target | xargs grep "^title:" > $generate
    
    #中央のタイトルを消してキーを指定。
    
    sed -i -e "s/.md:title:/\/\", \"title\" :/g" $generate
    
    #左端の./contentを消す
    
    sed -i -e "s/^.\/content//g" $generate
    
    #左端のオブジェクト化の波括弧、キー指定。
    
    sed -i -e "s/^/\{ \"link\": \"/g" $generate
    
    #右端の波括弧指定
    
    sed -i -e "s/\"$/\" \}, /g" $generate
    
    #冒頭に定数定義
    
    sed -i "1iconst SEARCH_LIST = [" $generate
    
    #末端に配列終端
    
    echo "];" >> $generate


これで`search.js`をジェネレートしてくれる。

まず、`grep`コマンドで、下書き中ではない、タイトルの行を表示させ、`search.js`にリダイレクト。

続いて`sed`コマンドを使って、正規表現でJavaScriptのオブジェクト型の形式に加工。出来上がったものが下記。

<div class="img-center"><img src="/images/Screenshot from 2021-04-13 09-02-50.png" alt="search.jsの中身"></div>

この定数を読み取り、検索させる。

【※2021年4月22日追記】

`grep`で`title:`を抜き取る時、行の初めを意味する`^`が抜けていたため、本記事のコードまで抜き取られ、結果生成されるJSが構文エラーになってしまう問題があったので、修正しました。これでも行初めに`title:`と書くと誤って抜き取られる問題があるため、後々さらに修正する予定。


## 検索を行うJavaScriptとHTML


以下、HTML

    <section>
        <div class="sidebar_panel_title">Search</div>
        <input id="search" class="ui10-text_square_dark" type="text" placeholder="ここにキーワードを入力する">
        <div id="search_result"></div>
    </section>


以下、JavaScript


    window.addEventListener("load" , function (){
    
        let search_elem  = document.querySelector("#search");
        search_elem.addEventListener("keydown", function(e){ if( e.keyCode === 13 ){ search(this.value); } });
    
    });
    
    function search(words){
        
        words   = words.replace(/　/g," ");
        let wl  = words.split(" ");
    
        let words_list  = wl.filter( w => w !== "" );
        let result_elem = document.querySelector("#search_result");
    
        if( words_list.length === 0 ){ 
            result_elem.innerHTML = "";
            return false;
        }
    
        let old_articles    = SEARCH_LIST;
    
        //AND検索するため、含んでいる記事をforループのたびに絞り込む
        for ( let w of words_list ){
    
            //ループするたびに新しく配列を作り直す。
            let new_articles    = [];
    
            //古い配列(初期はTEST_LIST)から次の文字列を含むかどうかチェックする。大文字小文字は区別しない。
            for (let r of old_articles){
                if ( r["title"].toLowerCase().indexOf(w.toLowerCase()) !== -1 ){
                    new_articles.push(r);
                }
            }
    
            //AND検索するために古い配列は代入される。
            old_articles    = new_articles;
        }
    
        
        //レンダリング
        let result  = "";
        for (let w of old_articles){
            result += '<li><a href="' + w['link'] + '">' + w["title"] + '</a></li>'
        }
    
        result_elem.innerHTML   = result;
    }


配列をひとつずつ取り出し、検索ボックスの文字列をindexOfで検索する。該当する記事のリストを作り、レンダリングさせる。

難点はHTMLがJavaScriptに直に記述されているため、HTMLが分散している点である。Vue.jsを使えばまとめられるが、今回は素のJavaScriptなのでこの形にした。

## 実際に動かしてみる

<div class="img-center"><img src="/images/Screenshot from 2021-04-13 09-29-57.png" alt=""></div>

これで検索機能が実装できた。リロードしたり、ページ移動すると検索結果が消えてしまうが、それは追加でJSの処理を記述すれば良いだろう。

## 結論

とりあえず突貫で作ったので、今回は記事タイトルのAND検索のみ。いずれは本文も含めた検索機能に昇華させる。

今回は.jsファイルにグローバル変数を定義し、それを読み込ませているが、グローバル変数の衝突を懸念するのであれば、.jsonファイルでも良いと思う。一応、再宣言不可能の定数である`const`を使って宣言した

