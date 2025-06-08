---
title: "【scikit-learn】ロジスティック回帰は二値分類問題に、線型回帰は回帰問題に【教師あり学習】"
date: 2025-05-30T12:00:25+09:00
lastmod: 2025-05-30T12:00:25+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","教師あり学習","分類問題","回帰問題" ]
---


## 前提知識

- 分類問題: データを元にカテゴリを予測する問題。とりわけ2つのカテゴリに分ける分類問題を二値分類問題という。
- 回帰問題: データを元に連続値(価格、重量、カロリーなど)を予測する問題。

### ロジスティック回帰は、「回帰」の名がついているが「二値分類問題」

ロジスティック回帰は、言葉通り回帰を使うため回帰問題であるように思えるが、実は二値分類問題に使われるモデルである。

一方、線型回帰は連続値を予測するために使う。

ちなみに二値分類問題は、YesかNoか、生存か死亡か、陽性か陰性かの2つを分類するために使う。アイリスの品種など多クラスに分類する問題には使えない。


## ロジスティック回帰のサンプルコード

以下は、タイタニックのデータから、生存したか死亡したかを二値分類をするコードである。

```
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# タイタニックのデータを読み込み
df = sns.load_dataset('titanic')

# データ前処理（シンプルな例）
df = df[['survived', 'sex', 'pclass', 'age']].dropna()
df['sex'] = df['sex'].map({'male': 0, 'female': 1})

X = df[['sex', 'pclass', 'age']]
y = df['survived']

# 学習と評価
X_train, X_test, y_train, y_test = train_test_split(X, y)
model = LogisticRegression()
model.fit(X_train, y_train)

# 予測と評価
y_pred = model.predict(X_test)
print("正解率:", accuracy_score(y_test, y_pred))
print("予測:", y_pred[:10])
```





## 線型回帰のサンプルコード

```
from sklearn.datasets import make_regression
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# データ作成
X, y = make_regression(n_samples=100, n_features=1, noise=10)
X_train, X_test, y_train, y_test = train_test_split(X, y)

# 線型回帰
model = LinearRegression()
model.fit(X_train, y_train)

print("予測値:", model.predict(X_test[:5]))
```




## 学習と評価の流れ

とりわけscikit-learnにおいて、どの機械学習アルゴリズムであれ、

1. アルゴリズム選定(アルゴリズムのクラスのオブジェクトを作る)
1. .fit() で学習データを渡す
1. .predict() でテストデータを予測する

この基本的な流れは変わらない。

```
model = アルゴリズムのクラス()
model.fit(X_train, y_train)
pred = model.predict(X_test)
```

それ故に、複数のアルゴリズムから最良のものを探すことは容易に実現可能である。

以下は、ロジスティック回帰、ランダムフォレスト、SVC の3つから、正解率を評価している。

```
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

models = {
    'Logistic Regression': LogisticRegression(),
    'Random Forest': RandomForestClassifier(),
    'SVM': SVC()
}

for name, model in models.items():
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    acc = accuracy_score(y_test, predictions)
    print(f'{name}: Accuracy = {acc:.2f}')
```








