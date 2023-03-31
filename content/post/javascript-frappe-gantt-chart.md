---
title: "frappe-ganttを使ってJavaScriptでガントチャートを表現する"
date: 2023-03-31T08:50:48+09:00
lastmod: 2023-03-31T08:50:48+09:00
draft: false
thumbnail: "images/Screenshot from 2023-03-31 09-49-13.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","WEBデザイン","JavaScriptライブラリ" ]
---

chart.jsにはガントチャートは存在しないため、[frappe-gantt.js](https://github.com/frappe/gantt)を使う

## ソースコード

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">



    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/frappe-gantt/0.6.1/frappe-gantt.css" integrity="sha512-57KPd8WI3U+HC1LxsxWPL2NKbW82g0BH+0PuktNNSgY1E50mnIc0F0cmWxdnvrWx09l8+PU2Kj+Vz33I+0WApw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/frappe-gantt/0.6.1/frappe-gantt.min.js" integrity="sha512-HyGTvFEibBWxuZkDsE2wmy0VQ0JRirYgGieHp0pUmmwyrcFkAbn55kZrSXzCgKga04SIti5jZQVjbTSzFpzMlg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>


<style>
.gantt .bar-label{
    font-weight:bold;
}
.gantt .bar-progress {
    fill: orange;
}
.gantt .today-highlight {
    fill: #00ffcc;
}
</style>


</head>
<body>


    <svg id="gantt"></svg>

    <script>
    const tasks = [
        {
            id: '1',
            name: 'frappe-ganttの実装テスト',
            description: 'ここに説明文を書く',
            start: '2023-03-31',
            end: '2023-04-03',
            progress: 100,
        },
        {
            id: '2',
            name: 'frappe-ganttの実装',
            description: 'ここに説明文を書く',
            start: '2023-04-01',
            end: '2023-04-05',
            progress: 20,
        },
    ]
        
    const gantt = new Gantt("#gantt", tasks, {
                    // クリック時の挙動
                    on_click: (task) => {
                        console.log(task.description);
                    },
                });
    </script>


</body>
</html>
```

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-03-31 09-49-13.png" alt=""></div>

## 結論

ガントチャートのサイズ調整などは難しいが、シンプルに実装することができる。

CSSで装飾を変えることができるようだ。

https://github.com/frappe/gantt



