---
title: "DRF+ReactのSPAで簡易掲示板を作る"
date: 2024-08-12T10:33:30+09:00
lastmod: 2024-08-12T10:33:30+09:00
draft: false
thumbnail: "images/drf-react.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","React","SPA" ]
---

最近(2018年以降)の開発では関数ベースのコンポーネントが主流のため、一部を書き換えた。

## React

### App.js

```
import React, { useState, useEffect } from "react";

import Modal from "./components/Modal";
import axios from "axios";

const App = () => {
    const [topicList, setTopicList] = useState([]);
    const [modal, setModal] = useState(false);
    const [activeTopic, setActiveTopic] = useState({ comment: "" });

    // コンポーネントがレンダリングされるときに実行する
    useEffect(() => {
        refreshList();
    }, []);
    
    // ページロード
    const refreshList = () => {
        axios
            .get("/api/topics/")
            .then((res) => setTopicList(res.data))
            .catch((err) => console.log(err));
    };

    const handleSubmit = (topic) => {
        if (topic.id) {
            axios
                .put(`/api/topics/${topic.id}/`, topic)
                .then(() => refreshList())
                .catch((err) => console.log(err));
        } else {
            axios
                .post("/api/topics/", topic)
                .then(() => refreshList())
                .catch((err) => console.log(err));
        }
        closeModal();
    };

    const handleDelete = (topic) => {
        axios
            .delete(`/api/topics/${topic.id}/`)
            .then(() => refreshList());
    };

    const openModal = (topic) => {
        if (topic.id) {
            setActiveTopic(topic);
        } else {
            setActiveTopic({ comment: "" });
        }
        setModal(true);
    };

    const closeModal = () => {
        setActiveTopic({ comment: "" });
        setModal(false);
    };


    // \n を <br> にする 
    const linebreaksbr = (string) => {
        return string.split('\n').map((topic, index) => (
            <React.Fragment key={index}>
                {topic}
                {index !== string.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const renderItems = () => {
        return topicList.map((topic) => (
            <div className="border" key={topic.id}>
                <div>{topic.id}</div>
                <div>{linebreaksbr(topic.comment)}</div>
                <div className="text-end">
                    <input type="button" className="mx-1 btn btn-success" value="編集" onClick={() => openModal(topic)} />
                    <input type="button" className="mx-1 btn btn-danger" value="削除" onClick={() => handleDelete(topic)} />
                </div>
            </div>
        ));
    };

    return (
        <>
            <h1 className="bg-primary text-white text-center">簡易掲示板</h1>
            <main className="container">
                <input className="btn btn-primary" type="button" onClick={() => openModal(activeTopic)} value="新規作成" />
                {modal ? (
                    <Modal 
                        activeTopic={activeTopic}
                        handleSubmit={handleSubmit}
                        closeModal={closeModal} 
                    />
                ) : null}
                {renderItems()}
            </main>
        </>
    );
};

export default App;
```



### component/Modal.js


```
import React, { useState, useEffect } from "react";

const Modal = ( { handleSubmit, activeTopic, closeModal } ) => {

    const [topic, setTopic] = useState(activeTopic);

    useEffect(() => {
        setTopic(activeTopic);
    }, [activeTopic]);

    const handleChange    = (e) => {
        let { name , value }    = e.target;
        setTopic({ ...topic, [name]: value });
    }

    return ( 
        <>
            <div className="modal_area" >
                <div className="modal_bg_area" onClick={closeModal}></div>
                <div className="modal_content_area">
                    <form>
                        
                        { activeTopic.id ? ( <h2>編集</h2> ) : ( <h2>新規作成</h2> ) }
                        <textarea className="form-control" name="comment" onChange={handleChange} value={topic.comment}></textarea>
                        <input className="btn btn-success" type="button" onClick={ () => handleSubmit(topic) } value="保存" />
                    </form>
                </div>
            </div>
        </>
    );

}
export default Modal;
```



## ソースコード

https://github.com/seiya0723/react-django-startup-bbs-function


