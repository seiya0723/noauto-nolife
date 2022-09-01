---
title: "Javascriptを使ってCSVを生成してダウンロードする"
date: 2021-07-31T20:43:44+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "javascript","csv" ]
---

CSVの生成とダウンロードであれば、あえてサーバーサイドでやらなくても、JavaScriptだけでことは足りる。

## ソースコード

下記関数を実行すれば良い。


    //現在スタックされているデータをCSVに変換してダウンロードする
    function create_csv(){
    
        //文字列型で二次元配列のデータ
        data = [ ["A","B","C"],
                 ["A1","B1","C1"],
                 ["A2","B2","C2"],
                 ["A3","B3","C3"],
                 ["A4","B4","C4"],
                ]

        console.log(data);
    
        //作った二次元配列をCSV文字列に直す。
        let csv_string  = ""; 
        for (let d of data) {
            csv_string += d.join(",");
            csv_string += '\r\n';
        }   
    
        //ファイル名の指定
        let file_name   = "test.csv";
    
        //CSVのバイナリデータを作る
        let blob        = new Blob([csv_string], {type: "text/csv"});
        let uri         = URL.createObjectURL(blob);
    
        //リンクタグを作る
        let link        = document.createElement("a");
        link.download   = file_name;
        link.href       = uri;
    
        //作ったリンクタグをクリックさせる
        document.body.appendChild(link);
        link.click();
    
        //クリックしたら即リンクタグを消す
        document.body.removeChild(link);
        delete link;
    
    }


これで下記のようなCSVがダウンロードできる。

<div class="img-center"><img src="/images/Screenshot from 2021-08-01 16-13-06.png" alt="ダウンロードできるCSV"></div>

## 解説


### CSV文字列生成

まず、文字列型の二次元配列をCSVの文字列に書き換える必要がある。

    //作った二次元配列をCSV文字列に直す。
    let csv_string  = ""; 
    for (let d of data) {
        csv_string += d.join(",");
        csv_string += '\r\n';
    }   

1行ずつ、配列を抜き取り、処理を行う。

`d.join(",")`は配列を文字列に書き換え、配列の要素と要素の間に`","`を挿入するという意味になる。

つまり、1回目のループでは`["A","B","C"]`が`"A,B,C"`になる。その後、改行コードである`"\r\n"`を追加して、1行分のデータとする。

これを全ての行だけ繰り返す。これでCSVの文字列の出来上がり。


### CSV文字列をバイナリデータ化

CSVの文字列をダウンロードさせるためには、バイナリデータを作る必要がある。

    let blob        = new Blob([csv_string], {type: "text/csv"});
    let uri         = URL.createObjectURL(blob);

`Blob`クラスでバイナリを定義し、そのダウンロード先(URI)を`URL`クラスで取得する。


### リンクタグを生成、クリックさせ、即消す

リンクタグを生成する。href属性は先ほど生成したURI、クリックさせた上で、削除する。作成から削除までのオブジェクト変数(link)を再利用している。

    //リンクタグを作る
    let link        = document.createElement("a");
    link.download   = file_name;
    link.href       = uri;

    //作ったリンクタグをクリックさせる
    document.body.appendChild(link);
    link.click();

    //クリックしたら即リンクタグを消す
    document.body.removeChild(link);
    delete link;


## 結論

このように単なるバイナリデータの生成と保存であれば、フロントサイドで事は足りる。

これを応用すれば、Canvasで書いたイラストの画像を、ダウンロードボタンを押してユーザーに保存させることもできるだろう。フロントオンリーのお絵かきウェブアプリが作れる。


## 参照元

https://stackoverflow.com/questions/33180855/how-to-specify-csv-file-name-for-downloading-in-window-location-href

