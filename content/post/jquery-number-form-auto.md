---
title: "【jQuery】数値入力フォームを押しっぱなしで入力する仕様に仕立てる"
date: 2022-05-03T11:25:12+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "フロントサイド" ]
tags: [ "jQuery","ウェブデザイン" ]
---

以前、『[【jQuery】数値入力フォームをボタンで入力する仕様に仕立てる](/post/jquery-number-form/)』で解説したフォームを、ボタン押しっぱなしでも入力できるように仕立てる。

## HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
    	<script src="script.js"></script>
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <form action="">
            <div class="spinner_area">
                <input class="spinner" type="number" value="0" max="10" min="0">
                <button class="spinner_button" type="button" name="minus" value="-1">ー</button>
                <button class="spinner_button" type="button" name="plus"  value="1" >＋</button>
            </div>
        </form>
    
    
    </body>
    </html>
    


## CSS


    .spinner_button{
        user-select: none;
        cursor:pointer;
    
        padding:0.5rem;
        width: auto;
        vertical-align: middle;
    
    }
    .spinner_area input{
        padding: 0.5rem;
        border: 0.1rem solid gray;
        border-radius: 0.25rem;
        font-size: 1.2rem;
    
        width: auto;
        vertical-align: middle;
    
        /* デフォルトのスピナーを消す */
        -webkit-appearance: none;
        -moz-appearance:textfield;
    }


## JS


    window.addEventListener("load" , function (){
    
        //グローバル変数(コントロール、スピード(低いほど速い))
        SPINNER_CTRL    = [];
        SPIN_SPEED      = 20;
    
        //長押し押下時(クリック対象のイベントオブジェクトと、クリックされた要素そのものを引数として実行)
        $('.spinner_button').on('touchstart mousedown click', function(e){ click_down(e,this); }); 
        
        //長押し解除時 画面スクロールも解除に含む
        $(document).on('touchend mouseup scroll', function(){ click_up(); }); 
    
    });
    
    
    //マウス押下時
    function click_down(e,elem){
    
        if(SPINNER_CTRL['interval']){
            return false;
        }
    
        //inputタグの要素を指定
        SPINNER_CTRL['target']      = $(elem).parent(".spinner_area").children(".spinner");
    
        //現在時刻を指定。
        SPINNER_CTRL['timestamp']   = e.timeStamp;
    
        //増分値を指定
        SPINNER_CTRL['cal']         = Number($(elem).val());
    
    
        //クリックは単一の処理に留める
        if(e.type == 'click'){
            spinner_calc();
            SPINNER_CTRL = []; 
            return false;
        };
    
        //長押し時の処理(500ミリ秒押下で発火)
        setTimeout(function(){
    
            //インターバルが無く、かつマウス押下時のタイムがイベント発火時と同じ場合、指定時間おきに変動計算関数を実行する。
            if(!SPINNER_CTRL['interval'] && SPINNER_CTRL['timestamp'] == e.timeStamp){
                SPINNER_CTRL['interval'] = setInterval(spinner_calc, SPIN_SPEED);
            }
        }, 500);
    
    }
    
    //マウス離上時の処理
    function click_up(){
        
        //離上時に、インターバルの指定がされていれば、それを無効化させる。clearInterval関数を発動する。
        if(SPINNER_CTRL['interval']){
            clearInterval(SPINNER_CTRL['interval']);
            SPINNER_CTRL = []; 
        }
    }
    
    //変動計算関数
    function spinner_calc(){
    
        let target  = SPINNER_CTRL['target'];
        let num     = Number(target.val()) + SPINNER_CTRL['cal'];
        
        //上限と下限に触れていないかチェック
        if(num > Number(target.prop('max'))){
            target.val(Number(target.prop('max')));
        }
        else if(Number(target.prop('min')) > num){
            target.val(Number(target.prop('min')));
        }
        else{
            target.val(num);
        }
    }
    

つまり、クリックされた時(押下された時)、何度も加減算処理をするインターバルをグローバル変数にセットする。

もし、クリックしっぱなし(離上していない状態)であれば、そのインターバルは保持され続け、その処理を発動し続ける。

離上した場合、インターバルはクリアされ、グローバル変数の`SPINNER_CTRL`も初期化される。

ただし、この加減算の処理はinputタグのmax属性、min属性の値によって上限と下限が決まっている。

このようにJSを解体して読み解くと全体像が把握できてわかりやすい。とてもシンプルな構造であることがわかる。


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-05-03 16-44-24.png" alt=""></div>

## 結論

これで、数値入力の操作は大幅にしやすくなったであろう。`setTimeout`を使ったり、`setInterval`をクリアするなどは想像もつかなかったので、いい勉強になったと思う。

参照元: https://kinocolog.com/spinner_btn/

いくらか私の書き方ではない書き方をしているので、大幅に書き換えて修正した。


