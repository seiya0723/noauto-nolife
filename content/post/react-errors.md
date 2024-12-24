---
title: "よく出るReactのエラー一覧"
date: 2024-04-01T11:12:58+09:00
lastmod: 2024-04-01T11:12:58+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","備忘録","追記予定" ]
---


## textarea要素には、valueプロパティを使って値を与える

普通のHTMLでは、textareaに最初から値を入れておきたい場合、子要素に直接文字を書くと良い。

しかし、Reactで同じことをやるとエラーになる。

```
<textarea className="form-control" name="comment" onChange={this.handleChange}>{this.state.activeItem.comment}</textarea>
```

そこで、valueプロパティを使う。

```
<textarea className="form-control" name="comment" onChange={this.handleChange} value={this.state.activeItem.comment}></textarea>
```

これで、
```
Use the `defaultValue` or `value` props instead of setting children on <textarea>.
```
というエラーは解決される。

## リスト内の要素を識別できるよう、keyプロパティを与える

```
Each child in a list should have a unique "key" prop. 
```

リストをレンダリングする時。

```
renderItems = () => {
    return this.state.topicList.map((item) => (
        <div className="border">
            <div>{item.id}:{item.comment}</div>
            <textarea className="form-control" name="comment" value={item.comment} onChange={this.handleChange}></textarea>
            <div className="text-end">
                <input type="button" className="btn btn-danger" value="削除" onClick={() => this.handleDelete(item)} />
            </div>
        </div>
    ));
};
```
このように、レンダリングする要素が識別できない時、エラーが出る。

keyプロパティを与えてレンダリングをする。

```
renderItems = () => {
    return this.state.topicList.map((item) => (
        <div className="border" key={item.id}>
            <div>{item.id}:{item.comment}</div>
            <textarea className="form-control" name="comment" value={item.comment} onChange={this.handleChange}></textarea>
            <div className="text-end">
                <input type="button" className="btn btn-danger" value="削除" onClick={() => this.handleDelete(item)} />
            </div>
        </div>
    ));
};
```


参照: [【React】リストをレンダリングする時は、key属性を付与する【Warning: Each child in a list should have a unique 'key' prop.】](/post/react-list-rendering-unique-key-prop/)


## 閉じタグがないHTMLは、タグの末尾に / をつける。


```
<input type="button" onClick={handleClick} value="送信">
```

こう書いた場合、エラーになる。

```
<input type="button" onClick={handleClick} value="送信" />
```
このようにタグの末尾に / を入れる。

参照: [【React】閉じタグがないHTML要素は/(スラッシュ)をタグの末尾に書く【inputタグ、imgタグ等】](/post/react-html-close-tag/)



## on属性に与える関数を、()つきにすると無限ループする。

```
<button onClick={handleClick()}>クリックしてください</button>
```

例えば、このようにしてしまうと、handleClickはクリックされなくても実行され続ける。

```
<button onClick={handleClick}>クリックしてください</button>
```
このように() をつけず、関数名のみ指定する。

関数呼び出し時に引数を与えるには、無名関数でラップする。

```
<button onClick={ (event) => { handleClick(event.currentTarget.value) } } value="値">クリックしてください</button>
```


## 参照型

例えば、Stateがオブジェクトや配列の場合、

このようにsetStateをしても、再レンダリングされることはない。

```
    // 前提: todosは { 1: { ... }, 2: {...}, 3: {...} } となっている。

    const toggleIsEditing = (id) => {
        console.log( todos[id] );

        todos[id].is_editing = !todos[id].is_editing;
        setTodos(todos);
    }
```

このようにオブジェクトの値を書き換えても、ReactはState(オブジェクト)の変化を検知できないため、再レンダリングは発動しない。

もし、オブジェクトの値を書き換え、再レンダリングをさせるには、こうする。

```
    const toggleIsEditing = (id) => {
        setTodos((prevTodos) => {
            const updatedTodos  = { ...prevTodos };
            updatedTodos[id]    = { ...updatedTodos[id], is_editing: !updatedTodos[id].is_editing };
            return updatedTodos;
        });
    };
```

setTodos を関数として実行。

todosをprevTodos として扱い、値を書き換えreturn する。

この時、スプレッド構文を使ってオブジェクトをコピーする。間違っても

```
const updatedTodos = prevTodos;
```
としてはいけない。この場合は参照値が引き継がれてしまう。

オブジェクトのコピーをして編集するときは、スプレッド構文は厳守する。

