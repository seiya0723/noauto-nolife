---
title: "テキストエリアに入力時に、Tabキーを押してタブを入力する【マークダウンやコードの入力に有効】"
date: 2023-09-22T22:13:44+09:00
lastmod: 2023-09-22T22:13:44+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","ウェブデザイン","tips" ]
---


直接コードを入力する場合に有効。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>
    <textarea id="textarea"></textarea>

    <script>
        const textarea  = document.querySelector('#textarea');

        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {

                // デフォルトの動作（フォーカスの切り替え）を防止
                e.preventDefault();

                // カーソル位置の前と後を取得
                const start = this.selectionStart;
                const end   = this.selectionEnd;

                // カーソル位置にタブ文字を挿入
                const tab   = '\t';
                this.value  = this.value.substring(0, start) + tab + this.value.substring(end);

                // カーソル位置を調整(タブを入力した後にカーソルを移動)
                this.selectionStart = this.selectionEnd = start + 1;
            }
        });
    </script>

</body>
</html>
```

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-09-22 22-26-41.png" alt=""></div>



## 半角スペース4文字分にするには？

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

</head>
<body>
    <textarea id="textarea"></textarea>

    <script>
        const textarea  = document.querySelector('#textarea');

        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {

                // デフォルトの動作（フォーカスの切り替え）を防止
                e.preventDefault();

                // カーソル位置の前と後を取得
                const start = this.selectionStart;
                const end   = this.selectionEnd;

                // カーソル位置に挿入
                const spaces  = '    ';
                this.value  = this.value.substring(0, start) + spaces + this.value.substring(end);

                // カーソル位置を調整(入力した後にカーソルを移動)
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    </script>

</body>
</html>
```


## 関連記事


[DjangoでPythonライブラリのマークダウンを試してみる【pip install Markdown】](/post/django-markdown/)


