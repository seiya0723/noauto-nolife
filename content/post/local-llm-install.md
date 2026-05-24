---
title: "UbuntuにローカルLLMをインストールし、Python上で動作させる(Ollama)"
date: 2026-05-24T14:44:41+09:00
lastmod: 2026-05-24T14:44:41+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "追記予定","AI開発","LLM" ]
---


## Ollama

Ollama はGoogle DeepMind によって開発されたローカルで利用できるLLM。

入力した情報を外部に公開したり

```
curl -fsSL https://ollama.com/install.sh | sh
```

仮想環境下で以下を実行する。

```
pip install ollama
```

以下コードを実行する。

```
import ollama

# 1. システムプロンプト（末尾のカンマを削除し、内容を強化）
system_prompt = { 
    'role': 'system',
    'content': (
        "【絶対ルール】必ず日本語だけで回答してください。英語は一切使用禁止です。"
    )
}

# 2. 会話の履歴を管理するリスト（最初にシステムプロンプトを入れておく）
conversation_history = [system_prompt]

# 初回の自己紹介（履歴に追加して送信）
conversation_history.append({'role': 'user', 'content': 'まずは自己紹介をお願いします。'})

response = ollama.chat(
    model='gemma2:2b', 
    messages=conversation_history,
    options={'temperature': 0.5}  # ランダム性を下げて指示に従いやすくする
)

# AIの返答を履歴に追加
conversation_history.append(response['message'])
print(f"Bot: {response['message']['content']}\n")


# 連続会話のループ
while True:
    user_post = input("Message: ")
    if user_post.lower() in ['exit', 'quit', '終了']:
        print("会話を終了します。")
        break
        
    if not user_post.strip():
        continue

    # ユーザーの入力を履歴に追加
    conversation_history.append({'role': 'user', 'content': user_post})

    # これまでの履歴をすべて送信
    response = ollama.chat(
        model='gemma2:2b', 
        messages=conversation_history,
        options={'temperature': 0.5}
    )

    # AIの返答を履歴に追加
    conversation_history.append(response['message'])
    print(f"Bot: {response['message']['content']}\n")
```


