---
title: "【JavaScript】うるう年も考慮した年月日のselectタグを作る【検索時に】"
date: 2023-12-20T13:22:08+09:00
lastmod: 2023-12-20T13:22:08+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","tips","上級者向け" ]
---

前に作った、[jQueryの年月日検索](/post/jquery-ymd-search/)の作りがガバガバだったので、JavaScriptで作り直した。

## JavaScript

Reactのスプレッド構文も使用し、極力短く表現している。

```
window.addEventListener("load" , () => {


    // 日付入力欄の初期化。
    const now       = new Date();
    const range     = 10;
    const now_year  = now.getFullYear();
    const now_month = now.getMonth() + 1;
    const now_day   = now.getDate();

    const years     = document.querySelectorAll("[name='year']");
    const months    = document.querySelectorAll("[name='month']");
    const days      = document.querySelectorAll("[name='day']");

    const ini       =  '<option value="">--</option>';

    // スプレッド構文を使用して配列に直し、イベントをセットする。
    // 年月日 全ての要素にオプションを追加している。
    [...years].map( (elem) => {
        elem.innerHTML  = ini;

        for (let i=now_year-range;i<now_year+range;i++){
            if (i===now_year){
                elem.innerHTML += `<option value="${i}" selected>${i}年</option>`;
            }
            else{
                elem.innerHTML += `<option value="${i}">${i}年</option>`;
            }
        }

        elem.addEventListener("input", (e) => { day_change(e) });
    });

    [...months].map( (elem) => {
        elem.innerHTML  = ini;

        for (let i=1;i<13;i++){
            if (i===now_month){
                elem.innerHTML += `<option value="${i}" selected>${i}月</option>`;
            }
            else{
                elem.innerHTML += `<option value="${i}">${i}月</option>`;
            }
        }
        elem.addEventListener("input", (e) => { day_change(e) });
    });

    [...days].map( (elem) => {
        elem.innerHTML  = ini;

        for (let i=1;i<32;i++){
            if (i===now_day){
                elem.innerHTML += `<option value="${i}" selected>${i}日</option>`;
            }
            else{
                elem.innerHTML += `<option value="${i}">${i}日</option>`;
            }
        }

        //elem.addEventListener("input", (e) => { day_change(e) });
    });

});

// 日付の変更時の対応
const day_change = (e) => {

    // 各月の日数
    const day_list      = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    const year_elem     = e.currentTarget.parentNode.querySelector("[name='year']");
    const month_elem    = e.currentTarget.parentNode.querySelector("[name='month']");
    const day_elem      = e.currentTarget.parentNode.querySelector("[name='day']");

    const selected_day  = Number(day_elem.value);

    const year          = year_elem.value;
    const month         = month_elem.value;

    //うるう年かどうか判定。2月を29日に変更
    if ( year%4 == 0 ){ day_list[1] = 29; }

    //dayを初期化
    day_elem.innerHTML  = '<option value="">--</option>';

    // できれば、すでに選択されている日付でselectedする。
    for (let i=1;i<=day_list[month-1];i++){
        if (i===selected_day){
            day_elem.innerHTML += `<option value="${i}" selected>${i}日</option>`;
        }
        else{
            day_elem.innerHTML += `<option value="${i}">${i}日</option>`;
        }
    }
}
```

## HTML

name属性を指定したselectタグさえあればOK


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
</head>
<body>

    <div>
        <select name="year" ></select>
        <select name="month"></select>
        <select name="day"  ></select>
    </div>

	<script src="script.js"></script>
</body>
</html>
```

とってもシンプル。

## 結論

まだまだ非効率な気もするが、とりあえず前のjQueryのコードよりは快適に動作できるだろう。

jQueryを使用しない点、idではなくname属性を使用している点も良い。


