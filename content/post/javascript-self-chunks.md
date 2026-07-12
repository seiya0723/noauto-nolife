---
title: "RAG用の手動チャンクUIのたたき台をJavaScriptで作ってみた"
date: 2026-06-28T14:50:32+09:00
lastmod: 2026-06-28T14:50:32+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","AI開発","LLM","RAG" ]
---

RAG開発時、チャンクを自動的に行っているようではセマンティックな埋め込みベクトル検索などは厳しい。

そこで、チャンクサイズを手動で設定できる余地を作る。

今回はそのたたき台となるJSとHTMLを用意した。

## HTML

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Chunk Editor Sample</title>
<style>
body{
    font-family:sans-serif;
    margin:30px;
}
#editor{
    border:1px solid #999;
    padding:15px;
    min-height:180px;
    white-space:pre-wrap;
    user-select:text;
}
</style>

</head>
<body>
    <h2>チャンクエディタ試作</h2>

<div id="editor">
今日は良い天気です。
明日は雨です。
明後日は晴れです。
</div>

    <br>

    <button id="createChunk">チャンク化</button>

    <script src="script.js"></script>

</body>
</html>
```

pre-wrap を使ってテキスト内部にBRタグを使わせずに改行している。

JS側はテキストのみを取るようにしているので、特に問題はないはずだが、念の為にそうした。



## JS

```
const editor = document.querySelector("#editor");
const createChunk = document.querySelector("#createChunk");
let text = editor.textContent;

// データ構造を作る。
const chunks = [];

createChunk.addEventListener("click",  () => {

    // SelectionAPIを使って選択範囲を取得。
    const selection = window.getSelection();

    // 複数選択されている場合は終了
    if(selection.rangeCount !== 1 ){
        return;
    }

    // 選択されていない場合は終了
    if (selection.isCollapsed) {
        return;
    }

    // 選択した範囲を取得
    const range = selection.getRangeAt(0);
    // 範囲を作る
    const startRange = document.createRange();
    const endRange = document.createRange();

    // 全文を選択する
    startRange.selectNodeContents(editor);
    endRange.selectNodeContents(editor);

    // 開始位置まで縮める
    startRange.setEnd(range.startContainer, range.startOffset);
    // 終了位置まで縮める
    endRange.setEnd(range.endContainer, range.endOffset);

    // インデックス取得
    const start = startRange.toString().length;
    const end = endRange.toString().length;

    console.log(start,end);


    // TODO: この仕組みは後ほど改修予定
    // 重複チェック
    const overlap = chunks.find(chunk=>{
        return !(end<=chunk.start || start>=chunk.end);
    });
    if (overlap){
        console.log("重複しています。")
        return;
    }

    // チャンクをセットする。
    chunks.push({
        id:crypto.randomUUID(),
        start,
        end,
        color:createColor(chunks.length)
    });

    // プッシュ後はソート
    chunks.sort((a,b)=>a.start-b.start);

    console.log(chunks);

    // レンダリング
    render();

});

// 色生成
const createColor = (id) => {
    // idを与えてHLSの色を作る。
    const hue = (id*137.508)%360;
    return `hsl(${hue},70%,82%)`;
}

// レンダリング関数
const render = () => {
    let html = "";
    let pos = 0;

    // TODO: XSS脆弱性あり後で修正を。
    // TODO: DocumentFragment で対処をする。

    for(const chunk of chunks){

        html += text.slice(pos, chunk.start);

        html += `<span class="chunk"
            data-id="${chunk.id}"
            style="background:${chunk.color}">${ text.slice(chunk.start, chunk.end) }</span>`;

        pos = chunk.end;
    }

    html += text.slice(pos);

    editor.innerHTML = html;
}
```

Selection API とRangeAPIを使用している。

マウスで範囲選択するコードは、なるべく直感的になるよう調整した。

色生成の部分は後のことも考えて重複しないようにした。


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2026-06-28 14-57-45.png" alt=""></div>


## 改善予定箇所

- XSS脆弱性。現時点でinnerHTML を使っているため、HTMLタグの文字列がそのままHTMLになってしまう。
- 選択した範囲と重なった場合、エラーが出るだけで編集されない。
    - 選択した範囲と既存チャンク範囲が重なった場合は結合する。
- 「チャンクする」ボタンではなく、選択した文字列の直上などにツールチップもしくはショートカットキーで対応する。
- 既存チャンクの削除機能
- LLMや正規表現、一定文字数単位での自動チャンク機能
- 既存チャンクをクリックして、伸縮する機能(ただし、伸縮中は上記の結合を許さない)
- 既存チャンクの分割機能(例えば、LLMが大きくチャンクした場合は2つに分割するなど)

まだまだ改善箇所は多い。

だが、チャンクを手動で行う仕組みは、おそらく5年先、10年先でも使われるだろうと、個人的には思う。

AIによる高精度な自動化がどれだけ進んだとしても、自動化の途中で人間が介入する仕組みは不可欠だからである。

だからこそ、埋め込みベクトルの調整や使用するモデルの選定、パラメータの調整をするよりも、こういった手動機能の構築を最優先するべきだと私は思った。


## 【2026年7月12日追記】チャンクの結合と削除ができるようにしてみた

伸縮機能は後日追加予定。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Chunk Editor Sample</title>
<style>
body{
    font-family:sans-serif;
    margin:30px;
}
#editor{
    border:1px solid #999;
    padding:15px;
    min-height:180px;
    white-space:pre-wrap;
    user-select:text;
}
.chunk.selected {
    outline: 2px dashed black;
}
</style>

</head>
<body>
    <h2>チャンクエディタ試作</h2>

<div id="editor">
今日は良い天気です。
明日は雨です。
明後日は晴れです。
</div>

    <br>

    <button id="createChunk">チャンク化</button>
    <button id="deleteChunk">チャンク削除</button>
    

    <script src="script.js"></script>

</body>
</html>
```


```
const editor = document.querySelector("#editor");
const createChunk = document.querySelector("#createChunk");
const deleteChunk = document.querySelector("#deleteChunk");
let text = editor.textContent;

// データ構造を作る。
const chunks = [];
// 色番号 
let nextColorId = 0;
// 選択中のチャンク
let selectedChunkId = null;

// チャンク化クリック
createChunk.addEventListener("click",  () => {

    // SelectionAPIを使って選択範囲を取得。
    const selection = window.getSelection();

    // 複数選択されている場合は終了
    if(selection.rangeCount !== 1 ){
        return;
    }
    // 選択されていない場合は終了
    if (selection.isCollapsed) {
        return;
    }

    // 選択した範囲を取得
    const range = selection.getRangeAt(0);
    // 範囲を作る
    const startRange = document.createRange();
    const endRange = document.createRange();

    // 全文を選択する
    startRange.selectNodeContents(editor);
    endRange.selectNodeContents(editor);

    // 開始位置まで縮める
    startRange.setEnd(range.startContainer, range.startOffset);
    // 終了位置まで縮める
    endRange.setEnd(range.endContainer, range.endOffset);

    // インデックス取得
    const start = startRange.toString().length;
    const end = endRange.toString().length;

    // 新しいチャンクの作成
    const newChunk = {
        id:crypto.randomUUID(),
        start,
        end,
        color:createColor(nextColorId++)
    };

    console.log(start,end);

    const deleteIndexes = [];

    // チャンク重複チェックと重複箇所の編集。
    for ( let [i, chunk] of chunks.entries() ){

        // 既存チャンクの一部を選択した場合は何もしない。
        if (chunk.start <= newChunk.start && newChunk.end <= chunk.end) {
            return;
        }

        // チャンクの開始と終了が重複している場合
        // 新規(newChunk):   [-------]
        // 既存(chunk):            [-------]  ← この場合。
        if (newChunk.start < chunk.end && chunk.start < newChunk.end ) {

            // 新規チャンクを育てる。
            if (chunk.start < newChunk.start){
                newChunk.start = chunk.start;
            }
            if (newChunk.end < chunk.end){
                newChunk.end = chunk.end;
            }

            // 複数の重複を検知するためにここでbreakしてはいけない。
            // 重複した既存チャンクは削除するためインデックスを記録。
            deleteIndexes.push(i)

        }
    }

    // インデックスがズレないよう、後方から削除
    for (let i = deleteIndexes.length - 1; i >= 0; i--) {
        chunks.splice(deleteIndexes[i], 1);
    }

    // 新規チャンクを追加。
    chunks.push(newChunk);

    // 追加後はソート
    chunks.sort((a,b)=>a.start-b.start);

    console.log(chunks);

    // レンダリング
    render();

});

// チャンク削除
deleteChunk.addEventListener("click", () => {

    // IDからインデックス番号を取得。
    const index = chunks.findIndex( chunk => chunk.id === selectedChunkId );

    if (index !== -1) {
        chunks.splice(index, 1);
    }

    selectedChunkId = null;
    render();
})

// エディタ内のチャンク箇所をクリック
editor.addEventListener("click", (e) => {

    const chunk = e.target.closest(".chunk");

    if (!chunk) {
        return;
    }

    // 同じ箇所をクリックしたら選択解除する
    if (selectedChunkId === chunk.dataset.id){
        selectedChunkId = null;
        render();
        return;
    }

    // 選択したチャンクIDをセット
    selectedChunkId = chunk.dataset.id;
    render();

});

// 色生成
const createColor = (id) => {
    // idを与えてHLSの色を作る。
    const hue = (id*137.508)%360;
    return `hsl(${hue},70%,82%)`;
}

// レンダリング関数
const render = () => {
    let html = "";
    let pos = 0;

    // TODO: XSS脆弱性あり後で修正を。
    // TODO: DocumentFragment で対処をする。
    for(const chunk of chunks){

        const isSelected = chunk.id === selectedChunkId;

        html += text.slice(pos, chunk.start);

        html += `<span class="chunk ${isSelected ? "selected" : "" }"
            data-id="${chunk.id}"
            style="background:${chunk.color}">${ text.slice(chunk.start, chunk.end) }`;

        pos = chunk.end;
    }

    html += text.slice(pos);

    editor.innerHTML = html;
}
```


