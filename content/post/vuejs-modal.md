---
title: "Vue.jsでモーダルダイアログを作る"
date: 2021-01-18T14:36:28+09:00
draft: false
thumbnail: "images/vuejs.jpg"
categories: [ "web" ]
tags: [ "JavaScript","初心者向け","ウェブデザイン","vue.js" ]
---


jQueryであれば、モーダルダイアログを実装する時、対象の要素(DOM)を指定して、`.show()`と`.hide()`を行えば良いのでそれほど難しくはないが、vue.jsの場合はそうは行かない。

本記事ではvue.jsを使用したモーダルダイアログの実装方法をまとめる。

## ソースコード

今回はモーダルダイアログの範囲外をクリックしたら閉じるように仕立てた。

まず、HTML。開発版のvue.jsのCDNを指定している。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>vue.js超軽量モーダルダイアログ</title>
        <link rel="stylesheet" href="style.css">
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.js"></script>
        <script src="script.js"></script>
    <style>
    </style>
    
    </head>
    <body style="margin:0;">
    
        <!--vuejs適応範囲-->
        <main id="vuejs_area">
    
            <h1 style="color:white;background:orange;text-align:center;margin:0;">vue.js超軽量モーダルダイアログ</h1>
    
            <!--モーダル駆動部-->
            <div class="modal_button_area">
                <button @click="open_modal">開く</button>
            </div>
    
            <!--モーダルエリア-->
            <div class="modal" :class="{'modal_opened': isModalActive}" @click="close_modal" >
                <div class="modal_area">
                    <p>ここがモーダルの範囲内</p>
                    <button @click="close_modal_button">閉じる</button>
                </div>
            </div>
    
        </main>
    
    </body>
    </html>

続いて、CSSの`style.css`。モーダルの背景は半透明にして、背景であることをわかりやすくした。`opacity`を使用するとその影響は子要素にも及ぶので、`rgba()`を指定する事が重要である。

    .modal {
        display:none;
        position:fixed;
        top:0;
        left:0;
        height:100vh;
        width:100vw;
        background:rgba(100,100,100,0.5);
        z-index:99;
    }
    .modal_opened {
        display:block;
    }
    .modal_area {
        height:80vh;
        width:80vw;
        background:orange;
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }


続いて、問題のJS。vue.jsを使用している。直近の親要素を返す`.closest()`を使用して範囲外をクリックしたら閉じるように仕立てた。クリックした場所の直近の親要素が`.modal_area`すなわち、モーダルの本体である場合は何もしない。直近の親要素がモーダルの本体ではない場合(モーダルの背景の場合)モーダルを閉じる。

    window.addEventListener("load" , function (){ 
    
        //モーダルダイアログ
        new Vue({
            el: '#vuejs_area',
            data(){
                return {
                    isModalActive: false,
                }
            },
            methods: {
                open_modal() {
                    console.log("modal open !");
                    this.isModalActive = true;
                },
                close_modal(event) {
                    //TIPS:クリックした箇所の親要素として.modal_areaが存在する場合何もしない。.modal_areaが存在しない場合(モーダルダイアログの範囲外の場合)モーダルダイアログを消す。
                    if ( !(event.target.closest(".modal_area")) ){
                        console.log("CloseModal");
                        this.isModalActive = false;
                    }
                },
                close_modal_button(){
                    this.isModalActive  = false;
                }
            }
        }); 
    });
    

<div class="img-center"><img src="/images/Screenshot from 2021-01-18 14-56-48.png" alt="モーダルダイアログが表示された"></div>

## 結論

モーダルダイアログは一般的なウェブサイトだけでなく、ウェブアプリでもフォーム入力時に使用するので作れると何かと便利である。

vue.jsはGitHubでのスター数も多く、軽量ではあるものの、新興のライブラリのため情報が限られている点が惜しい。

