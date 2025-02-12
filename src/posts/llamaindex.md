---
title: "Llama-Index を用いて GPT のプロンプトエンジニアリングをする"
date: "2023-06-08"
tags: ["ChatGPT", "自然言語", "AI"]
---

![Top](/images/llamaindex/llamaindex.png)

大規模言語モデルを使用するプロダクトに携われることになり学習を深めようと思い、Llama-Index を用いて GPT のプロンプトエンジニアリングをし論文や Web サイトに対してのクエリができるアプリケーションを作成しました。

# 構成

- Streamlit: Web アプリケーションの UI 作成
- Llama-Index: 文章のエンべディング(ベクトル化)、インデックス作成
- OpenAI GPT-4: クエリに対する文章の生成

# Llama-Index について

### 概要

Llama-Index とは ChatGPT のプロンプトエンジニアリングをするためのライブラリであり、様々なローダーを使用しファイルや Web サイト、Slack などのアプリケーションなどから文章を取り出しその文章に対して質問することができます。

また文章の理解にはエンべディングを行っています。エンベディングは、テキストの単語をベクトルに変換します。ベクトルは、テキストの意味を数値で表し、これにより、LlamaIndex は、テキストの意味を理解し、関連するテキストを検索することができます。ChatGPT と組み合わせて使用することで、ユーザーのクエリに対するより適切で関連性の高い応答を生成することができます。

簡単にまとめると以下のフローで実行されます。

1. ローダーで文章を取得
2. 文章をエンべディング(ベクトル化)
3. クエリに対して類似度の高い文章を検索
4. 検索された文章を ChatGPT に入力し応答を生成

- Roader について
  様々な種類の Roader を使うことで多くの種類のファイルやアプリケーションから文章を取得することができます。
  [LlamaHub](https://llamahub.ai/)
  に使用できるローダーの一覧とコードがあります。

- インデックスの作成
  Llama-Index ではクエリに対する文章を検索する際にインデックスという概念が存在します。
  インデックスの構成方法としてテキストを読み込んだ後チャンクという特定の文字数で文章を分割しそれぞれを Node と言われる構造体に格納します。その後、Node をエンべディングし、ベクトル化したものをインデックスとして保存します。

- インデックスの種類
  インデックスにも種類がありより文章の精度を上げるためにはクエリに対して適切なインデックスを選択する必要があります。

  詳細はこちらを参照してください。
  [](https://gpt-index.readthedocs.io/en/v0.6.8/guides/primer/index_guide.html#vector-store-index)

1. **List Index**
   ![ListIndex](/images/llamaindex/listindex2.png)
   ListIndex ではノードのリストを作成し、クエリに対して先頭から処理していき出力を最後に合成する。
   また上位 k 個のノードをに対して実行する方法や、ノードに対してキーワードフィルターを適用することもできる。
2. **Vector Store Index**
   ![VectorStoreIndex](/images/llamaindex/vectorstoreindex.png)
   VectorStoreIndex ではノードと文章のベクトルを保持し、クエリに対してベクトルの類似度を計算し、類似度の高い上位 k 個のものを合成し出力する。
   ※よく使われる
3. **Tree Index**
   ![TreeIndex](/images/llamaindex/treeindex.png)
   TreeIndex ではノードをツリー構造にし、クエリに対してツリーを探索し、類似度の高い上位 k 個のものを合成し出力する。使用する子ノードの数を指定できる。
4. **Keyword Table Index**
   ![KeywordTableIndex](/images/llamaindex/keywordtableindex.png)
   KeywordTableIndex ではノードとキーワードのテーブルを作成し、クエリのキーワードを使用しノードを選択し最終的に合成して出力する。

# Llama-Index の実装

今回は PDF と Web サイトから文章を取得し、その文章に対してクエリを行うアプリケーションを作成しました。
インデックスには VectorStoreIndex を使用し、クエリに対して類似度の高い文章を検索し ChatGPT に入力し応答を生成します。

```python
import os
import streamlit as st
from pathlib import Path
import tempfile
from llama_index import download_loader
from llama_index import GPTVectorStoreIndex, LLMPredictor
from langchain.chat_models import ChatOpenAI

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")  # APIキーを環境変数から取得

llm = ChatOpenAI(model_name="gpt-4")    # GPT-4を使用
llm_predictor = LLMPredictor(llm=llm)

if __name__ == "__main__":
    st.title("Llama Index")
    select = st.selectbox("",("URL", "PDF"))    # URLかPDFを選択

    if select == "URL":
        URL = [st.text_input("URLを入力してください")]  # URLを入力
        text = st.text_input("質問を入力してください")  # 質問を入力

        submit = st.button("送信")

        if submit and len(URL) > 0 and len(text) > 0:
            SimpleWebPageReader = download_loader("SimpleWebPageReader")    # SimpleWebPageReaderをダウンロード

            loader = SimpleWebPageReader()
            documents = loader.load_data(urls=URL)      # SimpleWebPageReaderを使用してURLからデータを取得

            index = GPTVectorStoreIndex.from_documents(documents=documents, text=text, llm_predictor=llm_predictor)     # Llama Indexを使用今回はVectorStoreIndexを使用
            query_engine = index.as_query_engine()      # クエリエンジンを作成

            st.write(query_engine.query(text).response)     # クエリに対する回答を表示

    if select == "PDF":
        file = st.file_uploader("PDFをアップロードしてください", type="pdf")        # PDFをアップロード
        text = st.text_input("質問を入力してください")      # 質問を入力

        submit = st.button("送信")

        if submit and file is not None and len(text) > 0:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:     # PDFを一時ファイルに保存
                fp = Path(tmp_file.name)
                fp.write_bytes(file.read())

                CJKPDFReader = download_loader("CJKPDFReader")      # CJKPDFReaderをダウンロード

                loader = CJKPDFReader()
                documents = loader.load_data(file=tmp_file.name)        # CJKPDFReaderを使用してPDFからデータを取得

                index = GPTVectorStoreIndex.from_documents(documents=documents, text=text, llm_predictor=llm_predictor)     # Llama Indexを使用今回はVectorStoreIndexを使用
                query_engine = index.as_query_engine()      # クエリエンジンを作成

                st.write(query_engine.query(text).response)     # クエリに対する回答を表示
```

streamlit を使用して簡単な UI を作成し、URL か PDF を選択し、質問を入力すると回答が表示されます。

# 実行結果

- URL に対する質問と回答
  ![実行結果1](/images/llamaindex/llama1.png)
  OpenMV という MicroPython を使用したカメラモジュールのドキュメントに対して、RGB 画像からグレースケール画像に変換する関数について質問してみました。
  正しい回答が返ってきていることが確認できます。
- PDF に対する質問と回答
  ![実行結果2](/images/llamaindex/llama2.png)
  こちらは言語モデルの Transformer の論文を引用し Transformer についてまとめてもらいました。

# まとめ

今回は Llama Index を使用して簡単な質問応答システムを作成しました。
Llama Index は簡単に使用できてかなり便利なツールであるためこれからもお世話になることが多そうです。今後は LangChain なども併用していき、対話型にできるようにできたらなと思います。
