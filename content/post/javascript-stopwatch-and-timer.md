---
title: "JavaScript(jQuery)でストップウォッチとタイマーを作る【勉強や運動の記録などに】"
date: 2022-07-31T16:26:04+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","ウェブデザイン" ]
---

記録系のウェブアプリに欠かせないストップウォッチとタイマー

これをJavaScript(jQuery)で再現する。

## HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    
        <script src="script.js"></script>
    
    </head>
    <body>
    
        <div class="p-2 my-2">
            <h2>タイマー</h2>
    
            <label><input id="timer_hour"   type="number" min="0" max="99" value="0">時間</label>
            <label><input id="timer_minute" type="number" min="0" max="59" value="0">分</label>
            <label><input id="timer_second" type="number" min="0" max="59" value="0">秒</label>
    
            <div>
                <input id="timer_start" type="button" value="スタート/一時停止">
                <input id="timer_reset"  type="button" value="リセット" style="display:none;">
            </div>
        
            <div id="remain">00時間00分00秒</div>
        </div>
    
        <div class="p-2 my-2">
            <h2>ストップウォッチ</h2>
    
            <div id="progress"></div>
    
            <input id="watch_start" type="button" value="スタート/一時停止">
            <input id="watch_rap"   type="button" value="ラップ" style="display:none;">
            <input id="watch_reset" type="button" value="リセット" style="display:none;">
    
            <div id="rap_area"></div>
        
        </div>
    
    
    </body>
    </html>


## JavaScript


    window.addEventListener("load" , function (){
    
        //タイマーのイベントリスナ
        $("#timer_start").on("click",function(){ 
            if (TIMER){
                //一時停止する時
                TIMER=false;
                $("#timer_reset").css({"display":"inline-block"});
            }
            else{
                //開始もしくは一時停止から復帰する時
                timer();
                $("#timer_reset").css({"display":"none"});
    
            }
        });
        $("#timer_reset").on("click",function(){ timer_reset(); });
    
        //グローバル変数を初期化
        timer_reset();
    
        //ストップウォッチのイベントリスナ
        $("#watch_start").on("click",function(){ 
            //動作中で停止、停止中で動作
            if (WATCH){
                WATCH=false;
                $("#watch_reset").css({"display":"inline-block"});
            }
            else{
                watch();
                $("#watch_reset").css({"display":"none"});
                $("#watch_rap").css({"display":"inline-block"});
            }
        });
        $("#watch_rap"  ).on("click",function(){ watch_rap(); });
        $("#watch_reset").on("click",function(){ watch_reset(); });
        //グローバル変数を初期化
        watch_reset();
    
    });
    function timer(){
    
        TIMER_OLD_TIME  = Date.now();
    
        //セットされたタイマーの時間を計算する(ミリ秒)
        let set_remain  = ( Number($("#timer_hour").val())*60*60 + Number($("#timer_minute").val())*60 + Number($("#timer_second").val()) )*1000 + 1000;  // 1000ミリ秒追加するだけで良いのでは？
    
        function remain_calc(){
    
            //タイムアウトIDを作っておく(clearTimeout用)
            let timeout_id  = setTimeout(remain_calc, 10);
    
            //現在時刻から過去時刻を引く
            let progress        = TIMER_TEMP + Date.now() - TIMER_OLD_TIME;
    
            //経過ミリ秒
            let TIMER_REMAIN    = set_remain - progress;
    
            //残り時間表示処理(Math.floorで小数は切り捨て)←切り上げだと、hourとminuteはズレる。
            let remain_hour     = ("0" + String(Math.floor(TIMER_REMAIN/3600000))).slice(-2);
            let remain_minute   = ("0" + String(Math.floor((TIMER_REMAIN%3600000)/60000))).slice(-2);
            let remain_second   = ("0" + String(Math.floor((TIMER_REMAIN%60000)/1000))).slice(-2);
    
            //時間が経ったかどうかの判定
            if (TIMER_REMAIN <= 1000){
                console.log("時間が経ちました");
                TIMER   = false;
                clearTimeout(timeout_id);
            }
    
            //停止
            if (!TIMER){
                //現在の進捗状況をTIMER_TEMPに入れる。
                TIMER_TEMP  = TIMER_TEMP + Date.now() - TIMER_OLD_TIME;
    
                //TIPS:setTimeoutを終了させる時は、returnではなくclearTimeoutを使う。
                clearTimeout(timeout_id);
            }
    
            //残り時間を描画する(残り0秒未満は描画しない)
            if (TIMER_REMAIN >= 0){
                remain_str  = remain_hour + "時間" + remain_minute + "分" + remain_second + "秒";
                $("#remain").html(remain_str);
            }
        }
    
        //開始(既にスタートしている場合は実行しない)
        if (!TIMER && set_remain > 0){
            TIMER   = true;
            remain_calc();
        }
    }
    
    function timer_reset(){
        //タイマー動作チェックグローバル変数(falseで停止中)
        TIMER           = false;
        TIMER_REMAIN    = 0;
        TIMER_TEMP      = 0;
        TIMER_OLD_TIME  = 0;
    
        $("#remain").html("00時間00分00秒");
        $("#timer_reset").css({"display":"none"});
    }
    
    
    
    function watch(){
    
        WATCH_OLD_TIME  = Date.now();
    
        function count_calc(){
    
            //タイムアウトIDを作っておく(clearTimeout用)
            let timeout_id  = setTimeout(count_calc, 10);
    
            //現在時刻から過去時刻を引く
            let progress    = WATCH_TEMP + Date.now() - WATCH_OLD_TIME;
    
            //経過時間表示処理(小数は切り捨て)
            let progress_hour           = ("0" + String( Math.floor(progress/3600000) )         ).slice(-2);
            let progress_minute         = ("0" + String( Math.floor((progress%3600000)/60000) ) ).slice(-2);
            let progress_second         = ("0" + String( Math.floor((progress%60000)/1000) )    ).slice(-2);
            let progress_millisecond    = ("0" + String( Math.floor((progress%1000)/10) )       ).slice(-2);
    
            //停止
            if (!WATCH){
                //現在の進捗状況をWATCH_TEMPに入れる。
                WATCH_TEMP  = WATCH_TEMP + Date.now() - WATCH_OLD_TIME;
    
                //TIPS:setTimeoutを終了させる時は、returnではなくclearTimeoutを使う。
                clearTimeout(timeout_id);
            }
    
            //描画
            WATCH_STR   = progress_hour + "時間" + progress_minute + "分" + progress_second + "秒" + progress_millisecond + "ミリ秒";
            $("#progress").html(WATCH_STR);
        }
    
        //開始(既にスタートしている場合は実行しない)
        if (!WATCH){
            WATCH   = true;
            count_calc();
        }
    
    }
    //リセット処理
    function watch_reset(){
        console.log("リセット");
    
        //ストップウォッチの動作チェックグローバル変数(falseで停止中)
        WATCH           = false;
        WATCH_TEMP      = 0;
        WATCH_OLD_TIME  = 0;
        //ラップ用
        WATCH_RAP_COUNT = 0;
        WATCH_STR       = "";
    
        $("#rap_area").html("");
        $("#progress").html("00時間00分00秒00ミリ秒");
    
        $("#watch_reset").css({"display":"none"});
        $("#watch_rap").css({"display":"none"});
    }
    //ラップ処理
    function watch_rap(){
        WATCH_RAP_COUNT += 1;
        $("#rap_area").append("<div>ラップ:#" + String(WATCH_RAP_COUNT) + " " + WATCH_STR + "</div>");
    }


## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-07-31 16-43-40.png" alt=""></div>

## 結論

setIntervalでも実現は可能だが、いつも使い慣れているsetTimeoutを使った。

なお、今回のコードはミリ秒単位の誤差は考慮していない。


