---
title: "HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】"
date: 2022-02-11T14:51:05+09:00
draft: false
thumbnail: "images/Screenshot from 2022-02-13 17-49-59.png"
categories: [ "フロントサイド" ]
tags: [ "html5","css3","fontawesome","ウェブデザイン" ]
---

以前、[サーバーサイドで1から5のいずれかの数値を受付、DBに保存する方法を実践した](/post/django-template-integer-for-loop/)が、フロント系ではそれをもう少しおしゃれに実装させたい。

そういう時は、なるべくJavaScriptを使用せず、HTMLとCSSだけで表現するのがベターなやり方だと個人的には思う。

だからこそ、今回も同様にHTMLとCSSだけでレビューの星を入力するフォームを再現した。

マウスをホバーした時、星が塗りつぶされ、外れると星が外枠だけになる。


## HTML5

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous">
    
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <input id="star_radio_1" type="radio" name="star" value="1">
        <input id="star_radio_2" type="radio" name="star" value="2">
        <input id="star_radio_3" type="radio" name="star" value="3">
        <input id="star_radio_4" type="radio" name="star" value="4">
        <input id="star_radio_5" type="radio" name="star" value="5">
    
        <label class="star_radio_label" for="star_radio_5"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
        <label class="star_radio_label" for="star_radio_4"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
        <label class="star_radio_label" for="star_radio_3"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
        <label class="star_radio_label" for="star_radio_2"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
        <label class="star_radio_label" for="star_radio_1"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
    
    </body>
    </html>


## CSS3


    i {
        font-size:3rem;
    }
    
    input[type="radio"]{
        display:none;
    }
    .star_radio_label{
        cursor:pointer;
    }
    .true_star {
        display:none;
        color:orange;
    }
    .false_star {
        color:gray;
    }
    
    
    /* ホバーをしたときの装飾 */
    label[for="star_radio_1"]:hover > .true_star{ display:inline-block; }
    label[for="star_radio_1"]:hover > .false_star{ display:none; }
    
    label[for="star_radio_2"]:hover > .true_star ,
    label[for="star_radio_2"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_2"]:hover > .false_star,
    label[for="star_radio_2"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_3"]:hover > .true_star ,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_3"]:hover > .false_star,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_4"]:hover > .true_star ,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_3"] > .true_star ,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_4"]:hover > .false_star,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_3"] > .false_star,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_5"]:hover > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_4"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_3"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_5"]:hover > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_4"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_3"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    
    /* チェックされたときの装飾 */
    #star_radio_1[type="radio"]:checked ~ label[for="star_radio_1"] > .true_star{ display:inline-block; }
    #star_radio_1[type="radio"]:checked ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    #star_radio_2[type="radio"]:checked ~ label[for="star_radio_2"] > .true_star ,
    #star_radio_2[type="radio"]:checked ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    #star_radio_2[type="radio"]:checked ~ label[for="star_radio_2"] > .false_star,
    #star_radio_2[type="radio"]:checked ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_3"] > .true_star ,
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_2"] > .true_star ,
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_3"] > .false_star,
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_2"] > .false_star,
    #star_radio_3[type="radio"]:checked ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_4"] > .true_star ,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_3"] > .true_star ,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_2"] > .true_star ,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_4"] > .false_star,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_3"] > .false_star,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_2"] > .false_star,
    #star_radio_4[type="radio"]:checked ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_5"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_4"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_3"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_2"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_5"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_4"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_3"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_2"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ label[for="star_radio_1"] > .false_star{ display:none; }


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-08 14-55-00.png" alt=""></div>


## 結論

見た目が逆順だと思う場合は、逆順に表示させる`display:flex`の`flex-direction:row-reverse;`を使えば良いだろう。

いずれにせよ、やはり単なる表示非表示をするだけであれば、HTMLとCSSで事は足りるという話である。


### 逆順にしてみた。

逆順にするだけでかなり構造が難しくなった。

CSSの`~`は以降の兄弟要素にしか使えないので、レビューのラベルは54321の順じゃないといけない。これがflex-direction:row-reverseの使用を強制させてしまう。

そして、`display:flex`はブロック要素に近い、`width:100%`になる。だから、フォームの配置は左にしてほしいのに、右側に行ってしまう。だから`inline-block`を親要素とした`div`タグの中に入れる必要がある。

その上で、チェックされたときの星の表示非表示のセレクタを書き換える。


#### HTML5

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous">
    
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <input id="star_radio_1" type="radio" name="star" value="1">
        <input id="star_radio_2" type="radio" name="star" value="2">
        <input id="star_radio_3" type="radio" name="star" value="3">
        <input id="star_radio_4" type="radio" name="star" value="4">
        <input id="star_radio_5" type="radio" name="star" value="5">
    
        <div class="star_radio_label_area">
            <div class="star_radio_label_flex">
                <label class="star_radio_label" for="star_radio_5"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
                <label class="star_radio_label" for="star_radio_4"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
                <label class="star_radio_label" for="star_radio_3"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
                <label class="star_radio_label" for="star_radio_2"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
                <label class="star_radio_label" for="star_radio_1"><div class="true_star" ><i class="fas fa-star"></i></div><div class="false_star"><i class="far fa-star"></i></div></label>
            </div>
        </div>
    
    </body>
    </html>


#### CSS3


    i {
        font-size:3rem;
    }
    
    input[type="radio"]{
        display:none;
    }
    .star_radio_label_area {
        display:inline-block;
    }
    .star_radio_label_flex {
        display:flex;
        flex-direction: row-reverse;
    }
    .star_radio_label{
        cursor:pointer;
    }
    .true_star {
        display:none;
        color:orange;
    }
    .false_star {
        color:gray;
    }
    
    
    /* ホバーをしたときの装飾 */
    label[for="star_radio_1"]:hover > .true_star{ display:inline-block; }
    label[for="star_radio_1"]:hover > .false_star{ display:none; }
    
    label[for="star_radio_2"]:hover > .true_star , 
    label[for="star_radio_2"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_2"]:hover > .false_star, 
    label[for="star_radio_2"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_3"]:hover > .true_star , 
    label[for="star_radio_3"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_3"]:hover > .false_star, 
    label[for="star_radio_3"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_3"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_4"]:hover > .true_star , 
    label[for="star_radio_4"]:hover ~ label[for="star_radio_3"] > .true_star ,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_4"]:hover > .false_star, 
    label[for="star_radio_4"]:hover ~ label[for="star_radio_3"] > .false_star,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_4"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    label[for="star_radio_5"]:hover > .true_star , 
    label[for="star_radio_5"]:hover ~ label[for="star_radio_4"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_3"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_2"] > .true_star ,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_1"] > .true_star { display:inline-block; }
    
    label[for="star_radio_5"]:hover > .false_star, 
    label[for="star_radio_5"]:hover ~ label[for="star_radio_4"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_3"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_2"] > .false_star,
    label[for="star_radio_5"]:hover ~ label[for="star_radio_1"] > .false_star{ display:none; }
    
    
    /* チェックされたときの装飾 */
    #star_radio_1[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .true_star{ display:inline-block; }
    #star_radio_1[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .false_star{ display:none; }
    
    #star_radio_2[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .true_star , 
    #star_radio_2[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .true_star { display:inline-block; }
                 
    #star_radio_2[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .false_star, 
    #star_radio_2[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .false_star{ display:none; }
                 
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .true_star , 
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .true_star ,
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .true_star { display:inline-block; }
                 
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .false_star, 
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .false_star,
    #star_radio_3[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .false_star{ display:none; }
                 
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_4"] > .true_star , 
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .true_star ,
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .true_star ,
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .true_star { display:inline-block; }
                 
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_4"] > .false_star, 
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .false_star,
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .false_star,
    #star_radio_4[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .false_star{ display:none; }
                 
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_5"] > .true_star , 
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_4"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .true_star ,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .true_star { display:inline-block; }
                 
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_5"] > .false_star, 
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_4"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_3"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_2"] > .false_star,
    #star_radio_5[type="radio"]:checked ~ .star_radio_label_area > .star_radio_label_flex > label[for="star_radio_1"] > .false_star{ display:none; }


#### 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-13 17-49-59.png" alt=""></div>

このひと工夫で左端が星1、右端が星5になる。

