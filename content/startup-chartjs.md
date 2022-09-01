---
title: "【JavaScript】Chart.jsでグラフを描画する【棒グラフ、円グラフ、折れ線グラフ】"
date: 2021-12-09T14:20:07+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-09 14-10-23.png"
categories: [ "フロントサイド" ]
tags: [ "javascript","ウェブデザイン","初心者向け","スタートアップシリーズ","chart.js" ]
---

## インストールとチュートリアル

下記CDNをインストールする。

    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.6.2/dist/chart.min.js"></script>

続いて、グラフを表示させたい場所に下記、canvasタグを配置。

    <canvas id="graph"></canvas>

これで準備完了。後は、次項以降のJavaScriptを発動させ、任意のグラフを描画させる。


## 棒グラフ

[公式](https://www.chartjs.org/docs/latest/)から拝借。

実行させるJavaScriptが下記。

    const ctx = document.getElementById('graph').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

`type`に`bar`を指定。必要な数だけ`data`と`label`を追加、お好みでボーダーカラーや背景色、線の太さなどを設定する。

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 14-10-23.png" alt=""></div>

実際には、HTML側からデータを抜き取り、セットすることになるだろう。もしくはAjaxを発動させ、サーバーから直接データを受け取るか。

### 別の書き方

ちなみにこんなふうに記述することもできる。


    const ctx = document.getElementById('graph').getContext('2d');

    const labels = [1,2,3,4,5,6,7,];
    const data = { 
      labels: labels,
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],  
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],  
        borderWidth: 1
      }]  
    };  
    const config = { 
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }   
        }   
      },  
    };  

    const myChart = new Chart(ctx, config);

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 14-16-43.png" alt=""></div>

内容は異なるが、同じように発動する。

## 円・ドーナツグラフ


円グラフにしたい場合、`type`を`pie`にする。

    const data = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };
    const config = {
      type: 'doughnut',
      data: data,
    };

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 14-20-05.png" alt=""></div>

参照元:https://www.chartjs.org/docs/latest/charts/doughnut.html

## 折れ線グラフ

    const labels = [1,2,3,4,5,6,7,];
    const data = {
      labels: labels,
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
    const config = {  
        type: 'line',  
        data: data,
    };

    const myChart = new Chart(ctx, config);

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 14-18-16.png" alt=""></div>

参照元:https://www.chartjs.org/docs/latest/charts/line.html


