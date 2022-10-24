---
title: "OGP(Open Graph Protocol)情報から動画のサムネイル等を抽出する【Python使用】"
date: 2022-10-24T08:47:02+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "web全般" ]
tags: [ "Python","OGP","BeautifulSoup","スクレイピング" ]
---


例えば、YouTubeなどの動画のURLをTwitterに貼り付けると、自動的にリンク先の動画のサムネイルが表示される。

これはYouTubeのHTMLに含まれるOGPという情報をTwitterが抜き取り、表示しているからだ。

## OGPとは

HTMLのheadタグに書く、metaタグで`property="og:image"`などの情報が含まれている。

参照: https://ogp.me/


例えば、下記動画であれば、OGPは

    https://www.youtube.com/watch?v=jNQXAC9IVRw

<div class="img-center"><img src="/images/Screenshot from 2022-10-24 08-57-37.png" alt=""></div>

このmetaタグのことをいう。`og:image`のURLをたどると、

    https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg

動画のサムネイルを取得できる。今回は、このOGP情報をPythonを使用して取得していく。

## PythonでOGPをスクレイピングする。

    import requests,bs4
    
    TARGET  = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    
    
    result  = requests.get(TARGET)
    soup    = bs4.BeautifulSoup(result.content,"html.parser")
    
    
    og_image_elems  = soup.select('[property="og:image"]')
    
    for og_image_elem in og_image_elems:
        print(og_image_elem.get("content"))
    
    
これでサムネイルのURLが出力される。





