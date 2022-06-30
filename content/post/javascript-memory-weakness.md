---
title: "JavaScript(jQuery)で神経衰弱"
date: 2022-06-30T14:57:25+09:00
draft: false
thumbnail: "images/Screenshot from 2022-06-30 15-04-26.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","ゲーム" ]
---

canvas未使用、JavaScript(jQuery)で神経衰弱を作ってみた。

突貫で作ったためかなり雑ではあるが、トランプを使用したゲームに流用できそうだ。

## デモページ

カードの素材は ( https://opengameart.org/content/playing-cards-vector-png )より。ウラ面は自前で作った。

https://seiya0723.github.io/memory_cards_game/

## ソースコード

https://github.com/seiya0723/memory_cards_game

## HTML

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="script.js"></script>

<style>
img {
    width:200px;

}
</style>

</head>
<body>

<table id="table"></table>

</body>
</html>
```



## JavaScript


```
window.addEventListener("load" , function (){


    // カードの画像: https://opengameart.org/content/playing-cards-vector-png

    //カードのデータ形式
    var CARD_DATA = [
        { "number":1,"src":"img/ace_of_clubs.png" },
        { "number":1,"src":"img/ace_of_diamonds.png" },
        { "number":1,"src":"img/ace_of_hearts.png" },
        { "number":1,"src":"img/ace_of_spades.png" },
        { "number":2,"src":"img/2_of_clubs.png" },
        { "number":2,"src":"img/2_of_diamonds.png" },
        { "number":2,"src":"img/2_of_hearts.png" },
        { "number":2,"src":"img/2_of_spades.png" },
        { "number":3,"src":"img/3_of_clubs.png" },
        { "number":3,"src":"img/3_of_diamonds.png" },
        { "number":3,"src":"img/3_of_hearts.png" },
        { "number":3,"src":"img/3_of_spades.png" },
        { "number":4,"src":"img/4_of_clubs.png" },
        { "number":4,"src":"img/4_of_diamonds.png" },
        { "number":4,"src":"img/4_of_hearts.png" },
        { "number":4,"src":"img/4_of_spades.png" },
        { "number":5,"src":"img/5_of_clubs.png" },
        { "number":5,"src":"img/5_of_diamonds.png" },
        { "number":5,"src":"img/5_of_hearts.png" },
        { "number":5,"src":"img/5_of_spades.png" },
        { "number":6,"src":"img/6_of_clubs.png" },
        { "number":6,"src":"img/6_of_diamonds.png" },
        { "number":6,"src":"img/6_of_hearts.png" },
        { "number":6,"src":"img/6_of_spades.png" },
        { "number":7,"src":"img/7_of_clubs.png" },
        { "number":7,"src":"img/7_of_diamonds.png" },
        { "number":7,"src":"img/7_of_hearts.png" },
        { "number":7,"src":"img/7_of_spades.png" },
        { "number":8,"src":"img/8_of_clubs.png" },
        { "number":8,"src":"img/8_of_diamonds.png" },
        { "number":8,"src":"img/8_of_hearts.png" },
        { "number":8,"src":"img/8_of_spades.png" },
        { "number":9,"src":"img/9_of_clubs.png" },
        { "number":9,"src":"img/9_of_diamonds.png" },
        { "number":9,"src":"img/9_of_hearts.png" },
        { "number":9,"src":"img/9_of_spades.png" },
        { "number":10,"src":"img/10_of_clubs.png" },
        { "number":10,"src":"img/10_of_diamonds.png" },
        { "number":10,"src":"img/10_of_hearts.png" },
        { "number":10,"src":"img/10_of_spades.png" },
        { "number":11,"src":"img/jack_of_clubs.png" },
        { "number":11,"src":"img/jack_of_diamonds.png" },
        { "number":11,"src":"img/jack_of_hearts.png" },
        { "number":11,"src":"img/jack_of_spades.png" },
        { "number":12,"src":"img/king_of_clubs.png" },
        { "number":12,"src":"img/king_of_diamonds.png" },
        { "number":12,"src":"img/king_of_hearts.png" },
        { "number":12,"src":"img/king_of_spades.png" },
        { "number":13,"src":"img/queen_of_clubs.png" },
        { "number":13,"src":"img/queen_of_diamonds.png" },
        { "number":13,"src":"img/queen_of_hearts.png" },
        { "number":13,"src":"img/queen_of_spades.png" },
    ];

    /*
    //選択中のカードの例
    SELECTED    = [
        { "id":"1" , "card": { "number":1,"src":"img/ace_of_clubs.png" } },
    ]
    */
    var SELECTED    = [];



    //ランダム処理
    function shuffle(array){

        for (let i=array.length-1;0<i;i--){
            let rnd = Math.floor(Math.random()*(i + 1));
            let tmp = array[i];

            array[i]    = array[rnd];
            array[rnd]  = tmp;
        }

        return array; //arrayをshuffle関数に返す
    }

    shuffle(CARD_DATA)



    html    = ""

    //カードの配置
    for (let i=0;i<CARD_DATA.length;i++){

        let str_i   = String(i)

        // 例: <img id="1" src="img/card_back.png" alt="[1]">
        html += '<img src="img/card_back.png" class="cards" id="' + str_i + '" alt="' + '[' + str_i + ']' + '">';

    }
    $("#table").html(html)



    //カードがクリックされた時の処理
    $(".cards").on("click",function(){ turn(this.id); });


    //カードをめくる
    function turn(id){

        //2枚以上選択されていない時に限り、カードをめくって、選択中の配列に追加。
        if (SELECTED.length < 2){

            let int_id  = Number(id)
            $("#" + id).prop("src",CARD_DATA[int_id]["src"]);


            let data        = {};
            data["id"]      = id;
            data["card"]    = CARD_DATA[int_id];


            //既に選んだ事のあるものが選択された時、SELECTEDに追加しない
            for (let s of SELECTED){
                if (s["card"] == CARD_DATA[int_id]){
                    return false;
                }
            }


            SELECTED.push(data);


            //2枚以上選択されている場合、判定処理へ
            if (SELECTED.length >= 2){
                setTimeout(judge , 1000);
            }
        }
    }


    //判定
    function judge(){

        //選択されているカードが2枚未満の場合、全て裏に戻して、判定はfalseを返す。
        if (SELECTED.length < 2){

            for (let s of SELECTED){
                $("#" + s["id"]).prop("src","img/card_back.png");
            }
            SELECTED    = [];

            return false;
        }

        //番号が一致している場合、1枚目と2枚目に選んだカードを消し、SELECTEDを初期化してtrueを返す。
        if ( SELECTED[0]["card"]["number"] == SELECTED[1]["card"]["number"] ){

            //TIPS:display:noneだと要素ごと消えてしまうので、消えたことがわかるようにvisibilityのほうが良い
            $("#" + SELECTED[0]["id"]).css("visibility","hidden");
            $("#" + SELECTED[1]["id"]).css("visibility","hidden");

            SELECTED    = [];

            return true;
        }
        else{

            //一致していなければウラ面に戻して、SELECTEDを初期化
            $("#" + SELECTED[0]["id"]).prop("src","img/card_back.png");
            $("#" + SELECTED[1]["id"]).prop("src","img/card_back.png");
            SELECTED    = [];

            return false;
        }
    }

});
```

