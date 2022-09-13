---
title: "【JavaScript】動的に要素が変化した時に何か処理をさせたいならMutationObserverを使う"
date: 2022-09-11T21:23:32+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","フロントサイド" ]
---


例えば、特定の要素内のHTMLがJavaScriptの処理によって変わった時。

こんな時に何か処理を実行したい場合、MutationObserverを使うと良い。

## ソースコード


    //特定の要素が動的に変化した時、何らかの発動させる

    let body    = document.getElementsByTagName('body')[0];
    let target  = new MutationObserver(function(){ detail_sortable() }); 
    target.observe(body, { "childList":true,"subtree":true }); 


## 結論

例えば、Ajaxが発動して、ページがレンダリングされた時に何かを発動させることができる。(Ajaxのdoneの時に処理を書くという方法もあるが)


参照元: https://at.sachi-web.com/blog-entry-1516.html

