---
title: "HuggingFace SpaceをAPIサーバーとして使う その2[GPUの利用]"
date: "2025-02-23"
tags: ["HuggingFace", "Docker", "AI"]
---

# 前提

この記事では、HuggingFace Space を app としてではなく API サーバーとして使う方法を扱う。
もともとインターンで HuggingFace Inference Endpoints を使ってモデルの API 提供を行っていたのだが、エンドポイントを起動するたびに０からビルドしなくてはならず時間がかかっていたためビルドキャッシュが残る HuggingFace Space の DockerSDK を使った API サーバーの構築に着手した。
https://huggingface.co/docs/hub/spaces-sdks-docker
前回の記事では API サーバーの作成までを行ったが、GPU の利用までは触れなかったため今回の記事ではここを扱う。今回の記事は前回の記事と重複する内容は記述しないので適宜参照よろしくお願いします。

↓ 前回の記事
[](https://y-blog-livid.vercel.app/posts/huggingface-docker)

# 必要知識

- HuggingFace Space の利用
- Docker のセットアップ

# 今回のゴール

- GPU を利用できる API サーバーを Huggingface Space 上で作成する

# Space で利用する GPU の選択

![](/images/huggingface-docker2/select-gpu.png)
Space の Settings タブにある Space Hardware から利用したい GPU を選択する。(デフォルトでは CPU basic になっている)

今回は`A10G small`を選択。

# Dockerfile の編集

```Dockerfile
FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

ARG DEBIAN_FRONTEND=noninteractive

RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    build-essential \
    curl \
    python3.9 \
    python3-pip \
    git \
    ffmpeg

# Set the working directory to /code
WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=user . $HOME/app

# Start the FastAPI app on port 7860, the default port expected by Spaces
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

前回から大きく変わった点はベースイメージに`nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04`を指定している点である。

このイメージは、NVIDIA が提供する公式の CUDA コンテナで、GPU を活用するアプリケーションの開発環境として利用される。

# app.py の編集

```python
from fastapi import FastAPI
import subprocess
import torch
import os
import huggingface_hub
import subprocess
import sys
import requests

# Create a new FastAPI app instance
app = FastAPI()

@app.get("/")
def home():
    device_name = torch.cuda.get_device_name(0) # GPUデバイス名の取得

    torch_version = str(torch.__version__) # torchのバージョンの取得

    info = {
        device_name,
        torch_version
    }

    return info
```

今回は GPU がプログラム上から見えていることを確認するため`torch.cuda.get_device_name(0)`で cuda のデバイス名を表示、また現在の torch のバージョンをルートページに表示するようにした。

# Space の起動

コードの変更をコミットすると自動でビルドが始まるのですが、GPU を選択すると画像のように`Building on {GPU名}`となる。
![](/images/huggingface-docker2/building.png)
ビルドが終わると`Running on {GPU名}`となる。
![](/images/huggingface-docker2/running.png)
Space が起動すると、ちゃんとルートページに使用している GPU 名と現在の torch のバージョンが表示された！

# まとめ

本記事では、前回の記事の続きとして HuggingFace Space 上で GPU を利用できる API サーバーの作成を行った。
GPU 活用のための環境構築: NVIDIA が提供する公式 CUDA イメージ（nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04）をベースに採用することで、最新の GPU 計算環境と cuDNN ライブラリを手軽に利用可能となった。
今回の実装で、HuggingFace Space を活用した API サーバー構築の基盤が整った。GPU を活用した様々な機械学習モデルの推論や処理に対応できるサーバーの開発が期待できる。
