---
title: "【jQuery】数値入力フォームをボタンで入力する仕様に仕立てる"
date: 2022-03-02T11:45:18+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "jquery","ウェブデザイン","tips" ]
---

数値入力フォーム。キーボードを使わず、ボタン入力で行いたい場合、JavaScriptを使う必要がある。

今回は更に短くかけるよう、jQueryで表現した。なお、再利用を想定して、装飾は全く行っていない。

## ソースコード

### HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="script.js"></script>
    </head>
    <body>
    
        <form action="">
            <input type="number" name="amount" value="0" readonly>
            <input type="button" name="minus" value="減らす">
            <input type="button" name="plus"  value="増やす">
        </form>
        
    </body>
    </html>

### JavaScript

    window.addEventListener("load" , function (){ 
    
        $("[name='plus']").on("click",  function(){ amount_add(this,true);  }); 
        $("[name='minus']").on("click", function(){ amount_add(this,false); }); 
    
    });
    
    function amount_add(elem,flag) {
            
        let target  = $(elem).parent("form").children("[name='amount']");
        let amount  = Number(target.val());
    
        if (flag){ target.val( amount + 1 ); }
        else{ target.val( amount - 1 ); }
    
    }


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-03-02 11-50-17.png" alt=""></div>

ボタンを押すと加算、減算できる。



