---
title: "Reactに必要なJavaScript構文【ES2015(ES6)のテンプレート文字列、アロー関数、スプレッド構文、letとconstなど、脱jQueryにも有効】"
date: 2022-11-05T15:16:20+09:00
lastmod: 2022-11-05T15:16:20+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","react","初心者向け","jQuery" ]
---

Reactに必要なJavaScript構文をまとめる

Reactを使わない場合でも、JavaScriptをシンプル書くヒントがあるので、コードを小さくしたい場合にも有効。

脱jQueryを推進したい人は下記も参考に。

[jQueryのコードをJavascriptに書き換える【セレクタ、属性値の参照、イベントなど】](/post/jquery-to-javascript/)

## letとconst

letとconstはいずれも再宣言が不可能。

```
let test = "aaa";
//これはエラー
//let test = "bbb";

const test = "aaa";
//これもエラー
//const test = "bbb";
//これもエラー
//test = "bbb";

```

ただ、constは定数ではあるが、関数・オブジェクト・配列は、内部の値や属性及びメソッドの変更は可能。

```
const object = { name:"testuser",
                 age:40,
                 };

object.name     = "userA";
object.age      = 20;

//追加も可能
object.address  = "Japan";
```

```
const numbers = [1,2,3];

//代入も追加も可能
numbers[0] = 100;
numbers.push(4);
```

つまり`document.querySelector`などでDOMを取得する場合、constで取得するのがモダンなやり方。

```
const tests = document.querySelectorAll(".test"); //←全ての.textクラスの要素を抜き取る
const test  = document.querySelector(".test"); //←.testクラスの1番最初の要素を抜き取る
```

この`test`の`innerText`はconstであるものの書き換えができる。

```
const tests = document.querySelectorAll(".test"); //←全ての.textクラスの要素を抜き取る
const test  = document.querySelector(".test"); //←.testクラスの1番最初の要素を抜き取る


test.innerText  = "this is test !!";

for (let t of tests){
    t.innerText = "test !!!!";
}
```

ただし配列、関数、オブジェクト以外はプリミティブ型といい、これらは書き換えができない点に注意する。

## テンプレート構文

JavaScriptの構文では`+`を使うことで文字列を連結させることができるが、これでは少々面倒だ。

そこで、テンプレート構文を使う。
```
const name = "Bob";


const message   = "Hello " + name + " !!";
const message2  = `Hello ${name} !!`;
```

バッククオーテーションを使って文字列を作る、その間、`${変数}`とすることで呼び出しと連結が同時にできる。

ちなみに、`${}`の中に入れることができるのは変数だけではなく、関数や計算式でも良い。

```
function triangle(x,y){
    return x*y/2
}

console.log(`面積は ${triangle(10,40)} です`);
```

これからは文字列を扱う時は、テンプレート構文のバッククオーテーションと`${}`を使おう。


## アロー関数

最近のJavaScriptでは`=>`を使うことで、`function`と書く必要はなくなる。これがアロー関数である。

```
//普通の関数
function test(value){
    return value;
}

//右辺の無名関数を左辺のtest2に代入している
const test2 = function(value){
    return value;
}

//アロー関数
const test3 = (value) => {
    return value;
}

//引数が2つのアロー関数
const triangle = (x,y) => {
    return x*y/2;
}
```

ちなみに、アロー関数の引数が1つの場合に限り、`()`を省略して書くことができるが、個人的には混乱を招くのでおすすめはしない。

```
//アロー関数
const test3 = value => {
    return value;
}
```

2つ以上の引数の場合、このように書くことはできないので、最初から`()`を書いておいたほうが無難である。

他にも、単一行であれば、アロー関数ではreturnを書かずに値を返却することができる。

```
const triangle = (x,y) => x*y/2;

//どうしても改行したい場合は()を使って改行する

const test5 = (w,h) => (
    {
        width:w,
        height:h
    }
);
```

## 分割代入

オブジェクトの属性を呼び出す時、毎度毎度オブジェクト名を書いているようでは書く量が増える。

そこで、一致する属性名だけ取り出し、それだけ書く。

```
const obj = {
    name: "Bob",
    age: 25
}

const {name, age} = obj;

console.log(`I am ${name}. ${age} years old.`);
```

仮に、nameやageがobjの中に存在しない場合はundefinedで終わる。

個人的にはこの分割代入を使うメリットは薄いと考えている。なぜなら途中で元のオブジェクトの属性値が変わっても対応できないからだ。

```
const obj = {
    name: "Bob",
    age: 25
}
const {name, age} = obj;

obj.name = "Tom";
console.log(`I am ${name}. ${age} years old.`); //←Bobになっている。
```

わざわざ別に変数名を宣言して浪費するぐらいなら、オブジェクトのまま属性を参照していたほうがマシかもしれない。

これは一応、こんな書き方がある程度で良いだろう。

## オブジェクトの省略記法

前項の分割代入ではなく、オブジェクトの省略記法なら、実践でも使えると思われる。

既に宣言されている変数と同名の属性名でオブジェクトを作る場合、省略できる。

```
const name  = "Bob";
const age   = 25;

const obj = { name, age };


console.log(obj.name); //Bob
console.log(obj.age); //25
```

分割代入の逆をイメージすれば、理解はたやすいと思われる。


## スプレッド構文

スプレッド構文を使うことで、配列の中身をまとめて呼び出すことができる。

```
const numbers  = [40,50,60];

console.log(...numbers); // 40 50 60 
```


このように関数呼び出しに使うことができる。


```
const average   = (x,y,z) => {
    return (x+y+z)/3;
}

const numbers   = [40,50,60];
average(...numbers);
```


配列をコピーしたり、まとめたりすることもできる。

```
const numbers_a = [30,50,60];
const numbers_b = [30,50,60];

const numbers_c = [...numbers_a, ...numbers_b];
const numbers_d = [...numbers_c];
```

ちなみに、`=`でコピーしてしまうと、参照値が引き継がれるので、今後はスプレッド構文でコピーする。

```
const numbers_d = numbers_c;

numbers_d[0] = 10000;

//いずれも最初の値が10000になる。
console.log(numbers_c); 
console.log(numbers_d);
```

ちなみにこの現象(`=`でのコピーによる参照値の引き継ぎ問題)は、オブジェクトでも同様に発生する。

オブジェクトも同様にスプレッド構文でコピーする。

```
const obj1 = { x:100 , y:300 };
const obj2 = { a:100 , b:300 };

const obj3 = { ...obj1 , ...obj2 };
```

どうやらPythonの辞書型において、`.copy()`を使う理屈と同じようだ。


## mapメソッド

配列内の要素を順に処理したい場合、mapメソッドを使うことで、更に短く表現できる。

```
const numbers   = [ 10,20,30,40,50 ];

const twices    = numbers.map( (n) => { return n*2 });
```

まず、配列オブジェクトに対し、メソッドとしてmapを実行。

```
numbers.map()
```
そのmapの引数としてアロー関数を指定する。下記はnumbersから1つ取り出してnとし、コンソールに表示している。

```
numbers.map( (n) => { console.log(n) });
```

これはつまるところ、querySelectorAllで取得したDOMをループして、内部のテキストを書き換える時に使える。

ただし、querySelectorAllは、そのままではmapメソッドは使えない。スプレッド構文を使用し、配列に直してから発動させる必要がある。
```
const tests = document.querySelectorAll(".test"); //←全ての.textクラスの要素を抜き取る

//これではエラーになる
//tests.map( (t) => { t.innerText = "test !!!!"; } ); 

//スプレッド構文を使用して配列に直して、mapメソッドは正常に動作する。
[...tests].map( (t) => { t.innerText = "test !!!!"; } ); 

/*
for (let t of tests){
    t.innerText = "test !!!!";
}
*/
```

こうしてみると、for文を1行に直してもそれほど変わらないので、コード行数の削減の観点から考えれば大したことはないと思う。

だが、for~of文の別解として一応覚えておいて損は無いだろう。まあfor~ofのほうがわかりやすいが。

参照元: https://stackoverflow.com/questions/2600343/why-does-document-queryselectorall-return-a-staticnodelist-rather-than-a-real-ar


ちなみにオブジェクトはスプレッド構文を使ったとしても配列に直すことはできない。
```
いずれもエラー
//console.log(...obj)
//console.log([...obj])
```

## filterメソッド

配列から特定の条件に一致した値のみ取り出したい場合がある。そういう時はfilterを使用する。


```
const numbers5 = [10,20,30,40,50];

console.log(numbers5.filter( (n) => { return n >= 20; }) );
```

Pythonのリストの内包表記を彷彿させる。

ちなみに、mapメソッドでreturnの分岐をしようとすると、このように表記すると思われるが

```
console.log(numbers5.map( (n) => { if (n >= 20){ return n; } } ));
```

これだと、配列の先頭に対してはreturnしなくなるので、このようになってしまう。

<div class="img-center"><img src="/images/Screenshot from 2022-11-06 09-17-13.png" alt=""></div>

mapメソッドの方は、配列の先頭がundefinedになってしまう。

- mapメソッド: 配列内の全ての値に処理を行いたい時
- filterメソッド: 配列内から特定の値を取り出したい時

このように使い分けをする必要がある。


ちなみに、mapメソッドやfilterメソッドを使用して配列のループをする時、indexが必要な時がある。そういう時はこうする。

```
console.log(numbers5.filter( (n,index) => { console.log(index); return n >= 20; }))
console.log(numbers5.map( (n,index) => { console.log(index); return n*2; }))
```
アロー関数の第二引数として、indexを受け取れば良い。


## 三項演算子

三項演算子を使用することで、if文を更に短く書くことができる。このように`?`と`:`を使う。

```
条件式 ? 条件式がtrueの時の処理 : 条件式がfalseの時の処理
```

このように、if文の返り値を変数に入れることもできる。判定と代入を行うときに三項演算子は有効である。
```
console.log(10 > 0 ? true : false);

const value = 10 > 0 ? true : false;
console.log(value);
```

ただ、可読性に難があるので、程々に。


## 短絡評価( ||と&&の使い分け ) 

`||`はOR演算子、`&&`はAND演算子を意味しているが、厳密には少し意味が異なる。

厳密には、`||`は左がtrueであれば左を返す。左がfalseであれば右を返すようになっている。

```
const flag1 = true;
const flag2 = false;

if (flag1 || flag2){
    console.log("いずれかがTrue");
}
```

上記は仮にflag1とflag2のtrueとfalseが逆になったとしても、trueが帰ってくる。

これを利用して、このように書くことができる

```
const price     = null;
const message   = price || "価格未指定です";

console.log(message);
```

この場合、左のpriceの値はnullでありfalseなので、右側が返され、`価格未指定です`がmessageに代入される。

一方で、`&&`は左側がtrueなら、右側を返す。左がfalseなら左を返すようになっている。

そのため、このような書き方ができる。

```
const price     = 1000;
const message   = price && "価格が設定されています";

console.log(message);
```

## JavaScriptのDOMの取得・作成・追加・削除

DOMの取得はこうする。

```
//取得
const elem  = document.querySelector(".test");

//.testを全て取得
const elems = document.querySelectorAll(".test");
```

一部で`.querySelector()`は遅いと言われているが、`.getElementById()`はスペルミスや保守性に難がある気がするので、とりあえず`.querySelector()`で良いと思う。

DOMの作成と追加はこうする。`document.createElement()`と`.appendChild()`を使えば良い。

```
//取得
const elem      = document.querySelector(".test");

//作成
const div_elem  = document.createElement("div");

//テキスト挿入
div.innerText   = "これはテストです。";

//要素に追加
elem.appendChild(div_elem)
```

DOMの削除はこうする。`.removeChild()`を使う。

```
//取得
const body_elem = document.querySelector("body");

//取得
const elem      = document.querySelector(".test");

//削除
body_elem.removeChild(elem);
```

## 結論

まとめると以下のような時、本記事のJavaScript構文を使っての書き換えが実現できる


|状況|構文|
|:--:|:--:|
|オブジェクト・関数・配列の宣言|[constを使う](#letとconst)|
|文字列と変数の連結|[テンプレート構文を使う](#テンプレート構文)|
|functionを使用した関数・無名関数|[アロー関数を使う](#アロー関数)|
|既に宣言された変数をオブジェクトにする|[オブジェクトの省略記法を使う](#オブジェクトの省略記法)|
|配列・オブジェクトのコピーと連結|[スプレッド構文を使う](#スプレッド構文)|
|配列内の全要素に順に処理をする|[mapメソッドを使う](#mapメソッド)|
|配列内から条件に一致するものだけ取り出す|[filterメソッドを使う](#filterメソッド)|
|条件式を使用したあとに代入|[三項演算子を使う](#三項演算子)もしくは[\|\|と&&の使い分けを使う](#との使い分け)|


脱jQueryを望む場合は下記記事も参考に。

[jQueryのコードをJavascriptに書き換える【セレクタ、属性値の参照、イベントなど】](/post/jquery-to-javascript/)

後は、Reactの開発環境を整える。

[Ubuntuにreactをインストールして動作確認する](/post/ubuntu-react-install/)

## 関連書籍


[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)

