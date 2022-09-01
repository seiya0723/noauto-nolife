---
title: "JavascriptからCookieを扱う【動画の設定音量の記録と読み込み】"
date: 2021-04-13T18:59:38+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "javascript","tips","初心者向け" ]
---


JavaScriptからCookieを扱う。これで、サイトのデータをユーザーのブラウザに保存できる。


## Cookieにvideoタグで設定した音量情報を格納、読み込みするコード

実例を交えながら解説する。下記はvideoタグで指定した音量をCookieに記録する。

    window.addEventListener("load" , function (){

        const video   = document.querySelector("video");
        video.addEventListener("volumechange",(event) => {
            document.cookie = "volume=" + decodeURIComponent(event.target.volume) + ";Path=/single;SameSite=strict";
        }); 
     
        set_video_volume();
        
    });
    
    function set_video_volume(){
    
        let cookies         = document.cookie;
        console.log(cookies);
    
        let cookiesArray    = cookies.split(';');
        let volume          = 0;
    
        for(let c of cookiesArray) {
            console.log(c);
    
            let cArray = c.split('=');
            if( cArray[0] === "volume"){
                volume  = Number(cArray[1]);
                console.log(volume);
                break;
            }
        }   
    
        const video     = document.querySelector("video");
        video.volume    = volume;
    }
    
### Cookieの書き込み

`window.addEventListener`に指定したイベントリスナで、Cookieの書き込みを行う。下記コード。

    const video   = document.querySelector("video");
    video.addEventListener("volumechange",(event) => {
        document.cookie = "volume=" + decodeURIComponent(event.target.volume) + ";Path=/single;SameSite=strict";
    }); 

`video`タグをセレクタで抜き取り、`video`タグの`volumechange`、つまり音量が変更された時、`event`を引数にして次の処理を実行する。

`event`というのはイベントが発生する引き金になった要素。つまり音量を変更した`video`タグのこと。

その次の処理というのがCookieの書き込み処理。下記のコードのことである。

    document.cookie = "volume=" + decodeURIComponent(event.target.volume) + ";Path=/single;SameSite=strict";

`document.cookie`にCookieの書式に倣って属性と値を書き込む。Cookieは下記のような書式になっている。この書式に倣う。

    [属性]=[値];[属性]=[値];[属性]=[値];[属性]=[値];......

先のコードは`volume=[音量の値];Path=/single;SameSite=strict`が格納される。

### Cookieの読み込み

`set_video_volume()`でCookieを読み込み、`video`タグに音量をセットしている。

    function set_video_volume(){
    
        let cookies         = document.cookie;
        console.log(cookies);
    
        let cookiesArray    = cookies.split(';');
        let volume          = 0;
    
        for(let c of cookiesArray) {
            console.log(c);
    
            let cArray = c.split('=');
            if( cArray[0] === "volume"){
                volume  = Number(cArray[1]);
                console.log(volume);
                break;
            }
        }   
    
        const video     = document.querySelector("video");
        video.volume    = volume;
    }

まず、`document.cookie`の値を抜き取る。その上で`.split()`を使い、`;`で区切って配列型にする。

後は配列をループさせる。この状態だと、配列1個分は`[属性名]=[値]`の状態になっているので、さらに`=`で区切って配列型に。

先ほど、音量情報を記録した`volume`属性を参照し、値を抜き取る。

後は、セレクタで`video`タグを指定し、タグの`volume`属性に音量の値を代入する。

    const video     = document.querySelector("video");
    video.volume    = volume;

これで読み込みは完了。

## 結論

今回の例のように、改ざんされても問題のないデータであり、サーバーサイド及びDBの負担を軽減したいのであれば、迷わずCookieに保存すると良いだろう。

例えば、検索・閲覧履歴とか、表示設定とか。

もちろん、サーバーサイドの無いフロントオンリーのゲームのセーブデータを保存するときにも有効。

注意しなければならないのは、サーバーへCookieを送信するときはセキュア属性を付与すること。セキュア属性を付与すれば、暗号化されていない通信でCookieは送信されない。(※開発用サーバーで動かす場合、当然http通信なのでデプロイ前にsecure属性付けて動かないなんてことがないように)

https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies

