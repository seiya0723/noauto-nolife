---
title: "【Chart.js】棒グラフと折れ線グラフの複合型で、左右の横軸にタイトルと目盛を表示"
date: 2022-10-16T19:22:28+09:00
draft: false
thumbnail: "images/Screenshot from 2022-10-16 20-03-15.png"
categories: [ "フロントサイド" ]
tags: [ "chart.js","JavaScript","JavaScriptライブラリ" ]
---


## 注意

Chart.jsには後方互換性が無い。

本記事で解説しているChart.jsのバージョンは3.7.1であり、それ以前のバージョン、もしくはそれ以降のバージョンでは正常に動作しない場合があるのであしからず。

<!--
## 旧バージョンでは正しいが、バージョン3.7.1(2022年2月時点の最新版)では動作しない

自己責任とは言え、これで2時間も浪費してしまった。

http://www.kogures.com/hitoshi/javascript/chartjs/composite.html

https://misc.0o0o.org/chartjs-doc-ja/axes/cartesian/
-->

## HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        <!--chart.jsのCDN-->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    	<script src="script.js"></script>
    </head>
    <body>
    
        <h1 class="bg-primary text-white">Chart.jsのサンプルコード</h1>
    
        <main class="container">
    
        
            <h2>那覇市2021年の平均気温と平均湿度</h2>
    
            <table class="table table-hover text-center">
                <thead class="thead-dark">
                    <tr><th>月</th><th>平均気温(℃)</th><th>平均湿度(％)</th></tr>        
                </thead>
                <tbody>
                    <tr><td class="month">1</td><td class="temp">16.8</td><td class="humi">71</td></tr>
                    <tr><td class="month">2</td><td class="temp">18.5</td><td class="humi">72</td></tr>
                    <tr><td class="month">3</td><td class="temp">20.8</td><td class="humi">76</td></tr>
                    <tr><td class="month">4</td><td class="temp">21.7</td><td class="humi">73</td></tr>
                    <tr><td class="month">5</td><td class="temp">25.8</td><td class="humi">87</td></tr>
                    <tr><td class="month">6</td><td class="temp">27.1</td><td class="humi">90</td></tr>
                    <tr><td class="month">7</td><td class="temp">28.8</td><td class="humi">84</td></tr>
                    <tr><td class="month">8</td><td class="temp">28.7</td><td class="humi">83</td></tr>
                    <tr><td class="month">9</td><td class="temp">28.8</td><td class="humi">80</td></tr>
                    <tr><td class="month">10</td><td class="temp">26.0</td><td class="humi">73</td></tr>
                    <tr><td class="month">11</td><td class="temp">21.8</td><td class="humi">69</td></tr>
                    <tr><td class="month">12</td><td class="temp">18.9</td><td class="humi">67</td></tr>
                </tbody>
            </table>
    
    
            <h3>折れ線グラフ(気温)だけ表示</h3>
    
            <canvas id="graph1"></canvas>
    
            <h3>棒グラフ(湿度)だけ表示</h3>
    
            <canvas id="graph2"></canvas>
    
            <h3>折れ線グラフと棒グラフを合わせて表示</h3>
    
            <canvas id="graph3"></canvas>
    
            <div>出典:https://www.data.jma.go.jp/obd/stats/etrn/view/monthly_s1.php?prec_no=91&block_no=47936&year=2021&month=1&day=4&view=a2</div>
            <div>https://noauto-nolife.com/post/startup-chartjs/</div>
            <div>https://noauto-nolife.com/post/chartjs-responsive-chart/</div>
    
        </main>
    
    </body>
    </html>
    
## JavaScript

    window.addEventListener("load" , function (){
    
        draw_line();
        draw_bar();
        draw_bar_line();
    
    });
    
    
    function draw_line(){
    
        let x_elem  = $(".month");
        let y_elem  = $(".temp");
    
        let x_list  = [];
        let y_list  = [];
    
        for (let x of x_elem){
            x_list.push(x.innerText + "月");
        }
        for (let y of y_elem){
            y_list.push(Number(y.innerText));
        }
    
        const ctx = document.getElementById("graph1").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x_list,
                datasets: [{
                    label:"月ごとの気温",
                    data: y_list,
                    backgroundColor: 'crimson', //色名だけでなく、CSSのカラーコードも指定できる
                    borderColor: 'crimson',
                    borderWidth: 3, // 折れ線グラフは細いと値のマウスカーソルを合わせるのが難しいので、3~5ぐらいにしておく
    
                    pointStyle: "rectRot", //https://misc.0o0o.org/chartjs-doc-ja/charts/line.html
                    pointRadius: 8,
                    pointHoverRadius: 12,
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 40,
                    }
                }
            }
    
        });
    
    
    }
    function draw_bar(){
    
        let x_elem  = $(".month");
        let y_elem  = $(".humi");
    
        let x_list  = [];
        let y_list  = [];
    
        for (let x of x_elem){
            x_list.push(x.innerText + "月");
        }
        for (let y of y_elem){
            y_list.push(Number(y.innerText));
        }
    
        const ctx = document.getElementById("graph2").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: x_list,
                datasets: [{
                    label:"月ごとの湿度",
                    data: y_list,
                    backgroundColor: 'deepskyblue', //色名だけでなく、CSSのカラーコードも指定できる
                    borderColor: 'deepskyblue',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                    }
                }
            }
    
        });
    
    
    }
    function draw_bar_line(){
    
        let x_elem      = $(".month");
        let y_elem_1    = $(".humi");
        let y_elem_2    = $(".temp");
    
        let x_list      = [];
        let y_list_1    = [];
        let y_list_2    = [];
    
        for (let x of x_elem){
            x_list.push(x.innerText + "月");
        }
        for (let y of y_elem_1){
            y_list_1.push(Number(y.innerText));
        }
        for (let y of y_elem_2){
            y_list_2.push(Number(y.innerText));
        }
    
        //複合グラフの作り方
        //https://www.chartjs.org/docs/latest/charts/mixed.html
        //https://www.chartjs.org/docs/latest/axes/cartesian/
        //https://www.chartjs.org/docs/latest/axes/labelling.html
    
        //下記は2.8.0でしか通用しない
        //http://www.kogures.com/hitoshi/javascript/chartjs/composite.html
    
        //このchart.js日本語ドキュメントの書き方も古いバージョンなので参考にしないように
        //https://misc.0o0o.org/chartjs-doc-ja/axes/cartesian/
    
        const ctx = document.getElementById("graph3").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x_list,
                datasets: [
                    {
                        label:"月ごとの気温",
                        data: y_list_2,
    
                        backgroundColor: 'crimson',
                        borderColor: 'crimson',
                        borderWidth: 3,
                        pointStyle: "rectRot",
                        pointRadius: 8,
                        pointHoverRadius: 12,
    
                        yAxisID: 'y_left'
                    },
                    {
                        label:"月ごとの湿度",
                        data: y_list_1,
                        backgroundColor: 'deepskyblue',
                        borderColor: 'deepskyblue',
                        borderWidth: 1,
    
                        type:"bar",
                        yAxisID: 'y_right',
                    },
                ]
            },
            options: {
                scales: {
                    "y_left": {
                        position: "left",
    
                        min: -10,
                        max: 40,
    
                        ticks: {
                            stepSize: 5,
                        },
                        title: {
                            display:true,
                            text: "気温(℃)",
    
                        },
                    },
                    "y_right": {
                        position: "right",
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                        },
                        title: {
                            display:true,
                            text: "湿度(％)",
                        },
    
                    }
                }
            }
        });
    }


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-16 20-03-15.png" alt=""></div>

後は、横軸を調整して、見た目をどうにかしていく方法もよいだろう。


## 結論

一部のサイトに掲載されている内容を実践したところ、現行のバージョンに対応しておらず、動作しなかった。

やはり公式(英語)の情報が最善ということがよく分かった。


## ソースコード

https://github.com/seiya0723/chartjs-mix




