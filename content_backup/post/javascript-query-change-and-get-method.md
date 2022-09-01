---
title: "JavaScriptでクエリパラメータを書き換え、GETメソッドを送信する【通販サイトなどの絞り込み検索に有効】"
date: 2022-04-07T13:31:52+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "JavaScript","初心者向け" ]
---

クエリパラメータ(クエリ文字列、もしくはクエリストリング)はサーバーサイドだけのデータではない、JavaScriptも操作できる。

これを利用することで、サイトの絞り込み検索を作ることができる。

## HTML


下記のように価格帯の入力欄を作る。

    <h2>下限</h2>
    <input class="url_replace" type="text" name="min_price">
    
    <h2>上限</h2>
    <input class="url_replace" type="text" name="max_price">

そして、次項のJavaScriptを読んでおく。

## JavaScript

    window.addEventListener("load" , function (){
    
        $(".url_replace").on("keydown", function(e) { if( e.keyCode === 13 ){ url_replace_send(this); } });
    
    });
    function url_replace_send(elem){
    
        let key     = $(elem).prop("name");
        let value   = $(elem).val();
    
        //ここでクエリストリングを書き換える。
        param   = new URLSearchParams(window.location.search);
        param.set(key, value);
    
        //書き換えたクエリストリングへ移動する
        window.location.href = "?" + param.toString();
    }


## 結論

後はサーバーサイドでパラメータを参照し、絞り込みのORMやSQLを実行する。

これで複数の条件を考慮しての絞り込みができるようになる。

ちなみに、formタグでGETメソッドを送信すると、formタグ内のname属性のパラメータだけ残り、それ以外は除外される。そのため、価格帯のような自由な形式で入力する場合JavaScriptに頼らざるを得ない。


- https://maku77.github.io/js/web/search-params.html
- https://qiita.com/shuntaro_tamura/items/99adbe51132e0fb3c9e9


### 【補足】絞り込みがブーリアン型の場合はどうする？

例えば、チェックボックスに`name="test"`と指定されている場合、チェックされていれば、

    ?test=on

となり、チェックされていなければパラメーターごと無くなる。

これを考慮してコードを書けばよい。チェックの有無で処理がパラメーター追加か削除かで処理が変わるため、上記のコードを更に改良する必要がある。


