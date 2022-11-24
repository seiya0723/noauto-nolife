---
title: "コマンド一発で動画をmp3に変換する"
date: 2022-11-23T14:29:55+09:00
lastmod: 2022-11-23T14:29:55+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Linux","ffmpeg","シェル芸" ]
---




## .mkv動画 → .mp3

```
find . -type f -name "*.mkv" -print0 | perl -pe 's/\.mkv\0/\0/g' | xargs -0 -I% ffmpeg -i %.mkv -acodec libmp3lame -ab 256k %.mp3
```


## .mp4動画 → .mp3

```
find . -type f -name "*.mp4" -print0 | perl -pe 's/\.mp4\0/\0/g' | xargs -0 -I% ffmpeg -i %.mp4 -acodec libmp3lame -ab 256k %.mp3
```


## 結論

よく使うので、備忘録として。

