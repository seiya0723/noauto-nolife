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

- XSS脆弱性。現時点でDocumentFragment を使っておらず、エスケープもしていないため、HTMLタグがそのままHTMLになってしまう可能性がある。
- 選択した範囲と重なった場合、エラーが出るだけで編集されない。
- 「チャンクする」ボタンではなく、選択した文字列の直上などにツールチップを配置する。
- チャンクした箇所を元に戻せるようにする。

まだまだ改善箇所は多い。

だが、チャンクを手動で行う仕組みは、おそらく5年先、10年先でも使われるだろうと、個人的には思う。


