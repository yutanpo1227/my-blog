---
title: "M5UnitVを使い始める"
date: "2022-05-01"
tags: ["M5Stack", "ロボット"]
---

![UnitV](/images/m5-unitv/unitV.jpeg)

# MaixPy IDE での開発

[MaixPyIDE](http://dl.sipeed.com/shareURL/MAIX/MaixPy/ide/v0.2.5)
ここから MaixPy をダウンロードしました。
まずは手順に乗っ取り、Helloworld.py を実行したところ問題なく実行することができました。

# とりあえず処理を書いてみる

Micro Python での画像処理は以前 OpenMV で行っていてほとんど環境も変わっていないため、問題なくプログラムを書けそうです。とりあえず今回は初回なので AI 要素は使わず、シンプルに色検出を行ってみました。

```python
import sensor, image, time,ustruct

thresholds = [
(0, 100, -128, -30, -128, 127)  #検出する色の閾値（LAB空間）
]

sensor.reset()  #センサーの設定
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_brightness(-1)
sensor.skip_frames(30)
sensor.set_auto_gain(False)

maxrect = 0
x_data = 0
y_data = 0

while(True):
        rectarray = []
        img = sensor.snapshot() #センサーから画像を取得

        for blob in img.find_blobs(thresholds, pixel_threshold = 100, area_threshold = 100, merge = True, margin = 5):
            rectarray.append(list(blob.rect()))     #見つかった閾値内のオブジェクトをリストに格納

        try:
            maxrect = max(rectarray,key=lambda x: x[2]*x[3])    #配列の中から面積の一番大きい物を選定
            img.draw_rectangle(maxrect)     #オブジェクトを囲う四角形の描画
            x_data = maxrect[0]+(maxrect[2]/2)  #中心のx座標の算出
            y_data = maxrect[1]+(maxrect[3]/2)  #中心のy座標の算出

        except ValueError as err:   #オブジェクトがひとつも見つからなかった場合の例外処理
            pass

        x = int((x_data / 320) * 70.8)  #視野角に合わせた座標の変換
        y = int(((y_data - 240) / -240) * 55.6)

        print("x = ",x,"   y = ",y)
```

指定した色閾値内の物体を探し一番面積の大きいものを抽出するというシンプルな物です。
![](/images/m5-unitv/unitVprog.png)

今回はおーいお茶のキャップを使用しました。ちゃんとキャップを囲う四角形が描画され中心座標がシリアルに出力されました。

# 次回以降について

とりあえずカメラとして使用することはできたので次回以降 M5Stack との通信や AI 機能を用いた物体認識などをやっていこうと思います。
