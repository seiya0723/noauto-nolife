---
title: "DjangoとReactのTodoアプリ(SPA)を解析する"
date: 2023-04-29T15:59:32+09:00
lastmod: 2023-04-29T15:59:32+09:00
draft: true
thumbnail: "images/django-react.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","React","初心者向け","追記予定" ]
---

[DjangoとReactを組み合わせる方法論と問題の考察](/post/django-react-methodology/)の続き。

コードを書いてみたので、それを元にわかった事をまとめていく。間違いが有るかもしれないので、ご注意をば。

動作原理と全体像は↑の記事で解説しているので、本記事では割愛。コードの意味をまとめていく。

## サーバーサイド(Django)


### config/setttings.py

編集した箇所のみ掲載

```
INSTALLED_APPS = [ 
    "todo",
    'corsheaders',
    'rest_framework',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [ 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]
CORS_ORIGIN_WHITELIST = [ 
     'http://localhost:3000'
]
```

アプリ、django-cors-headers、djangorestframeworkの3つを`INSTALLED_APPS`に追加している。

`MIDDLEWARE`では、django-cors-headersを追加している。おそらくオリジン間リソース共有の判定をしていると思われる。別オリジンからのリクエストは基本的に拒否する仕様だから。

許可するオリジンを`CORS_ORIGIN_WHITELIST`に追加する。これがReactサーバーのオリジンになる。

### config/urls.py

```
from django.contrib import admin
from django.urls import path,include
from rest_framework import routers
from todo import views

router = routers.DefaultRouter()
router.register(r'todos', views.TodoView, 'todo')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

DjangoRESTframeworkのroutersを使用している。

Restful化したビューに届くようにurls.pyを一括で作っているらしい。


- 参照1: https://www.django-rest-framework.org/api-guide/routers/
- 参照2: https://www.django-rest-framework.org/api-guide/routers/#defaultrouter

### todo/views.py


```
from django.shortcuts import render
from rest_framework import viewsets
from .serializers import TodoSerializer
from .models import Todo

# Create your views here.

class TodoView(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()
```

`viewsets.ModelViewSet`を継承することで、指定したモデルの読み書き編集削除を一括で行うことができる。

この`TodoView`クラスの中には、GET、POST、PUT、DELETEメソッドが含まれている。

それぞれのメソッドに応じて読み書き編集削除の処理が行われている。


### todo/models.py 

```
from django.db import models

# Create your models here.

class Todo(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def _str_(self):
        return self.title
```

普通のモデルクラス


### todo/serializers.py

```
from rest_framework import serializers
from .models import Todo

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ('id', 'title', 'description', 'completed')
```

シリアライザ。シリアライザはフォームクラスの上位互換のようなものと認識して問題はないと思われる。

バリデーションを行った後、DBへデータを保存することができる。それだけでなく、jsonを返却することもできる。

つまり、Reactが受け取る際、Djangoはシリアライザを使い、モデルオブジェクトをjsonに整形してレスポンスを返している。

シリアライザにidが含まれるということは、書き込み時のバリデーションは別途フォームクラスを作っている可能性がある。


## フロントサイド(React)


### src/index.js


```
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>, document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

普通のindex.jsと変わらない。BootstrapとCSSをimportしているようだ。

それから、コンポーネントであるApp.jsを読み込んでいる。

### src/App.js


```
import React, { Component } from "react";
import Modal from "./components/Modal";
import axios from "axios";
// リクエスト送信用のaxiosとモーダルをimport

class App extends Component {

    // コンストラクタ。propを引き継ぎ、stateを作る。
    constructor(props) {
        super(props);

        this.state = {
            viewCompleted: false,
            todoList: [],
            modal: false,
            activeItem: {
                title: "",
                description: "",
                completed: false,
            },
        };


    }

    // マウントしたときに発動する特殊な関数名
    // https://legacy.reactjs.org/docs/react-component.html#componentdidmount
    componentDidMount() {
        //thisはPythonのクラスのselfと等価。同じクラス内の別メソッドを呼び出す。
        this.refreshList();
    }

    //ここでaxiosを使ってデータを取得する。jsonで返ってくるのでStateに入れる。
    refreshList = () => {
        axios
            .get("/api/todos/")
            .then((res) => this.setState({ todoList: res.data }))
            .catch((err) => console.log(err));
    };

    // モーダルダイアログのトグル
    toggle = () => {
        this.setState({ modal: !this.state.modal });
    };

    // モーダルダイアログを表示させ、idがあれば編集処理のダイアログを、なければ新規作成のダイアログを表示させる
    handleSubmit = (item) => {
        this.toggle();

        // 編集処理
        if (item.id) {
            axios
                .put(`/api/todos/${item.id}/`, item)
                .then((res) => this.refreshList());
            return;
        }
        axios
            .post("/api/todos/", item)
            .then((res) => this.refreshList());
    };

    // 削除処理。axiosを使ってDELETEメソッドの送信。refreshListを使ってデータを取得する。
    handleDelete = (item) => {
        axios
            .delete(`/api/todos/${item.id}/`)
            .then((res) => this.refreshList());
    };



    // 現在作成中のTodoをStateに入れる。(初期化したitem)
    createItem = () => {
        const item = { title: "", description: "", completed: false };
        this.setState({ activeItem: item, modal: !this.state.modal });
    };

    // 現在編集中のTodoをStateに入れる。
    editItem = (item) => {
        this.setState({ activeItem: item, modal: !this.state.modal });
    };


    // タブの表示に合わせて表示するTodoを返す。
    displayCompleted = (status) => {
        if (status) {
            return this.setState({ viewCompleted: true });
        }
        return this.setState({ viewCompleted: false });
    };

    // タブの表示 (クリック時にdisplayCompleted()を実行、完了状況を元にクラス名を変える)
    renderTabList = () => {
        return (
            <div className="nav nav-tabs">
                <span onClick={ () => this.displayCompleted(true)  } className={this.state.viewCompleted ? "nav-link active" : "nav-link"} >Complete</span>
                <span onClick={ () => this.displayCompleted(false) } className={this.state.viewCompleted ? "nav-link" : "nav-link active"} >Incomplete</span>
            </div>
        );
    };

    // タブの中身 Todoの数だけレンダリングする。
    renderItems = () => {
        const { viewCompleted } = this.state;
        const newItems = this.state.todoList.filter((item) => item.completed === viewCompleted);

        // mapメソッドを使ってTodoの個数だけ表示。
        return newItems.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center" >
                <span className={`todo-title mr-2 ${ this.state.viewCompleted ? "completed-todo" : "" }`} title={item.description}>{item.title}</span>
                <span>
                    <button className="btn btn-secondary mr-2" onClick={() => this.editItem(item)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => this.handleDelete(item)}>Delete</button>
                </span>
            </li>
        ));
    };

    // ページに表示させる内容(本体を表示、タブとタブの中身はそれぞれ呼び出し。)
    render() {
        return (
            <main className="container">
                <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
                <div className="row">
                    <div className="col-md-6 col-sm-10 mx-auto p-0">
                        <div className="card p-3">
                            <div className="mb-4">
                                <button className="btn btn-primary" onClick={this.createItem}>Add task</button>
                            </div>
                            {this.renderTabList()}
                            <ul className="list-group list-group-flush border-top-0">
                                {this.renderItems()}
                            </ul>
                        </div>
                    </div>
                </div>
                {this.state.modal ? ( <Modal activeItem={this.state.activeItem} toggle={this.toggle} onSave={this.handleSubmit} /> ) : null}
            </main>
        );
    }
}

export default App;
```

コンストラクタの`this.state`で状況を確認している。

todoListの変化に応じて、表示する内容を変えている。

### src/components/Modal.js

```
import React, { Component } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Input,
    Label,
} from "reactstrap";

export default class CustomModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: this.props.activeItem,
        };
    }

    handleChange = (e) => {
        let { name, value } = e.target;

        if (e.target.type === "checkbox") {
            value = e.target.checked;
        }

        const activeItem = { ...this.state.activeItem, [name]: value };

        this.setState({ activeItem });
    };

    render() {
        const { toggle, onSave } = this.props;

        return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Todo Item</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="todo-title">Title</Label>
              <Input
                type="text"
                id="todo-title"
                name="title"
                value={this.state.activeItem.title}
                onChange={this.handleChange}
                placeholder="Enter Todo Title"
              />
            </FormGroup>
            <FormGroup>
              <Label for="todo-description">Description</Label>
              <Input
                type="text"
                id="todo-description"
                name="description"
                value={this.state.activeItem.description}
                onChange={this.handleChange}
                placeholder="Enter Todo description"
              />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  name="completed"
                  checked={this.state.activeItem.completed}
                  onChange={this.handleChange}
                />
                Completed
              </Label>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
```

ModalはApp.jsから呼び出されている、propsとしてactiveItem、toggle、onSaveを与えている。


## 結論

Stateがコードをやや複雑にしているが、やっていることは

- React側はaxiosを使ってget,postなどを送っている
- Django側はリクエストを受け取ってDB操作、jsonレスポンスを返す

これだけだ。

後は、settings.pyにてdjango-cors-headersの設定をしているだけなので、SPAの作成自体はそれほど難しくはないと思われる。

## ソースコード

https://github.com/seiya0723/react_django_todo

## 参考元

https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react

## 関連記事

[Reactビギナーが15分で掲示板アプリを作る方法](/post/startup-react/)

このDjango+ReactのTodoアプリを元に簡易掲示板を作ってみた。(ただし、編集機能が不足している)


