---
title: "画像の文章を要約するアプリ"
date: "2023-04-03"
tags: ["アプリケーション", "Flutter", "ChatGPT", "AI"]
---

Chat-GPT API が話題だったので、使ってみたいと思い今回のアプリを作成しました。

概要は OCR で画像から文章を取得し、Chat-GPT API で要約した文章を表示するアプリです。

※今回初めて Flutter を使用し、制作期間も 3 日程度だったのでかなり粗いつくりかもしれませんご了承ください。

# 構成

![構成](/images/summarize-app/structure.png)

- アプリ開発には Flutter を使用、画像の選択、OCR、Chat-GPT API の呼び出しを行っています。
- OCR には Google Firebase の ML Kit を使用しています。
- 検出された文章は Chat-GPT API に渡し、要約した文章を取得し結果を表示します。

# 環境

- 実行環境
  - iPhone13Pro max : iOS 16.0.2
- 開発環境
  - macOS Monterey 12.6
  - Xcode 14.0.1
  - Flutter 3.7.7

# Flutter でのアプリの作成

今回アプリを作成するにあたり、Flutter を使用しました。Swift でもよかったのですが今回は Flutter に触れてみたかったと言うこともあり Flutter を選択しました。

動作の流れとしては

1. 画像の撮影、選択 + トリミング
2. 画像を Google Firebase の ML Kit に渡して OCR で文章を取得
3. 取得した文章を Chat-GPT API に渡して要約した文章を取得
4. 取得した文章を画面に表示

こんな動作イメージで制作しました。

### 画面の作成

![画面](/images/summarize-app/img1.jpg)

画面は上記のようなに画面構成で、画面１では画像の選択と言語の選択を行い画面２に読み取った文章と要約結果を表示するようにしています。

個人的にごちゃごちゃしたデザインよりシンプルなデザインが好きなのでこのような最低限のデザインにしました。あと AppBar に色がついているのも嫌だったので透明にしました。

```dart
  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarBrightness: Brightness.light,
      )
    );
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading:true,
        iconTheme: IconThemeData(color: Colors.black),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
```

AppBar の色を透明にするには上記のように AppBar の backgroundColor を透明にし elevation を 0 し影を消すことで完全に透明にすることができます。
これだけだとステータスバーの色が白で背景に消えてしまうので、SystemChrome.setSystemUIOverlayStyle を使用して statusBarBrightness を Brightness.light にして色を変更しています。

### 画像の選択、トリミング

今回は画像の選択には image_picker を使用しトリミングには image_cropper を使用しました。

```dart
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
```

```dart
class Pick{
  XFile? image;
  final picker = ImagePicker();

  // 画像をギャラリーから選ぶ関数
  Future<XFile?> pickImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery);
    // 画像がnullの場合戻る
    if (image == null) return null;

    final imageTemp = image;

    return imageTemp;
  }
  // カメラを使う関数
  Future<XFile?> pickImageCamera() async {
    final image = await ImagePicker().pickImage(source: ImageSource.camera);
    // 画像がnullの場合戻る
    if (image == null) return null;

    final imageTemp = image;

    return imageTemp;
  }
}
```

image_picker にはもともとカメラとライブラリから画像を選択する関数が用意されているのでそれを使用します。

```dart
Future cropImage(XFile img) async {
  final croppedFile = await ImageCropper().cropImage(
    sourcePath: img.path,
    uiSettings: [
    AndroidUiSettings(
        toolbarTitle: 'Cropper',
        toolbarColor: Colors.deepOrange,
        toolbarWidgetColor: Colors.white,
        initAspectRatio: CropAspectRatioPreset.original,
        lockAspectRatio: false),
    IOSUiSettings(
      title: 'Cropper',
    ),
    WebUiSettings(
      context: context,
    ),
    ]
  );
  if (croppedFile != null) {
    this.image =  XFile(croppedFile.path);
  }
}
```

必要な文字以外は切り抜けるようにトリミングもできるよう image_cropper を使用しました。

### OCR

ML Kit を使用には Firebase のプロジェクトを作成し、ML Kit を有効にする必要があります。その際こちらを参考にさせていただきました。
[](https://zenn.dev/kazutxt/books/flutter_practice_introduction/viewer/34_chapter4_ml)

Flutter で ML Kit を使用するには google_mlkit_text_recognition というライブラリを使用します。

```dart
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
```

画面１で選択した言語と画像を ML Kit に渡し、OCR で文章を取得します。

```dart
Future ocr_ja () async {
  final InputImage imageFile = InputImage.fromFilePath(image!.path);
  final textRecognizer =
    TextRecognizer(script: TextRecognitionScript.japanese);
  final RecognizedText recognizedText =
      await textRecognizer.processImage(imageFile);
  String text = '';
  for(TextBlock block in recognizedText.blocks)
  {
    String temp = block.text;
    text = text + temp;
  }
  setState(() {
    result = Text(text.replaceAll('\n', ""));
  });
  textRecognizer.close();
}

Future ocr_en () async {
  final InputImage imageFile = InputImage.fromFilePath(image!.path);
  final textRecognizer =
    TextRecognizer(script: TextRecognitionScript.latin);
  final RecognizedText recognizedText =
      await textRecognizer.processImage(imageFile);
  String text = '';
  for(TextBlock block in recognizedText.blocks)
  {
    String temp = block.text;
    text = text + temp;
  }
  setState(() {
    result = Text(text.replaceAll('\n', ""));
  });
  textRecognizer.close();
}
```

今回は TextRecognizer の引数に japanese と latin を選択することで日本語と英語バージョンを作成ししました。

1. TextRecognizer に画像を渡すには画像を InputImage に変換すしなければいけないので InputImage.fromFilePath(image!.path)で変換
2. TextRecognizer に japanese か latin を渡す
3. TextRecognizer に InputImage を渡しブロックごとの文章を取得し文字列を結合
4. 最後に読み取った文章そのままでは改行が入っているので replaceAll で改行を消す

### Chat-GPT に要約してもらう

最後に読み取った文章を Chat-GPT に渡し、文章を生成します。
ChatGPT を Flutter を使用するには以下のライブラリを使用します。

```dart
import 'package:dart_openai/openai.dart';
```

ChatGPT API を Flutter で使用するにはまず APIKEY を取得する必要があるのでこちらから取得してください。
[](https://platform.openai.com/docs/quickstart/build-your-application)

```dart
Future main() async{
  await dotenv.load(fileName: '.env');
  OpenAI.apiKey = dotenv.get('API_KEY');
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}
```

取得した APIKEY を OpenAI.apiKey に代入します。今回はソースコードを公開する予定だったので.env ファイルを利用しています。

```dart
Future listenChatGPT(String message) async{
  answerText = '処理中';
  final chatCompletion = await OpenAI.instance.chat.create(
    model: "gpt-3.5-turbo",
    messages: [
      OpenAIChatCompletionChoiceMessageModel(
            content: "あなたはこれから入力される文章を日本語で要約してください",
            role: "system",
        ),
      OpenAIChatCompletionChoiceMessageModel(
            content: message,
            role: "user",
        ),
    ],
  );
  setState(() {
    answerText = chatCompletion.choices.first.message.toMap()['content'].toString();
  });
}
```

先ほど読み取った文章を引数で渡し、ChatGPT に渡します。
ChatGPT に渡す際 role を指定することができ

- system: AI の設定を記述
- assistant: AI からの発言
- user: ユーザーからの発言

となっています。今回は「あなたはこれから入力される文章を日本語で要約してください」と system に記述することで AI に文章を要約してもらうように指示しています。
user の文章としては先ほど読み取った文章を渡しています。
ChatGPT から返ってきた文章をマップに変換し content の key を指定してあげることで返答だけを得ることができます。

# 実際に動作させてみる

![動作](/images/summarize-app/img2.gif)
割といい感じに要約してくれるなって感じですね、今の Chat-GPT だと時間がかかってしまいますが、Chat-GPT4 を使えばもっと早くなるかも(？)って期待してます。
流石に Flutter を初めて 3 日で作ったものなので今後しっかり勉強してもっといいものにできたらいいなと思います。

GitHub にでもソースコード置いておきます

[yutanpo1227/flutter_ocrApp](https://github.com/yutanpo1227/flutter_ocrApp)
