---
title: "M5Stackとswiftでスマホからエアコンを操作する"
date: "2022-10-10"
tags: ["M5Stack", "Swift", "IoT"]
---

最近流行っている IoT の世界にも手を出してみたいと思い、swift でアプリを作成、M5Stack と赤外線送受信ユニットでスマホからエアコンを操作するというものを作ってみました。

# 構成

![構成](/images/m5-swift/構成.png)

- Swift で iPhone から M5Stack に UDP 通信で送信するアプリを作成
- M5Stack で受信した UDP 通信を処理して赤外線送受信ユニットでエアコンに送信する
- エアコンの赤外線を受信して、エアコンを操作する

# 環境

- iOS アプリ
  - Swift 5.7
  - iPhone 13 Pro max : iOS 16.0.2
- M5Stack

  - M5Stack Basic
  - M5Stack 赤外線送受信ユニット(U002)

- 開発環境
  - macOS Monterey 12.6
  - Xcode 14.0.1
  - PlatformIO Core 6.1.4

# Swift でのアプリ作成

今回 Swift でのアプリ作成は初だったので Storyboard での作成を行いました。

![StoryBoard](/images/m5-swift/storyboard.png)

まずはボタンの配置をサクッと行い、ボタンを押した時に UDP 通信を送信するように設定しました。

UDP 通信の送信は以下のような関数を実装しました。

```swift
import UIKit
import Foundation
import Network

let host = "***.***.***.***"
let port = "****"

/* コネクション開始 */
let connection = connect(host: host, port: port)

class ViewController: UIViewController {
    @IBOutlet weak var status_label: UILabel!

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }
}

func send(connection: NWConnection,message: String) {
    /* 送信データ生成 */
    let data = message.data(using: .utf8)!
    let semaphore = DispatchSemaphore(value: 0)

    /* データ送信 */
    connection.send(content: data, completion: .contentProcessed { error in
        if let error = error {
            NSLog("\(#function), \(error)")
        } else {
            semaphore.signal()
        }
    })
    /* 送信完了待ち */
    semaphore.wait()
}

func recv(connection: NWConnection){
    let semaphore = DispatchSemaphore(value: 0)
    var result : String?
    /* データ受信 */
    connection.receive(minimumIncompleteLength: 0,
                       maximumLength: 65535,
                       completion:{(data, context, flag, error) in
        if let error = error {
            NSLog("\(#function), \(error)")
        } else {
            if let data = data ,let message = String(data: data, encoding: .utf8){
                print(message)
                /* 受信データのデシリアライズ */
                semaphore.signal()
            }
            else {
                NSLog("receiveMessage data nil")
            }
        }
    })
    /* 受信完了待ち */
    semaphore.wait()
}

func disconnect(connection: NWConnection)
{
    /* コネクション切断 */
    connection.cancel()
}

func connect(host: String, port: String) -> NWConnection
{
    let t_host = NWEndpoint.Host(host)
    let t_port = NWEndpoint.Port(port)
    let connection : NWConnection
    let semaphore = DispatchSemaphore(value: 0)

    /* コネクションの初期化 */
    connection = NWConnection(host: t_host, port: t_port!, using: .udp)

    /* コネクションのStateハンドラ設定 */
    connection.stateUpdateHandler = { (newState) in
        switch newState {
            case .ready:
                NSLog("Ready to send")
                semaphore.signal()
            case .waiting(let error):
                NSLog("\(#function), \(error)")
            case .failed(let error):
                NSLog("\(#function), \(error)")
            case .setup: break
            case .cancelled: break
            case .preparing: break
            @unknown default:
                fatalError("Illegal state")
        }
    }

    /* コネクション開始 */
    let queue = DispatchQueue(label: "example")
    connection.start(queue:queue)

    /* コネクション完了待ち */
    semaphore.wait()
    return connection
}
```

遷移後の画面では、赤外線送受信ユニットに送信するボタンに対し送信する文字列の割り当てや現在の温度、風量などを表示するようにしました。

```swift
import UIKit

class ModalViewController: UIViewController {
    @IBOutlet weak var label_temp: UILabel!
    @IBOutlet weak var label_level: UILabel!
    @IBOutlet weak var label_mode: UILabel!
    var mode = ""
    var temp = 0
    var level = 0

    override func viewDidLoad() {
        super.viewDidLoad()
        label_temp.text = ""
        label_level.text = ""
        label_mode.text = "OFF"

        // Do any additional setup after loading the view.
    }
    @IBAction func heat_button(_ sender: Any) {
        send(connection: connection, message: "heat")
        temp = 27
        level = 2
        label_temp.text = String(temp) + "℃"
        label_level.text = String(level)
        label_mode.text = "暖房"
    }

    @IBAction func cool_button(_ sender: Any) {
        send(connection: connection, message: "cool")
        temp = 27
        level = 2
        label_temp.text = String(temp) + "℃"
        label_level.text = String(level)
        label_mode.text = "冷房"
    }

    @IBAction func dehumi_button(_ sender: Any) {
        send(connection: connection, message: "dehumi")
        temp = 27
        level = 2
        label_temp.text = String(temp) + "℃"
        label_level.text = String(level)
        label_mode.text = "除湿"
    }

    @IBAction func tempup_button(_ sender: Any) {
        send(connection: connection, message: "tempup")
        temp = temp + 1
        label_temp.text = String(temp) + "℃"
    }

    @IBAction func tempdown_button(_ sender: Any) {
        send(connection: connection, message: "tempdown")
        temp = temp - 1
        label_temp.text = String(temp) + "℃"
    }

    @IBAction func levelup_button(_ sender: Any) {
        send(connection: connection, message: "levelup")
        level = level + 1
        label_level.text = String(level)
    }

    @IBAction func leveldown_button(_ sender: Any) {
        send(connection: connection, message: "leveldown")
        level = level - 1
        label_level.text = String(level)
    }

    @IBAction func off_button(_ sender: Any) {
        send(connection: connection, message: "off")
        label_temp.text = ""
        label_level.text = ""
        label_mode.text = "OFF"
    }
}
```

# M5Stack での処理

M5Stack ではスマホからの通信で送られてきた文字列によって適切な赤外線データを送信するという処理を実装しました。

今回うちのエアコンは赤外線ユニットのライブラリにある機種ではなかったため予め読み取った RawData を送信しています。

赤外線の RawData の読み取りは、こちらの記事を参考にしました。
[こちらの記事](https://qiita.com/coppercele/items/ed91646944ca28ff0c07)

```c++
#include <M5Stack.h>
#include <IRremoteESP8266.h>
#include <IRsend.h>
#include <WiFi.h>
#include <WiFiUdp.h>

//WiFiの設定--------------------------------------
const char* ssid = "SSID";
const char* pass = "PASS";

const int udpPort = ****;
const int phoneport = ****;

WiFiUDP udp;

IPAddress ip(***.***.***.***);
IPAddress gateway(***.***.***.***);
IPAddress subnet(***.***.***.***);

IPAddress phoneip(***.***.***.***);

//-----------------------------------------------


//IR送信の設定-------------------------------------
const int IR_SEND_PIN = 21;
const int TRANSMIT_CAPTURE_SIZE = 38;
const int IR_RAW_DATA_SIZE = 981;

uint16_t heatRawData[IR_RAW_DATA_SIZE] = {/*省略*/};
uint16_t coolRawData[IR_RAW_DATA_SIZE] = {/*省略*/};
uint16_t dehumiRawData[IR_RAW_DATA_SIZE] = {/*省略*/};

uint16_t offRawData[IR_RAW_DATA_SIZE] = {/*省略*/};

String nowmode = "stop";
int nowtemp = 0;
int nowlevel = 0;

//温度ごとのデータ
uint16_t tempRawData[15][IR_RAW_DATA_SIZE] = {/*省略*/};

//風量ごとのデータ
uint16_t levelRawData[6][IR_RAW_DATA_SIZE] = {/*省略*/};

IRsend irsend(IR_SEND_PIN);
//----------------------------------------------

void setup()
{
  M5.begin();
  irsend.begin();
  Serial.begin(115200);
  M5.Lcd.setTextSize(2);

  WiFi.config(ip,gateway,subnet);
  //Wi-Fi接続
  WiFi.begin(ssid,pass);
  M5.Lcd.printf("Waiting connect to WiFi: %s ", ssid);
  while(WiFi.status() != WL_CONNECTED) {
    //接続完了まで待つ
    delay(1000);
    M5.Lcd.print(".");
  }
  //udp待受開始
  udp.begin(udpPort);
  M5.Lcd.println("Waiting udp packet...");
}

void loop()
{
  M5.Lcd.setCursor(0,120);
  M5.Lcd.printf("mode:%s\n",nowmode);
  M5.Lcd.printf("temp:%d  ",nowtemp);
  M5.Lcd.printf("level:%d",nowlevel);
  if (int len = udp.parsePacket()) {
    //udpパケットを読み込む
    char buff[len + 1];
    memset(buff, '\0', sizeof(buff));
    udp.read((uint8_t*)buff, len);
    String str = buff;
    if(buff == "setup")
    {
      uint8_t message = 1111;
      udp.beginPacket(phoneip,phoneport);
      udp.write(message);
      udp.endPacket();
      delay(500);
    }
    else if(str.compareTo("heat") == 0)
    {
      //暖房のデータと初期値：温度27℃、風量2を送信
      irsend.sendRaw(heatRawData, IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(tempRawData[9], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(levelRawData[1], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      nowmode = "heater";
      nowtemp = 27;
      nowlevel = 2;
    }
    else if(str.compareTo("cool") == 0)
    {
      //冷房のデータと初期値：温度27℃、風量2を送信
      irsend.sendRaw(coolRawData, IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(tempRawData[9], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(levelRawData[1], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      nowmode = "cooler";
      nowtemp = 27;
      nowlevel = 2;
    }
    else if(str.compareTo("dehumi") == 0)
    {
      //除湿のデータと初期値：温度27℃、風量2を送信
      irsend.sendRaw(dehumiRawData, IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(tempRawData[9], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      irsend.sendRaw(levelRawData[1], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
      nowmode = "dehumidifier";
      nowtemp = 27;
      nowlevel = 2;
    }
    else if(str.compareTo("tempup") == 0)
    {
      //1℃あげた温度データを送信
      nowtemp += 1;
      irsend.sendRaw(tempRawData[nowtemp - 18], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
    }
    else if(str.compareTo("tempdown") == 0)
    {
      //1℃下げた温度データを送信
      nowtemp -= 1;
      irsend.sendRaw(tempRawData[nowtemp - 18], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
    }
    else if(str.compareTo("levelup") == 0)
    {
      //1あげた風量データを送信
      nowlevel += 1;
      irsend.sendRaw(tempRawData[nowlevel - 1], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
    }
    else if(str.compareTo("leveldown") == 0)
    {
      //1下げた風量データを送信
      nowlevel -= 1;
      irsend.sendRaw(tempRawData[nowlevel - 1], IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      delay(500);
    }
    else if(str.compareTo("off") == 0)
    {
      //停止データを送信
      irsend.sendRaw(offRawData, IR_RAW_DATA_SIZE, TRANSMIT_CAPTURE_SIZE);
      nowmode = "stop";
      nowtemp = 0;
      nowlevel = 0;
    }
  }
}
```

# 実際の動作

実際に動作させたときの動画はこちらです。

[X.com](https://twitter.com/yuu_gakusei/status/1579119524573769729)

# まとめ

今回初めて Swift でのアプリ開発をしてみた割に意外と思っていた動作を実現できてよかったです。

現段階ではローカルな環境でしか動作しないため、今後は外部からのアクセスができるようにしたいと考えています。
