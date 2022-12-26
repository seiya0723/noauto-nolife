---
title: "【ReactNative + Expo】スマホアプリでHelloWorldをやってみる【iOS、Android両対応】"
date: 2022-12-26T08:15:18+09:00
lastmod: 2022-12-26T08:15:18+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "others" ]
tags: [ "ReactNative","スマホアプリ" ]
---

ReactNativeを使うことで、スマホアプリが簡単に作れる。

今回はExpoというReactNativeの開発をサポートするフレームワークを使う。

これにより、iOSとAndroid両方に対応したスマホアプリを更に簡単に作ることができる。

## 流れ


1. Expoをインストールする
1. Expoを使ってプロジェクトを作る
1. スマホにExpo Goをインストールする(デバッグ用)
1. ビルドサーバーを立ち上げ、Expoアプリから読み込む


## Expoをインストールする

    npm install -g expo-cli

UbuntuなどのLinuxの場合は、sudoをつける。

    sudo npm install -g expo-cli


## Expoを使ってプロジェクトを作る

    expo init react-native-app1


この時、とりあえず動かしたい場合は、blankを選ぶと良いだろう。


<div class="img-center"><img src="/images/Screenshot from 2022-12-26 13-42-41.png" alt=""></div>

## スマホにExpo Goをインストールする(デバッグ用)

[iPhone](https://apps.apple.com/us/app/expo-go/id982107779)と[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)にそれぞれExpo Goをインストールしておく。

## ビルドサーバーを立ち上げ、Expoアプリから読み込む


    npm start

ビルドサーバーを立ち上げる。

QRコードが表示されるので、Expo GoからQRコードを読み込んでビルドサーバーにアクセスする。

<div class="img-center"><img src="/images/Screenshot from 2022-12-26 13-40-19.png" alt=""></div>


このように表示されたらHelloWorldは完了。


<div class="img-center"><img src="/images/2022-12-26 13.33.25.png" alt=""></div>



ちなみに、App.jsの内容を以下のように書き換えると、HelloWorldになる。

```
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
    return (
        <View style={styles.container}>
        <Text>HelloWorld!!!</Text>
        <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
```

普通のReactの構文と大して変わらないので作りやすいと思う。

内容を書き換えたら、自動的にスマホのアプリがリロードされる。

もしリロードされない場合はスマホをシャカシャカ振ってデバッグメニューを出してリロードする。


下記で、ボタンを押すたびに加算の関数を実行する事ができる。

```
import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default class App extends React.Component {

    constructor(props){
        super(props);
        this.state  = { count: 0 }
    }


    onPressButton = () => {
        this.setState({ count: this.state.count + 1 });
    }

    render() {
        return (
            <View style={styles.container}>
            <Button title="+1" onPress={ this.onPressButton } />
            <Text>{ this.state.count }</Text>
            <StatusBar style="auto" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
```

ReactNativeではreturnの中にdivタグなどを追加してしまうとエラーが出る。

単純にdivタグなどを追加できるReactとは若干仕様が異なるようだ。

## 結論

今やJavaScriptさえあれば簡単にスマホアプリが作れる時代になった。

MacOSも必要なくiOSアプリが作れるのは非常にありがたい。

もっとも、現時点ではウェブアプリとして作り、スマホはブラウザからアクセスした場合と大して変わりはないので、早くスマホアプリ特有のデバイス情報へのアクセスやバックグラウンドでの動作等をやっておきたいところだ。

詳細な作り方は下記書籍に掲載されてある。参考されたし。

[基礎から学ぶReact Native入門](https://www.amazon.co.jp/dp/4798169560/?tag=m68371ti-22)


