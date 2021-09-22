---
title: "Djangoで動画投稿時にサムネイルもセットでアップロードする【DRF+Ajax(jQuery)】"
date: 2021-03-01T15:03:31+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","JavaScript","上級者向け","ajax","restful","Canvas","Blob" ]
---

Djangoで動画をアップロードする時、ffmpegなどを使ってサムネイルの自動生成を行うが、クライアントが自分で動画のサムネイルを指定したいときはこの限りではない。

サムネイルに指定したい画像は動画内にあり、クライアントがサムネイルの画像をまだ作っていない場合、アップロードフォームでサムネイルを作る必要がある。

本記事では動画を投稿する際、サムネイルをクライアントが指定した上でアップロードする手法を解説する。


## 何を言っているのかわからない人向けの解説図

つまり、クライアントにサムネイルを作らせた上でアップロードさせる。こうすることで任意のサムネイルを指定することが可能になり、目当ての動画を探しやすくなる。

<div class="img-center"><img src="/images/Screenshot from 2021-03-01 15-23-27.png" alt="クライアントにサムネイルを作らせてアップロード"></div>


## コード

では実際にどうするのか、まずフロント部から修正を行う。HTMLから。開発中のウェブアプリからのコピペなので、name属性などは適宜解釈して欲しい。

    <form id="video_upload_form" action="{% url 'tube:upload' %}" method="POST" enctype="multipart/form-data">
    
        {% csrf_token %}
        <select class="select_form" name="category">
            <option value="">カテゴリを選択してください</option>
            {% for category in categories %}
            <option value="{{ category.id }}">{{ category.name }}</option>
            {% empty %}
            <option value="">カテゴリがありません。</option>
            {% endfor %}
        </select>
        <input class="input_form_text" name="title" type="text" placeholder="タイトル" maxlength="50">
        <textarea class="textarea_form" name="description" rows="4" placeholder="動画説明文" maxlength="300"></textarea>
        <input id="upload_form_video" type="file" name="content">
    
        <!--TODO:ここのサムネイルの選択画面はradioボタンで選択式にして、Ajax送信時にラジオボタンのチェックの値によって処理を切り分ける仕組みに仕立てる。
            サーバーに自動指定させる方式、オリジナルの画像アップロード、動画からサムネイル作成の3つを選べる形式にする。
        -->
        <div class="thumbnail_create_area">
            <div class="thumbnail_create_video"><video id="thumbnail_video" class="thumbnail_video" src="" controls muted></video></div>
            <div class="thumbnail_create_button"><button id="thumbnail_button" class="thumbnail_button" type="button"><i class="far fa-images"></i>サムネイル指定</button></div>
            <div class="thumbnail_create_canvas"><div class="thumbnail_create_canvas_explain">ここにサムネイルが表示される</div><canvas id="canvas"></canvas></div>
        </div>
    
        <input id="upload" class="input_form_button" type="button" value="送信">
    
    </form>

続いて、JS。送信ボタンの押した時、Ajaxを送信する仕組みになっている。

    window.addEventListener("load" , function (){
    
        //動画選択されたときの再生処理
        (function localFileVideoPlayerInit(global) {
    
            //global.URLが存在する場合はglobal.URLを、存在しない場合はglobal.webkitURLを代入する。(参照: https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Expressions_and_Operators#logical_operators )
            let URL = global.URL || global.webkitURL;
    
            //動画選択時に再生する
            let playSelectedFile = function playSelectedFileInit(event) {
    
                let file        = event.target.files[0];
                let type        = file.type;
                let videoNode   = document.querySelector('#thumbnail_video');
    
                // 再生できないものならreturnで終わる
                if ( videoNode.canPlayType(type) === '' ){ return; }
    
                videoNode.src   = URL.createObjectURL(file);
    
                //TODO:読み込み終了後にキャプチャを実行したい
                //capture();
            };
    
            // ファイルが選択されたときのイベントハンドラ
            let inputNode = document.querySelector('#upload_form_video');
            if (inputNode){
                inputNode.addEventListener('change', playSelectedFile, false);
            }
    
        }(window));
    
        //キャプチャーボタンが押されたときのサムネイル自動生成処理
        function capture() {
    
            //キャンバスタグ、ビデオタグ等、必要な要素を抜き取る
            let cEle    = document.querySelector('#canvas');
            let cCtx    = cEle.getContext('2d');
            let vEle    = document.querySelector('#thumbnail_video');
    
            //サムネイルのサイズは上限300X300とする
            let video_w = vEle.videoWidth;
            let video_h = vEle.videoHeight;
    
            let mag = 0;
            if ( video_w > video_h ){
                mag = 300 / video_w;
            }
            else{
                mag = 300 / video_h;
            }
    
            // canvasに関数実行時の動画のフレームを描画
            // 一定値を下回るまで高さと横幅を削る。
            cEle.width  = vEle.videoWidth  * mag;
            cEle.height = vEle.videoHeight * mag;       
    
            cCtx.scale(mag,mag);
            cCtx.drawImage(vEle, 0, 0);
    
            //console.log(cEle.toDataURL('image/png'));
    
        }
    
        //キャプチャーボタンが押されたときに発動するイベントハンドラ
        let captureButton   = document.querySelector('#thumbnail_button');
        if (captureButton){
            captureButton.addEventListener('click', capture, false);
        }
    
    });

後は適当に装飾を施す。サーバーサイドの処理は[DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法](/post/drf-ajax-fileupload/)にかかれてあるものをそのまま適宜流用すれば良い。

## 動かすとこうなる

動画ファイルを選択すると、Blobを使ってVideoタグのsrc属性に動画を再生可能な形で指定される。その状態で真ん中のサムネイル指定ボタンを押すと、右側にCanvas要素にサムネイルが描画生成される。

後は、送信ボタンを押した時、作ったサムネイルを画像ファイル化して、フォームオブジェクトに入れ込み、サーバーに送信させれば良いだけ。

<div class="img-center"><img src="/images/Screenshot from 2021-03-17 08-22-19.png" alt="動画のサムネイルを指定できた"></div>


## 結論

流れとしては、こんな感じ。

1. 動画ファイルの選択
1. videoのsrcに選択した動画ファイルを指定
1. キャプチャボタンを押したらcanvasに描画
1. Ajax送信前にcanvasのデータをファイル化してアペンドする

少々回りくどい気がする。もう少しスマートな方法があると思うが、一応これで動画アップロードと同時にサムネイルのアップロードもできる。

今回実装した動画内からキャプチャする方式だけでなく、任意の画像をサムネイルとして選べるように別途inputタグを用意する方式も合わせて実装しておきたいところ。それからサムネイル未指定の場合も想定しサーバー側で自動生成する機能もあればスムーズな動画アップロードができるでしょう。

