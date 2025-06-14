---
title: "PySide6のQtを使ってGUIアプリを作る"
date: 2025-06-14T16:01:43+09:00
lastmod: 2025-06-14T16:01:43+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "フロントサイド" ]
tags: [ "Python","GUI","Qt" ]
---


PythonでもGUIアプリは作れる。

標準モジュールのtkinterと違い、より高度なものを作れる。


## 【関数】クリックで1ずつ増える

基本のボタン押下で1ずつ増えるコード

```
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton

app = QApplication([])

counter = 0 

def click_counter():
    global counter

    counter += 1

    button.setText(f"{counter} 回押しました。")
    print(counter)


window = QMainWindow()
window.setWindowTitle("テストウィンドウ")

button = QPushButton(f"{counter} 回押しました。")
button.clicked.connect(click_counter)

window.setCentralWidget(button)
window.resize(300, 200)
window.show()

app.exec()
```

このコードではクラスを使わず、関数のみで表現をしている。

1ずつ増やして値を記録するには、グローバル変数を使わないと実現できない。

そこでクラスを使うとよいだろう。


## 【クラス】クリックで1ずつ増える

```
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.counter = 0

        # 初期画面の設定
        self.setWindowTitle("カウンタウィンドウ")
        self.button = QPushButton(f"{self.counter} 回押しました。")

        self.button.clicked.connect(self.on_click)
        self.setCentralWidget(self.button)

    def on_click(self):
        self.counter += 1
        self.button.setText(f"{self.counter} 回押しました。")
        print(self.counter)

app = QApplication([])
window = MainWindow()
window.resize(300, 200)
window.show()
app.exec()
```

クラスにすることで、こんなにもシンプルに表現できた。

グローバル変数だったものは、コンストラクタで属性に仕立てselfを使って呼び出しする。

ここから複数の画面を使って表現をする。

## 複数画面

クラスを使うことで、複数の画面を容易に実現できる。


```
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QPushButton, QVBoxLayout, QStackedWidget

# 画面1
class FirstPage(QWidget):
    def __init__(self, switch_func):
        super().__init__()
        layout = QVBoxLayout()
        button = QPushButton("次の画面へ")
        button.clicked.connect(switch_func)
        layout.addWidget(button)
        self.setLayout(layout)

# 画面2
class SecondPage(QWidget):
    def __init__(self, switch_func):
        super().__init__()
        layout = QVBoxLayout()
        button = QPushButton("これは2番目の画面です")
        button.clicked.connect(switch_func)
        layout.addWidget(button)
        self.setLayout(layout)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("画面切り替えサンプル")
        self.stack = QStackedWidget()

        # 画面ごとにQWigetのインスタンス作って管理
        self.page1 = FirstPage(self.second_page)
        self.page2 = SecondPage(self.first_page)

        # 画面を登録(スタック)する
        self.stack.addWidget(self.page1)
        self.stack.addWidget(self.page2)

        # 画面をメインの中央に配置する(この場合1番最初にスタックされた画面1が出てくる。)
        self.setCentralWidget(self.stack)

        # 画面2を最初から表示させたい場合はこちら。
        #self.stack.setCurrentWidget(self.page2)

    def first_page(self):
        self.stack.setCurrentWidget(self.page1)

    def second_page(self):
        self.stack.setCurrentWidget(self.page2)



app = QApplication([])
window = MainWindow()
window.show()
app.exec()
```

画面ごとにクラスを作り、QMainWindowのクラスでそれを管理している。

画面ごとのクラスは居タンスを作り、それをスタックしておく。あとは配置をするだけ。

これで`self.stack.setCurrentWidget()` を使えばすぐに画面を呼び出しできる。


## 複数画面で、値を保持する・保持しない(画面移動のたびに初期化させる)

### 値を保持する

まずは値を保持するパターン。と言ってもインスタンス化をしなければプログラム終了まで値は記録される仕様になっている。

```
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QPushButton, QVBoxLayout, QStackedWidget

# 画面1
class FirstPage(QWidget):
    def __init__(self, switch_func):
        super().__init__()
        self.count = 0

        layout = QVBoxLayout()
        button = QPushButton("次の画面へ")
        button.clicked.connect(switch_func)
        layout.addWidget(button)

        self.counter_button = QPushButton(f"カウンター: {self.count}")
        self.counter_button.clicked.connect(self.counter)
        layout.addWidget(self.counter_button)

        self.setLayout(layout)

    def counter(self):
        self.count += 1
        self.counter_button.setText(f"カウンター: {self.count}")


# 画面2
class SecondPage(QWidget):
    def __init__(self, switch_func):
        super().__init__()
        layout = QVBoxLayout()
        button = QPushButton("これは2番目の画面です")
        button.clicked.connect(switch_func)
        layout.addWidget(button)
        self.setLayout(layout)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("画面切り替えサンプル")
        self.stack = QStackedWidget()

        # 画面ごとにQWigetのインスタンス作って管理
        self.page1 = FirstPage(self.second_page)
        self.page2 = SecondPage(self.first_page)

        # 画面を登録(スタック)する
        self.stack.addWidget(self.page1)
        self.stack.addWidget(self.page2)

        # 画面をメインの中央に配置する(この場合1番最初にスタックされた画面1が出てくる。)
        self.setCentralWidget(self.stack)

        # 画面2を最初から表示させたい場合はこちら。
        #self.stack.setCurrentWidget(self.page2)

    def first_page(self):
        self.stack.setCurrentWidget(self.page1)

    def second_page(self):
        self.stack.setCurrentWidget(self.page2)

app = QApplication([])
window = MainWindow()
window.show()
app.exec()
```


### 値を保持しない(画面移動のたびに初期化する)

このようにページ移動のメソッドで、再度インスタンス化することで値を初期化できる。
```
    """
    def first_page(self):
        self.stack.setCurrentWidget(self.page1)
    """

    def first_page(self):
        # 再度インスタンス化することで初期化できる。
        self.page1 = FirstPage(self.second_page)
        self.stack.addWidget(self.page1)

        self.stack.setCurrentWidget(self.page1)
```

ただし、再度のインスタンス化のコストが高い場合は、初期化のメソッドを用意して実行すると良いだろう。





