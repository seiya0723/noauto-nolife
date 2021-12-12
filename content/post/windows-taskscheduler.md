---
title: "WindowsのタスクスケジューラーでPythonスクリプトを実行させる【スクレイピングの予約実行などに】"
date: 2021-12-09T15:46:22+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","スクレイピング" ]
---

例えば、毎日定時に実行しなければならないスクリプトがある場合、手動でその時間に実行しているようではめんどくさい。

そんな時、Windowsの場合は、指定した時間になったら実行してくれるタスクスケジューラーを使うと良いだろう。

## タスクスケジューラーを起動する

Windowsキーを押して、『tasks』と入力すると出てくる

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 15-52-00.png" alt=""></div>

これを起動する。

## 新しいタスクを作成する

『タスクスケジューラライブラリ』にて右クリック。『基本タスクの作成』をクリックする。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 15-54-52.png" alt=""></div>

名前と説明を書く。ここは必須ではないが、わかるように書いておいたほうが良いだろう。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 15-57-10.png" alt=""></div>

タスクを実行するタイミングを選択する。今回は毎日を選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 15-57-44.png" alt=""></div>

トリガーの詳細を指定する。下記のように実行開始する日付と、実行する時刻を指定する。以降は1日間隔で実行される。今回は17時に実行するように指定した。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 16-00-18.png" alt=""></div>

タスクの操作はプログラムの開始を選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 16-01-05.png" alt=""></div>

実行するPythonプログラムを選択する。プログラムスクリプトには実行するpython.exeを指定、引数の追加にはPythonファイルのパスを指定、開始オプションにはvenvを指定する。


<div class="img-center"><img src="/images/Screenshot from 2021-12-09 16-12-30.png" alt=""></div>

パスはこんな感じになる。venvの中にあるpython.exeを指定する。


    #プログラム/スクリプト
    "C:\Users\[ユーザー名]\PycharmProjects\pythonProject\venv\Scripts\python.exe"
    
    #引数の追加
    test.py
    
    #開始オプション
    C:\Users\[ユーザー名]\PycharmProjects\pythonProject\


`test.py`は`C:\Users\[ユーザー名]\PycharmProjects\pythonProject\`の中に保存する。

確認画面が出てくるので、完了を押す。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 16-12-36.png" alt=""></div>

すると、一覧に先ほど作ったタスクが登録される。もしこの時点でテストで実行したい場合は、右クリックから実行を選ぶ。このテストで正常に動作していれば、定刻で作動する。

<div class="img-center"><img src="/images/Screenshot from 2021-12-09 16-13-16.png" alt=""></div>

後は17時になるのを待つだけ。消す時は、対象のタスクで右クリックして、削除もしくは無効化させる。

## 結論

ちなみに、このタスクスケジューラはWindowsが起動している状態でなければ、発動はしない。そのため、タスクスケジューラを使用するためには、Windowsをつけっぱなしにしておかなければならないのだ。

もし、PCのファンがうるさいと感じたり、電気代がもったいないと思うのであれば、電源つけっぱなしでもうるさくなく、電気代の消費も少ないRaspberry Piを使用する事をおすすめする。


名刺ケースほどの大きさの基盤にRaspberry Pi OSを搭載させ、USB電源で常駐させる。ファンは無いので音は発生せず、小型の基盤なので低消費電力。Linux系OSになるので、タスクスケジューラではなくcrontabを使うことになるが、ファイル編集だけですぐにタスクを追加できるので、Windowsのタスクスケジューラより扱いやすいだろう。

