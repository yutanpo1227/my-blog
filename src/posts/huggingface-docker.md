---
title: "HuggingFace SpaceをAPIサーバーとして使う その1"
date: "2025-02-05"
tags: ["HuggingFace", "Docker", "AI"]
---

# 前提

この記事では、HuggingFace Space を app としてではなく API サーバーとして使う方法を扱う。

もともとインターンで HuggingFace Inference Endpoints を使ってモデルの API 提供を行っていたのだが、エンドポイントを起動するたびに０からビルドしなくてはならず時間がかかっていたためビルドキャッシュが残る HuggingFace Space の DockerSDK を使った API サーバーの構築に着手した。

https://huggingface.co/docs/hub/spaces-sdks-docker

# 必要知識

- HuggingFace Space の利用
- Docker のセットアップ

# 今回のゴール

- HuggingFace Space で API サーバーを建てて外部から叩く
- 今回は GPU は取り扱わない(次回以降)

# HuggingFace Space を作成する

![](/images/huggingface-docker/create-space.png)
作成する際に DockerSDK を選択する。また今回は Public で作成する。

# HuggingFace Space のセットアップ

Space のリポジトリを clone する

```bash
git clone https://huggingface.co/spaces/${ユーザー名}/${Space名}
```

requirements.txt の作成

```python
fastapi
uvicorn
...必要なパッケージ
```

app.py の作成

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/generate")
def generate(text: str):
    return {"output": text}
```

今回はテストのために`/generate`で受け取ったテキストをそのまま返す API とする

Dockerfile の作成

```Dockerfile
FROM python:3.9

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . /app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

GPU を利用する場合はここで cuda を使える環境にする必要がある(今回は取り扱わない)

ここまで出来たら push する。Docker のビルドとコンテナの作成が行われるので待機
![](/images/huggingface-docker/building.png)

終わるとステータスが Running になって以下のようになる
ルートページは何も設定してないので`{"detail":"Not Found"}`になる
![](/images/huggingface-docker/running.png)

これで HuggingFace Space の設定は完了

# API を叩いてみる

実際に Python から API を叩いてみる

```python
import requests

user_name = ""
repo_name = ""

res = requests.get(
    f'https://{user_name}-{repo_name}.hf.space/generate',
    params={
        'text': 'Hello, World!'
    }
)
print(res.json())
```

BaseURL は`https://${user_name}-${repo_name}.hf.space`のようになっているので適宜設定
実行してみると

```bash
$ python main.py
{'output': 'Hello, World!'}
```

ちゃんとパラメータの text に設定した文字列が返ってきた。完成

# まとめ

本記事では、HuggingFace Space の DockerSDK を使った API サーバーの作成を行った。
今後は、実際に今までの Inference Endpoint から移行するため、cuda の環境作成とモデルの動作する API としてこれを改良していく。
