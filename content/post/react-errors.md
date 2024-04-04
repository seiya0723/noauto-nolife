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
こんなふうに、レンダリングする要素が識別できない時、エラーが出る。

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



