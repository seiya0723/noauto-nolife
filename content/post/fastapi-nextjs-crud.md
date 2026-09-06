---
title: "FastAPI+Next.js+Ollama(Gemma3:12B)でChatGPT風アプリを作る"
date: 2026-08-29T08:48:08+09:00
lastmod: 2026-08-29T08:48:08+09:00
draft: false
thumbnail: "images/fastapi.jpg"
categories: [ "サーバーサイド" ]
tags: [ "FastAPI","SQLAlchemy","Next.js","ローカルLLM","追記予定" ]
---

FastAPIとNext.jsの経験がない中で、チュートリアル的な意味で作った。

# 【フェーズ1】FastAPIでStreamResponseをするローカルLLM(Ollama)

構成は以下の通り

```
.
├── main.py
├── routers
│   └── chat.py
├── crud.py
├── models.py
├── schemas.py
├── database.py
├── chat.db
└── requirements.txt
```

全体像はこうなる。

<div class="img-center"><img src="/images/FastAPI構成.jpg" alt=""></div>

以下、ファイルごとの役割

|ファイル・フォルダ|役割|
|----|----|
|main.py|サーバー起動用|
|routers|エンドポイントフォルダ|
|chat.py|チャットGPT風アプリのエンドポイント|
|crud.py|models.pyを使ってのDB操作の関数|
|models.py|SQLAlchemyのORMクラスの一覧|
|schemas.py|クライアントとのやり取りに使用されるスキーマ一覧|
|database.py|DBの接続設定|

Djangoに例えるなら。

- main.py → manage.py
- chat.py → urls.py + views.py
- crud.py → views.py (一部の処理)
- models.py → models.py
- schemas.py → forms.py
- database.py → settings.py 

と例えれば、わかりやすいだろう。

また、chat.pyに加え、以下3つはアプリが増えたらフォルダ分けをしておくべきかもしれない。

- crud.py
- models.py
- schemas.py

なぜならDjangoであればこの3つの機能はアプリ単位で分割されているからだ。

## main.py

```
from fastapi import FastAPI

from database import init_db
from routers import chat

# DB初期化。
init_db()

# ルーターの読み込み
app = FastAPI()
app.include_router(chat.router)

"""
## エンドポイント

- /api/chat/sessions | GET | チャットセッションをすべて取り出す
- /api/chat/sessions | POST | 新規でチャットセッションを開始(メッセージは送信しない)
- /api/chat/sessions/{id} | GET | チャットセッションを1件取り出す
- /api/chat/sessions/{id}/messages | GET | チャットセッションに紐づくメッセージをすべて取り出す。
- /api/chat/sessions/{id}/messages | POST | チャットセッションに紐づくメッセージを投稿

## 注釈

新規でチャットセッションを開始する時、この2段構えでやる。

/api/chat/sessions | POST | でセッションを作成後
/api/chat/sessions/{id}/messages | POST | でメッセージを送信する

既存のチャットセッションに対して送信をするときは、このリクエストのみ。

/api/chat/sessions/{id}/messages | POST | でメッセージを送信する
"""
```

## routers/chat.py

```
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from ollama import AsyncClient
from sqlalchemy.orm import Session

import crud
import schemas
from database import SessionLocal, get_db

router = APIRouter(prefix="/api/chat", tags=["chat"])

LLM_MODEL = "gemma3:12b"
client = AsyncClient(host="http://localhost:11434")

system_prompt = {
    "role": "system",
    "content": (
        """
【絶対ルール】
・必ず日本語だけで回答してください。英語は一切使用禁止です。
"""
    ),
}


@router.get("/sessions", response_model=list[schemas.ChatSessionRead])
def get_sessions(db: Session = Depends(get_db)):
    return crud.get_chat_sessions(db)


@router.post("/sessions", response_model=schemas.ChatSessionRead)
def create_session(request: schemas.ChatSessionCreate, db: Session = Depends(get_db)):
    return crud.create_chat_session(db, request.session_name)


@router.get("/sessions/{session_id}", response_model=schemas.ChatSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    chat_session = crud.get_chat_session(db, session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return chat_session


@router.get("/sessions/{session_id}/messages", response_model=list[schemas.ChatMessageRead])
def get_messages(session_id: int, db: Session = Depends(get_db)):
    chat_session = crud.get_chat_session(db, session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return crud.get_chat_messages(db, session_id)


async def generate_response(chat_session_id: int, prompt: str, history: list[dict]):
    messages = [system_prompt] + history + [{"role": "user", "content": prompt}]

    response = await client.chat(
        model=LLM_MODEL,
        messages=messages,
        stream=True,
    )

    # SSEで部分的に返却
    generated_text = ""
    async for chunk in response:
        text = chunk["message"]["content"]
        generated_text += text
        yield text

    # ストリーミング完了後の書き込みは依存注入のセッションが閉じている可能性があるため専用セッションを使う
    db = SessionLocal()
    try:
        crud.create_chat_message(db, chat_session_id, "assistant", generated_text)
    finally:
        db.close()


@router.post("/sessions/{session_id}/messages")
def post_message(session_id: int, request: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    chat_session = crud.get_chat_session(db, session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # 現在の投稿より前の履歴を取得
    history = [
        {"role": message.role, "content": message.content}
        for message in crud.get_chat_messages(db, session_id)
    ]

    # ユーザーの投稿を登録
    crud.create_chat_message(db, session_id, "user", request.prompt)

    return StreamingResponse(
        generate_response(session_id, request.prompt, history),
        media_type="text/plain",
    )
```

クライアントから受け取ったリクエストに応じて処理をする。

基本形は以下の通り
```
from sqlalchemy.orm import Session
from fastapi import APIRouter

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.get("/sessions", response_model=list[schemas.ChatSessionRead])
def get_sessions(db: Session = Depends(get_db)):
    return crud.get_chat_sessions(db)
```

APIRouterはエンドポイントを機能ごとに分割・整理するための仕組み。

インスタンスのHTTPメソッドを呼び出し、デコレーターとすることでエンドポイントを作ることができる。

```
@router.get([エンドポイント], response_model=[レスポンス用のスキーマ])
def [任意の関数名]( Depends(DB接続セッション) )
```

更に、Dependsを使えば、処理に必要なセッションを前もって与えることができる。これが依存性注入である。今回はSQLAlchemy のセッションを引数にしている。

パスパラメータを入れたい場合はエンドポイント内に`{}`を入れる。関数内に引数として同名のパラメータ名を受取する。

```
@router.get("/sessions/{session_id}", response_model=schemas.ChatSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    chat_session = crud.get_chat_session(db, session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return chat_session
```

仮に、`/sessions/` の場合このエンドポイントとマッチせず実行はされない。`/sessions/1` は実行される。

もし、入力任意のクエリストリングにしたい場合。デコレータの引数に`{}`を指定せず、関数の引数にだけ指定をする。

```
@router.get("/sessions/", response_model=schemas.ChatSessionRead)
def get_session(session_id: int | None=None, db: Session = Depends(get_db)):
    chat_session = crud.get_chat_session(db, session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return chat_session
```

この場合
```
/sessions
/sessions?session_id=10
```
の両方を受取できる。

```
    chat_session = crud.get_chat_session(db, session_id)
```

このcrudは後述のDB操作系モジュール。SQLAlchemy のセッションと条件(今回はチャットセッションのID)を与えている。


## crud.py 

```
from sqlalchemy.orm import Session

import models


# セッションの取得
def get_chat_sessions(db: Session):
    return db.query(models.ChatSession).order_by(models.ChatSession.id.asc()).all()

# セッションの取得(id指定)
def get_chat_session(db: Session, chat_session_id: int):
    return db.get(models.ChatSession, chat_session_id)

# セッションの作成
def create_chat_session(db: Session, session_name: str):
    chat_session = models.ChatSession(session_name=session_name)
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    return chat_session

# チャットメッセージの取得
def get_chat_messages(db: Session, chat_session_id: int):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.chat_session_id == chat_session_id)
        .order_by(models.ChatMessage.id.asc())
        .all()
    )

# チャットメッセージの作成
def create_chat_message(db: Session, chat_session_id: int, role: str, content: str):
    chat_message = models.ChatMessage(chat_session_id=chat_session_id, role=role, content=content)
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    return chat_message
```

DBの操作をまとめている。いずれもSQLAlchemy のORMを使用している。

### SQLAlchemy のメソッドについて

頻出メソッドのまとめ

|メソッド|効果|
|----|----|
|`db.query(Model)`|Modelを使用してクエリ実行|
|`.filter(Model.field == 値)`|フィールドと値が一致する行を取り出す|
|`.order_by(Model.field.asc())`|フィールドを昇順で並び替え|
|`.all()`|結果をすべて取得する|
|`.first()`|最初の1件を取得、なければNone|
|`db.commit()`|トランザクションを確定してDB保存|
|`db.refresh(インスタンス)`|最新のORMオブジェクトへ読み込み直す。コミット後などに使用する|
|`.rollback()`|変更を取り消す。コミットをする前に実行する。|

## models.py

```
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class ChatSession(Base):
    __tablename__ = "chat_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="chat_session", cascade="all, delete-orphan", order_by="ChatMessage.id"
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    chat_session_id: Mapped[int] = mapped_column(ForeignKey("chat_session.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)

    chat_session: Mapped["ChatSession"] = relationship(back_populates="messages")
```

SQLAlchemy のORMクラスをまとめている。

Mapped[] ではこのフィールドのPython上の型を指定している。

一方でmapped_column() の第一引数で指定されている型はSQLAlchemy の型。主キーの場合はprimary_key を指定するだけで良い。(昔のSQLAlchemyはIntegerを指定していたが、もう必要はない。)


## schemas.py

schemas.py はクライアントとエンドポイントのやり取りで使用されるデータ型のまとめ。

```
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatSessionCreate(BaseModel):
    session_name: str


class ChatSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_name: str
    created_at: datetime


class ChatMessageCreate(BaseModel):
    prompt: str


class ChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chat_session_id: int
    role: str
    content: str
    created_at: datetime
```

今回レスポンスの前に、SQLAlchemy のORMを使っている。ORMのオブジェクトをそのまま返すことはできない。

そこでConfigDict を使う。ConfigDict によりORMからPydanticに変換し、レスポンスできるようにする。

### バリデーションについて

バリデーションはエンドポイント実行時に自動的に実行される。

もし問題があればそのままエラーレスポンスを返却する。

## database.py

DBの接続と、セッションを引き渡している。

```
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = "chat.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    import models  # noqa: F401 テーブル定義をBaseに登録するため
    Base.metadata.create_all(bind=engine)


# FastAPIの依存性注入用セッション
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

# 【フェーズ2】Next.jsでフロントエンドを作り、FastAPIと連携する
