---
title: "inputタグのtype='file'で画像のサムネイルを表示させる"
date: 2023-04-18T16:28:27+09:00
lastmod: 2023-04-18T16:28:27+09:00
draft: false
thumbnail: "images/Screenshot from 2023-04-18 16-34-09.png"
categories: [ "フロントサイド" ]
tags: [ "jQuery","HTML","CSS","ウェブデザイン" ]
---


fontawesomeを使用しているので、アイコンの表示は別途CDNをインストールしておいてほしい。

## ソースコード

### HTML

```
<label class="image_input_area">
    <input class="image_input" type="file" name="icon" accept="image/*">
    <div class="image_input_icon"><i class="fas fa-image"></i></div>
    <img class="image_input_preview" src="" alt="">
</label>
```

### CSS

```
.image_input_area {
    display:inline-block;
    border:dashed 0.2rem var(--gray);
    width:5rem;
    height:5rem;

    position:relative;
    cursor:pointer;
}
.image_input{ display:none; }
.image_input_preview{ width:100%; height:100%;position:absolute; }
.image_input_icon{ width:100%; height:100%;position:absolute; }
.image_input_icon i{ 
    font-size:2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
```

### JavaScript(jQuery)


```
$(".image_input").change(function() {

    const label = $(this).parent("label");
    const file  = $(this).prop("files")[0];

    // 画像以外は処理を停止
    if (! file.type.match("image.*")) {
        $(this).val("");
        return;
    }

    // 画像表示
    const reader    = new FileReader();
    reader.onload   = function() {
        label.children(".image_input_preview").prop("src", reader.result );
    }
    reader.readAsDataURL(file);
});
```

### 【別解】JavaScript(バニラ)


```
window.addEventListener("load" , function (){

    document.addEventListener("change", (event) => {
        // type="file"のinputタグがchengeした時。クラス名の中に image_input が含まれている場合。
        if (event.target && event.target.classList.contains("image_input") ) {
            image_input(event);
        }
    });


});

const image_input = (e) => {

    // 直近の親要素を取得する。
    const label = e.target.closest(".image_input_area");

    // https://qiita.com/noobar/items/afe7fc9994b448672c88
    if (e.target.files && e.target.files[0]) {
        const reader    = new FileReader();
        reader.onload   = function() {
            label.querySelector(".image_input_preview").src = reader.result
        };
        reader.readAsDataURL(e.target.files[0]);
    }

}
```



## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-04-18 16-34-09.png" alt=""></div>


## 結論

これをコピペでサムネイル表示までできるので、それなりに汎用性は高いと思われる。



## 【改修】画像の指定がされたら入力欄を1つ増やす。

一気に画像を複数枚投稿したい場合、画像の指定と同時に次の入力欄を用意する。






