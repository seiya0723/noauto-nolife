---
title: "【chart.js】円グラフで大きい順、小さい順に並び替える【JavaScriptの.sort()】"
date: 2022-11-27T09:45:20+09:00
lastmod: 2022-11-27T09:45:20+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "chart.js","JavaScript" ]
---


## 【前提】JavaScriptで並び替えをするには.sort()を使う

これで並び替えができる。

```
let numbers = [12,67,47,223,84,5,1,7,8,365];

console.log(numbers);

numbers.sort( function (a,b){
    return a-b;
});

console.log(numbers);
```

### モダンな書き方に修正する

だが、待ってもらいたい。これでは、並び替え処理を実行する前のnumbersも並び替えの影響で、内容が変わってしまっている。

これを防ぐために、[スプレッド構文を使って配列をコピー](/post/react-essential-javascript/#スプレッド構文)する。

さらに、[アロー関数](/post/react-essential-javascript/#アロー関数)を使えば、更に短く書くことができる。

この2点を考慮すると、このように書き換えられる。

```
let numbers         = [12,67,47,223,84,5,1,7,8,365];

console.log(numbers);

//スプレッド構文
let sorted_numbers  = [...numbers];

//アロー関数
sorted_numbers.sort( (a,b) => { return a-b; } );
console.log(sorted_numbers);
```

このアロー関数は波括弧とreturnは省略できるが、個人的に見づらくなるので、やめておいた。



### オブジェクト型のリストのsortはどうする？

こうすればよい。

```
let scores          = [
                        {name:"Ash", point:80},
                        {name:"Bob", point:40},
                        {name:"Can", point:70},
                        {name:"Don", point:20},
                        {name:"Eva", point:60},
                        {name:"Fan", point:10},
                    ];

console.log(scores);

let sorted_scores  = [...scores];

sorted_scores.sort( (a, b) => { return a.point - b.point; });

console.log(sorted_scores);
```

return文で比較をする時、属性値を呼び出して比較するだけ。


### 逆順にするにはどうしたら良い？

sortの部分の、aとbを逆にすればよい。

```
sorted_numbers.sort( (a,b) => { return b-a; } );
```

これはオブジェクト型の場合も同様。

```
sorted_scores.sort( (a, b) => { return b.point - a.point; });
```


## chart.jsのデータとラベルを並び替えする。

前項を踏まえた上で、データとラベルを並び替えする。


```
    let category_elems  = $(".month_category");
    let time_elems      = $(".month_time");

    //TODO:オブジェクトの配列を作る
    let data_label      = [];
    for (let i=0;i<category_elems.length;i++){
        data_label.push( { category : category_elems.eq(i).text(), time : Number(time_elems.eq(i).text()) } );
    }

    //並び替える
    data_label.sort( (a, b) => { return a.time - b.time; });

    console.log(data_label);

    //分離させる
    let categories  = [];
    let times       = [];
    for (let data of data_label){
        categories.push(data.category);
        times.push(data.time);
    }
```

この`categories`と`times`をChartjsのlabelとdataに当てればよい。

分離させる部分は更に効率化できそうだが、今のところ思いつかないので、とりあえずこれで。

<div class="img-center"><img src="/images/Screenshot from 2022-11-27 10-43-00.png" alt=""></div>

こんなふうに円グラフが綺麗になる。


## 結論

JavaScriptのスキルが改めて必要だと思う。

JSのスキルが限られていると、円グラフのソーティングだけでものすごく時間がかかる。

ちなみに、今回のソーティングは棒グラフを並び替えしたい場合でも有効。`type="bar"`にすれば良いだけ。

## 参照元

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort



