---
title: "chart.jsでグラフ表示幅と高さを指定する。"
date: 2021-12-23T09:46:30+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","chart.js" ]
---


まず、公式によると下記の方法ではchart.jsの横幅と高さ指定は通用しない。

    <canvas id="graph" height="40vh" width="80vw">

他にもクラス名を指定して、そのクラス名に幅などの装飾を施す方法も通用しない。


## 対策

### 対策1:親要素でstyle属性にposition:relativeとwidth及びheightを合わせて指定する。

クラス名にCSSで装飾を施すのではなく、親要素のstyle属性に指定しなければうまく行かないので注意。

    <div style="position:relative;width:250px;height:250px;">
        <canvas id="graph"></canvas>
    </div>


### 対策2:JavaScript側から幅と高さを指定する。

Chartクラスを使用して生成されたオブジェクトに対して、幅と高さを指定する方法でも通用する。

    /* 省略 */

    const myChart = new Chart(ctx, config);

    myChart.canvas.parentNode.style.height = '128px';
    myChart.canvas.parentNode.style.width = '128px';

これで幅と高さが128pxになる。

## 結論

chart.jsはどこでも使う一方で、装飾が通用しない場合がある。本件は全て公式(英語)に書かれてあるので参照されたし。

参照元:https://www.chartjs.org/docs/3.4.0/configuration/responsive.html

