---
title: "JavaScript(jQuery)でQRコードを表示させる"
date: 2022-05-23T11:23:01+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "jQuery","JavaScript","tips" ]
---

例えば、ユーザーの一部がPCでの操作をやめて、スマホで操作したいと思ったとする。

こういう時QRコードを表示させる、ブラウザのアドオンや機能を使えば良いが、ユーザーにそれを強いるのはやや酷である。

そこで、jQueryを使用して、QRコードを簡単に表示させると良いだろう。

## コード

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
    
        <script>
        window.addEventListener("load" , function (){

            let qrtext      = location.href;
            let utf8qrtext  = unescape(encodeURIComponent(qrtext));
            $("#qrcode").html("");
            $("#qrcode").qrcode({width:160,height:160,text:utf8qrtext});

        });
        </script>
    </head>
    <body>
    
        <div id="qrcode"></div>
    
    </body>
    </html>


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-05-23 11-43-37.png" alt=""></div>



## 結論

下記を参照。

https://github.com/jeromeetienne/jquery-qrcode

