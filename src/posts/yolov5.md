---
title: "YOLOv5を使ってロボットを検出する"
date: "2023-03-10"
tags: ["Python", "YOLO", "ロボット", "AI"]
---

![Top](/images/yolov5/yolov5.gif)

今回はサッカーロボットを作る上で正面のロボットを検出できれば強いなと思い**YOLOv5**を使って転移学習を行い物体検出を行ってみたいと思います。

結論から言うと、YOLOv5 はとても強力なモデルでしたがモデルが大きく推論に時間がかかるためロボットへの搭載はできませんでしたが、PC 上では実行できたため今後 Jetson Orin Nano などが手に入ればもう一度検証してみたいと思います。

# 参考にしたサイト

[https://qiita.com/suginaga/items/468ea7d232b8a24501bf](https://qiita.com/suginaga/items/468ea7d232b8a24501bf)

[https://farml1.com/yolov5/](https://farml1.com/yolov5/)

# YOLOv5 とは

YOLOv5 とは、**YOLO**(You Only Look Once)と呼ばれる物体検出モデルの一つで、中でも処理速度、精度のバランスが良いと言われているモデルです。

# YOLOv5 の準備

まずは、YOLOv5 を GitHub からクローンします。
[https://github.com/ultralytics/yolov5](https://github.com/ultralytics/yolov5)

次に、以下のコードを実行し必要なライブラリをインストールします。

```bash
$ pip install -r requirements.txt
```

# データセット用の画像の収集

学習を行うためのデータセットの準備を行います。
今回はサッカーロボットを検出したいためロボットの画像を準備します。
準備する方法として手作業で集めるのも良いですが、今回は以下の Python コードで Google 検索画像を自動で 100 枚収集し使います。

```python
from icrawler.builtin import BingImageCrawler
crawler = BingImageCrawler(storage={"root_dir": "保存フォルダ名"})
crawler.crawl(keyword="画像の検索ワード", max_num=100)
```

> ここら辺は著作権などが絡んできそうですが、調べたところデータセットとして画像を使う場合は著作権に関わらず使えるとのことでした。
> (生成系の AI だとまずいらしい)

# アノテーション作業

集めた画像からアノテーション作業を行い、教師データを作成します。
アノテーション作業には、**labelImg**を使います。labelImg の使い方はこちらの記事を参考にしました。
[](https://laid-back-scientist.com/labelimg)

> アノテーションとは、画像や動画などのデータに対して、そのデータに含まれる物体の位置や種類などを記述することです。

# データセットの配置

ここまで作成したデータセットを以下のように yolov5 フォルダに配置します。

```
img   ┬ img.yaml
　　　 ｜　
　　　 ├ test  ┬ ***.jpg（画像）
　　　 ｜　　　　├ ***.txt（ラベリングデータ）
　　　 ｜　　　　├ ***.txt（画像）
　　　 ｜　　　　├ ***.txt（ラベリングデータ）
　　　 ｜　　    ・・・
　　　 ｜　　　　　
　　　 ├ train  ┬ ***.jpg（画像）
　　　 ｜　　 　　├ ***.txt（ラベリングデータ）
　　　 ｜　　　 　├ ***.txt（画像）
　　　 ｜　　　 　├ ***.txt（ラベリングデータ）
　　　 ｜　　　   ・・・
　　　 ｜　　　　　
　　　 └ val   ┬ ***.jpg（画像）
　　　  　　　 　├ ***.txt（ラベリングデータ）
　　　  　 　　　├ ***.txt（画像）
　　　  　　　 　├ ***.txt（ラベリングデータ）
　　　  　　　　  ・・・
```

img.yaml は以下のように記述します。

```yaml
# train and val data as 1) directory: path/images/, 2) file: path/images.txt, or 3) list: [path1/images/, path2/images/]
train: trainフォルダのパス
val: valフォルダのパス
test: テストフォルダのパス

# number of classes
nc: 2

# class names
names: ["Robot", "Goal"]
```

# 学習

学習を行います。

学習には yolov5 ディレクトリ内で以下のコマンドを実行します。

```bash
$ python train.py --data img/img.yaml --weights yolov5s.pt --epochs 200
```

後は完了するのを待つだけです。

# 推論の実行

最後に作成したモデルを使って推論を行います。

推論には以下のコマンドを実行します。

```bash
$ python detect.py --source 0 --weights yolov5s.pt
```

> リアルタイムでカメラを用いて推論する場合は--source に 0 を指定し、画像に対して行う場合は画像のパスを指定します。

結果は以下のようになりました。

gif なので分かりづらいですが、ちゃんとロボットを認識できています。(使用したロボットは未学習のもの)
![result](/images/yolov5/yolov5.gif)
