#! /bin/bash

# TODO:ここにターゲットのパスと、ジェネレートする先を記述

target="./content/post/*"
generate="./static/data/search.js"


#下書きではないものを選び、そのタイトル行を抜き取って、test.jsへリダイレクト生成

ls -1t $target | xargs grep -l "draft: false" | xargs grep -m1 "^title:" > $generate

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


#広告を挿入する(必ず"【広告】"を入れること)
echo '{ "link": "https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22", "title" : "【広告】モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）" },' >> $generate


#末端に配列終端
echo "];" >> $generate

