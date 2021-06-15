---
title: "video.jsを実装させ、コントローラをカスタムする【Brightcove Player】"
date: 2021-06-09T11:48:19+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","ウェブデザイン" ]
---

通常、videoタグを使用する場合、controls属性を付与することで、動画の操作(再生、音量調整等)が可能なコントローラを表示できる。

しかし、再生速度の操作やコントローラの装飾関係を一から作っていくには時間がかかりすぎる。

そこで、videoタグの拡張が可能な`video.js`というライブラリを実装させる。すでにAmazon等の大手サイトでも採用実績のある完成度の高いvideoタグ専用のjsライブラリである。

## 実装から設定まで

HEADタグ内に以下のCSSとJSのCDNを設置。

    <link href="https://vjs.zencdn.net/7.11.4/video-js.css" rel="stylesheet" />
    <script src="https://vjs.zencdn.net/7.11.4/video.min.js"></script>

続いて、別途jsファイルを用意し、下記を記述して読み込ませる。

    window.addEventListener("load" , function (){ 

        //#video-jsを{}内の設定で初期化、返り値のオブジェクトをplayerとする。
        let player  = videojs( 'video-js',{

            //コントローラ表示、アクセスしたら自動再生、事前ロードする(一部ブラウザではできない)
            controls: true,
            autoplay: true,
            preload: 'auto',
    
            fill:false,
            responsive: true,
    
            //再生速度の設定
            playbackRates: [ 0.25, 0.5, 1, 1.5, 2, 4,],
    
    
            //ローディングの表示
            LoadingSpinner:true,
    
            //音量は縦に表示
            controlBar: {
                volumePanel: { inline: false },
            }
        });
    
    });

`video.js`をインストールすることで、`videojs`クラスから引数2つを与えてオブジェクトを作ることができる。

第一引数はvideoタグに指定したID名。第二引数はオブジェクトの初期化に必要な設定、オブジェクト型で指定する。

初期化の設定には、コントローラに表示させる、自動再生、ローディング時の表示等を施している。

続いて、`videojs`クラスから作られたオブジェクト(今回は`player`)にはメソッドが用意されている。メソッドを利用することで、イベントを定義したり、動画に関係する処理を行うことができる。

    player.volume(0.25);

    //生成したvideo.jsのオブジェクトに対して、イベントリスナの設定ができる。トリガーはvideoタグのものと同様
    player.on("loadstart",function(){ console.log("start"); });
    player.on("volumechange",function(){ console.log("音量が変わった"); });
    player.on("ended",function(){ console.log("end"); });

`.volume()`メソッドを使えば音量の設定ができる。Cookieに指定した音量値を読み込み、その数値を指定することで音量の記録と初期化ができる。

`.on()`メソッドはjQueryの`.on()`メソッドと挙動はほぼ同じ。発動条件(トリガー)を`.on()`メソッドの第一引数に指定。このトリガーは通常のvideoタグのものと全く同様である。第二引数には実行したい処理を記述する。

このイベントを使うことで、`videojs`のオブジェクトに用意されたメソッドがイベントに合わせて実行できる。

もちろん、videojsクラスからオブジェクトを作る時、第一引数のID名は必須であるが、第二引数の初期化設定は必須ではないので、下記の用に別の関数でもオブジェクトを自由に作れる。

    let test    = videojs('video-js');
    test.volume(0.4);


## 装飾について

`video.js`のおかげでコントローラやボタンなどがvideoタグから別要素として独立している。そのためその要素名を指定することで簡単に装飾ができる。

ただし、注意しなければならない点が2点ある。

- video.jsのCSSのCDNより下にCSSを記述する事(video.jsのCSSよりも先に装飾を施しても、上書きされてしまう)
- オブジェクトにクラスを追加させる事

以上を踏まえた状態でコードを書く。


以下HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <!--省略-->
    
        <link href="https://vjs.zencdn.net/7.11.4/video-js.css" rel="stylesheet" />
        <script src="https://vjs.zencdn.net/7.11.4/video.min.js"></script>
        
        <link href="{% static 'tube/css/video-js.css' %}" rel="stylesheet" />
        <script src="{% static 'tube/js/single.js' %}"></script>
    
    </head>
    <body>
        <video id="video-js" class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9">
            <source src="/media/{{ video.content }}" type="video/mp4">
        </video>
    </body>
    </html>


以下、video-js.css

    /* single.html video content*/
    .vjs-matrix .vjs-big-play-button {
        background:orange;
    }


以下、single.js。ページがロードされたときに発動


    let player  = videojs('video-js');
    player.addClass('vjs-matrix');


これで、再生ボタンがオレンジになる。

before

<div class="img-center"><img src="/images/Screenshot from 2021-06-15 15-20-42.png" alt=""></div>

after 

<div class="img-center"><img src="/images/Screenshot from 2021-06-15 15-20-35.png" alt=""></div>

つまり、オブジェクトにクラスを追加させ、CSSのセレクタも追加するクラスを含めた状態で装飾を施すことだ。

これで装飾が発動する。詳しくは下記リンクを確認すると良い。

https://docs.videojs.com/tutorial-skins.html


## 結論

video.jsはドキュメントこそ限られているが、企業での採用実績は多く、広告の表示やDRM(著作権保護)等の機能拡張の他に、イベントのトリガーは通常のvideoタグと同じものが流用できるので実装は比較的容易である。

要素名を選べるので装飾もしやすい、オリジナルの再生コントローラを作るのであれば、video.jsが一番のライブラリだと思われる。

ただ、ドキュメントが限られている(ほぼ英語しか無い)ので、上級者向けではある。


## 参照元

https://stackoverflow.com/questions/18169473/video-js-size-to-fit-div

https://docs.videojs.com/tutorial-components.html#volume-panel

https://ja.player.support.brightcove.com/styling/customizing-player-appearance.html

https://videojs.github.io/videojs-playbackrate-adjuster/

https://docs.videojs.com/tutorial-skins.html
