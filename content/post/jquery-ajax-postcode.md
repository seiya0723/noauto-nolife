---
title: "【jQuery】Ajaxで郵便番号検索を行う【通販サイトなどの住所登録に有効】"
date: 2022-02-18T17:40:50+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","Ajax" ]
---

通販サイトなどでは、郵便番号を入力すると、住所の入力を自動で行ってくれる。

本記事では郵便番号検索の実装を解説する。

## HTML


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="script.js"></script>
    </head>
    <body>
    
        <input id="postcode" type="text" name="postcode" placeholder="ここに郵便番号を入力する(ハイフン不要)">
        <input id="postcode_search" type="button" value="郵便番号検索">
    
        <input id="prefecture" type="text" name="prefecture" placeholder="都道府県">
        <input id="city" type="text" name="city" placeholder="市町村">
        <input id="address" type="text" name="address" placeholder="住所">
    
    </body>
    </html>


## JavaScript(jQuery)

    window.addEventListener("load" , function (){
    
        $("#postcode_search").on("click",function(){ search_postcode(); });
    
    });
    function search_postcode(){
    
        let postcode    = $("#postcode").val();
        let pattern     = /^\d{7}$/g;
    
        //未入力の場合は処理しない。
        if (!postcode){
            return false;
        }
    
        //正規表現で郵便番号であるかを判定
        postcode        = postcode.replace("-","");
        let result      = postcode.match(pattern);
    
        if (!result){
            console.log("郵便番号ではない");
            return false;
        }
    
        //http://zipcloud.ibsnet.co.jp/doc/api
    
        $.ajax({
            url: "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + result[0],
            type: "GET",
        }).done( function(data, status, xhr ) { 
            //このdataは文字列で返ってくるのでまずはJSONに変換させる必要がある。
            json    = JSON.parse(data);
    
            if (!json["results"]){
                console.log("データなし");
                return false;
            }
    
            //都道府県
            console.log(json["results"][0]["address1"]);
    
            //〇〇市
            console.log(json["results"][0]["address2"]);
    
            //〇〇
            console.log(json["results"][0]["address3"]);
    
            $("#prefecture").val(json["results"][0]["address1"]);
            $("#city").val(json["results"][0]["address2"]);
            $("#address").val(json["results"][0]["address3"]);
    
        }).fail( function(xhr, status, error) {
            console.log("通信エラー");
        }); 
    }
    


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-19 10-48-53.png" alt=""></div>

## 結論

ヤフーなどでもこの郵便番号検索のサービスを提供しているようだが、今回は会員登録等を行わなくても良い物を利用した。

返却される値が文字列であり、JSONではないのでまずはJSONに変換し、その上で入力欄に当てている。

こういったサービスは自前でも用意できそうだが、実は住所と郵便番号の関係は頻繁に変わっているようだ(吸収合併などで)。そのため自前で用意するには手間がかかりすぎる。既存のサービスを利用したほうが早いと思う。

### 参照元

- http://zipcloud.ibsnet.co.jp/doc/api
- https://www.post.japanpost.jp/zipcode/merge/index.html
