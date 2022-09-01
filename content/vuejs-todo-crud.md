---
title: "Vue.jsでTODOを作る【CRUD】"
date: 2021-01-26T15:43:20+09:00
draft: false
thumbnail: "images/vuejs.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","初心者向け","vue.js" ]
---

Codepenに掲載されていた偉い人のコードを元に、Todoを作ってみた。変数名がベストプラクティスとは異なる可能性があるため、あくまでもvue.jsの全体の機能確認用としている。


## ソースコード

まずは`index.html`

    <html lang="ja">
    <head>
    	<meta charset="utf-8">
    	<title>Vue.jsでTodo</title>
    	<meta name="viewport" content="width=device-width, initial-scale=1">
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/vue-router/2.2.1/vue-router.js"></script>
     
        <script src="script.js"></script>
    
    </head>
    <body>
    
    <header class="text-center" style="background:orange;color:white;">
        <h1>Vue.jsでTodo</h1>
    </header>
    
    <main class="container" id="app">
        <!--この部分にテンプレートが描画される。-->
        <router-view></router-view>
    </main>
    
    <!--一覧表示用テンプレート-->
    <template id="todo-list">
    	<div>
    		<div class="actions">
    			<router-link class="btn btn-secondary" v-bind:to="{path: '/add-todo'}">Add Todo</router-link>
    		</div>
    		<div class="filters row">
    			<div class="form-group col-sm-3">
    				<input v-model="search_key" class="form-control" placeholder="キーワード検索">
    			</div>
    		</div>
    		<table class="table">
    			<thead>
    			<tr>
    				<th>Todo</th>
    				<th class="col-sm-2">Actions</th>
    			</tr>
    			</thead>
    			<tbody>
    			<tr v-for="todo in filtered_todos">
    				<td>
                        <router-link v-bind:to="{name: 'todo', params: {todo_id: todo.id}}">{{ todo.content }}</router-link>
    				</td>
    				<td>
    					<router-link class="btn btn-warning btn-xs" v-bind:to="{name: 'todo-edit', params: {todo_id: todo.id}}">Edit</router-link>
    					<router-link class="btn btn-danger btn-xs" v-bind:to="{name: 'todo-delete', params: {todo_id: todo.id}}">Delete</router-link>
    				</td>
    			</tr>
    			</tbody>
    		</table>
    	</div>
    </template>
    
    
    <!--追加用テンプレート-->
    <template id="add-todo">
    	<div>
    		<h2>Add Todo</h2>
    		<form v-on:submit="create_todo">
    			<div class="form-group">
    				<textarea class="form-control" rows="5" v-model="todo.content" placeholder="ここにやることを書く"></textarea>
    			</div>
    			<button type="submit" class="btn btn-primary">Create</button>
    			<router-link class="btn btn-secondary" v-bind:to="'/'">Cancel</router-link>
    		</form>
    	</div>
    </template>
    
    
    <!--個別用テンプレート-->
    <template id="todo">
    	<div>
    		<h2>{{ todo.content }}</h2>
    		<router-link v-bind:to="'/'">Back to product list</router-link>
    	</div>
    </template>
    
    
    <!--編集用テンプレート-->
    <template id="update-todo">
    	<div>
    		<h2>Edit product</h2>
    		<form v-on:submit="update_todo">
    			<div class="form-group">
    				<textarea class="form-control" rows="3" v-model="todo.content"></textarea>
    			</div>
    			<button type="submit" class="btn btn-primary">Save</button>
    			<router-link class="btn btn-default" v-bind:to="'/'">Cancel</router-link>
    		</form>
    	</div>
    </template>
    
    
    <!--削除用テンプレート-->
    <template id="delete-todo">
    	<div>
    		<h2>『{{ todo.content }}』を削除しますか? </h2>
    		<form v-on:submit="delete_todo">
    			<p>この操作は取り消せません。</p>
    			<button type="submit" class="btn btn-danger">Delete</button>
    			<router-link class="btn btn-default" v-bind:to="'/'">Cancel</router-link>
    		</form>
    	</div>
    </template>
    
    </body>
    </html>
    
続いて、`script.js`

    window.addEventListener("load" , function (){
    
        var todos   = [
            {id: 1, content: '買い物に行く'},
            {id: 2, content: 'ガソリンを入れる'},
            {id: 3, content: 'お金を下ろす'}
        ];
    
        function find_todo(id) {
            return todos[find_todokey(id)];
        };
    
        function find_todokey(id) {
            for (var key = 0; key < todos.length; key++) {
                if (todos[key].id == id) {
                    return key;
                }
            }
        };
    
        //一覧表示と検索
        var List = Vue.extend({
            template: '#todo-list',
            data: function () {
                return {todos: todos, search_key: ''};
            },
            computed: {
                filtered_todos: function () {
                    return this.todos.filter(function (todo) {
                        return this.search_key=='' || todo.content.indexOf(this.search_key) !== -1;
                    },this);
                }
            }
        });
    
        //個別表示
        var Todo = Vue.extend({
            template: "#todo",
            data: function(){
                return { todo: find_todo(this.$route.params.todo_id) };
            },
        });
    
    
        //追加
        var AddTodo = Vue.extend({
            template: '#add-todo',
            data: function () {
                return {todo: {content:''} };
            },	
            methods: {
                create_todo: function() {
                    var todo = this.todo;
                    todos.push({
                        id: Math.random().toString().split('.')[1],
                        content: todo.content
                    }); 
                    router.push('/');
                }	 
            }
        });
    
        //編集
        var UpdateTodo = Vue.extend({
            template: '#update-todo',
            data: function () {
                return { todo: find_todo(this.$route.params.todo_id) };
            },
            methods: {
                update_todo: function () {
                    var todo = this.todo;
                    //TIPS:idとcontentをtodos[key]に代入する
                    todos[find_todokey(todo.id)] = {
                        id      : todo.id,
                        content : todo.content,
                    };
                    router.push('/');
                }
            }
        });
    
        //削除
        var DeleteTodo  = Vue.extend({
            template: "#delete-todo",
            data: function() { 
                //routerで指定したtodo_idを元に、対象のTodoを絞り込む
                //TIPS:$route.params.[属性値]でURLの値を抜き取る
                return { todo: find_todo(this.$route.params.todo_id) };
            },
            methods: {
                delete_todo: function() {
                    //TIPS:.splice()で対象要素のキーから1つを取り除く
                    todos.splice( find_todokey(this.$route.params.todo_id), 1);
                    router.push("/");
                }
            }
        });
    
    
        //ルーティング
        var router = new VueRouter({routes:[
            { path: '/', component: List},
            { path: '/todo/:todo_id', component: Todo, name: 'todo'},
            { path: '/add-todo', component: AddTodo},
            { path: '/todo/:todo_id/delete', component: DeleteTodo, name: 'todo-delete'},
            { path: '/todo/:todo_id/edit', component: UpdateTodo, name: 'todo-edit'},
        ]});
        app = new Vue({
            router:router
        }).$mount('#app')
    
    });


動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 14-44-59.png" alt="vue.jsで作られたTODOが表示されている"></div>


## コードの解説

まずhtml。`<router-view></router-view>`に`<template></template>`で定義した内容を、`VueRouter`で定義したルート情報に基づき、切り替え表示させている。

    //ルーティング
    var router = new VueRouter({routes:[
        { path: '/', component: List},
        { path: '/todo/:todo_id', component: Todo, name: 'todo'},
        { path: '/add-todo', component: AddTodo},
        { path: '/todo/:todo_id/delete', component: DeleteTodo, name: 'todo-delete'},
        { path: '/todo/:todo_id/edit', component: UpdateTodo, name: 'todo-edit'},
    ]});
    app = new Vue({
        router:router
    }).$mount('#app')

上から一覧表示、個別表示、Todoの追加、Todoの削除、Todoの編集を意味する。それぞれ同`script.js`内で定義したコンポーネントを呼び出し、`name`はパスを逆引きする為にある。

コンポーネントとして定義されたのは5つ。`List`,`Todo`,`AddTodo`,`DeleteTodo`,`UpdateTodo`。`Vue.extend()`で定義されている。`Vue.extend()`の引数として定義されているオブジェクトには、対象となる要素を指定する`template`に加え、`data`と`methods`もしくは`computed`が定義されている。


### dataについて

`data`は`function()`と関数で定義されているが、これはコンポーネントのオブジェクトごとにデータを独立させる為にある。もし関数として定義されていない場合、全てのインスタンス(オブジェクト)に同じ値が入ってしまうためである。[vue.js公式でもコンポーネントにおいてはdataは関数でなければならない旨](https://jp.vuejs.org/v2/guide/components.html#data-%E3%81%AF%E9%96%A2%E6%95%B0%E3%81%A7%E3%81%AA%E3%81%91%E3%82%8C%E3%81%B0%E3%81%AA%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93)が記されている。

### methodsについて

`methods`にはコンポーネントのインスタンス(オブジェクト)が実行できるメソッドを定義する。例えば、`AddTodo`ではメソッド名`create_todo`で`this.todo`(同インスタンスの`data`にて定義された`todo`、即ちHTMLから受け取ったデータを入れるインスタンス)をスクリプト冒頭で定義した`todos`に追加している。

HTMLの追加用テンプレート(`#add-todo`)を見てみると、`v-on:submit="create_todo"`と`v-model="todo.content"`の2つの見慣れない属性が定義されている。これがフォーム送信時に`create_todo`というメソッドが実行され、`v-model`で定義した`todo.content`にやることが書かれる。メソッド実行時には`todo.content`を参照し、それを`todos`に追加されることでTodoの追加が成立しているのだ。後は、`router.push("/");`を実行することで、トップページにリダイレクトされる。

### computedについて

`script.js`にて一覧表示と検索を行う`computed`には検索語に一致した内容を返却する仕組みになっている。`.filter()`メソッドは条件式に合致するデータの配列を新たに作るものである。そこに、`search_key`が当てられている。`search_key`が空欄であれば全てを表示。何か指定があれば合致するもの全てを返却する。その`search_key`は一覧表示用テンプレートにて`v-model="search_key"`としてinputタグに指定されているため、同タグで入力が発生するたびに検索が機能する。

しかし、ここで疑問が出てくる。`computed`と`methods`の違いはなんなのかと。`computed`はvue.jsにおいては算出プロパティと呼ばれている。算出プロパティはリアクティブな依存関係に基づきキャッシュされる特性がある。つまり、`data`に`todos`の配列をキャッシュしておくことで、同様の内容が呼び出された時、そのキャッシュを再利用することで高速化を図っている。これは`todos`の配列が増えれば増える度、キャッシュによる処理速度高速化の恩恵が得られる。もし、この検索処理がメソッドだった場合、`todos`の配列が変化していないにもかかわらず、メソッドが実行されるたびにデータがメモリに格納されて、配列データが大きければ大きいほど簡単にメモリリークする。

しかし、`computed`に関しては`methods`で完全に代用できるので、vue.jsに慣れないうちは`methods`を使っていき、`methods`内で扱うデータがリアクティブなデータであると気づいたら`computed`に書き換えるように施したほうが余計なバグを生み出さなくて済むだろう。

`computed`と`methods`の違いに関しては[公式](https://jp.vuejs.org/v2/guide/computed.html#%E7%AE%97%E5%87%BA%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3-vs-%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89)でも[qiita](https://qiita.com/okerra/items/cda378436ed060e83a8c)でも解説がされている。


## 結論

vue.jsはコンポーネントと呼ばれる部品を作り、それに機能を持たせ組み合わせることで、ひとつのシステムを構築している。故にjQueryとは違って、開発時にJSとHTMLを行ったり来たりしなければならない。

しかしこの構造のおかげで、HTMLを閲覧した時に、JS側でどのような処理が行われているか、JSを見なくてもわかる。それは保守性を高め、コードの可読性を容易にさせる点で優れているとvue.js公式に書かれてあるが。いかんせん、vue.jsの仕組みを理解するまでが難しい。




