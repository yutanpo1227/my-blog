---
title: "M5StackでIMUユニットを使う"
date: "2022-05-05"
tags: ["M5Stack", "ロボット"]
---

![IMUunit](/images/m5-imu/IMUfeatured.jpg)

# とりあえずサンプルコードで動かしてみる

今回は ArduinoIDE を用いて実験をします。
M5Stack 公式から出されている UiFlow-IDE を用いても良いのですが、アイコンが使いづらい上処理も遅いので好きじゃありません。
ぱぱっと ArduinoIDE のスケッチ例から IMU.ino を選択し実行。

```c++
// define must ahead #include <M5Stack.h>
#define M5STACK_MPU6886
// #define M5STACK_MPU9250
// #define M5STACK_MPU6050
// #define M5STACK_200Q

#include <M5Stack.h>

float accX = 0.0F;
float accY = 0.0F;
float accZ = 0.0F;

float gyroX = 0.0F;
float gyroY = 0.0F;
float gyroZ = 0.0F;

float pitch = 0.0F;
float roll  = 0.0F;
float yaw   = 0.0F;

float temp = 0.0F;

// the setup routine runs once when M5Stack starts up
void setup(){

  // Initialize the M5Stack object
  M5.begin();
  /*
    Power chip connected to gpio21, gpio22, I2C device
    Set battery charging voltage and current
    If used battery, please call this function in your project
  */
  M5.Power.begin();

  M5.IMU.Init();

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(GREEN , BLACK);
  M5.Lcd.setTextSize(2);
}

// the loop routine runs over and over again forever
void loop() {
    // put your main code here, to run repeatedly:
  M5.IMU.getGyroData(&gyroX,&gyroY,&gyroZ);
  M5.IMU.getAccelData(&accX,&accY,&accZ);
  M5.IMU.getAhrsData(&pitch,&roll,&yaw);
  M5.IMU.getTempData(&temp);

  M5.Lcd.setCursor(0, 20);
  M5.Lcd.printf("%6.2f  %6.2f  %6.2f      ", gyroX, gyroY, gyroZ);
  M5.Lcd.setCursor(220, 42);
  M5.Lcd.print(" o/s");
  M5.Lcd.setCursor(0, 65);
  M5.Lcd.printf(" %5.2f   %5.2f   %5.2f   ", accX, accY, accZ);
  M5.Lcd.setCursor(220, 87);
  M5.Lcd.print(" G");
  M5.Lcd.setCursor(0, 110);
  M5.Lcd.printf(" %5.2f   %5.2f   %5.2f   ", pitch, roll, yaw);
  M5.Lcd.setCursor(220, 132);
  M5.Lcd.print(" degree");
  M5.Lcd.setCursor(0, 155);
  M5.Lcd.printf("Temperature : %.2f C", temp);

  delay(1);
}
```

一応、値を見ることができました。

![](/images/m5-imu/IMUunit2.jpeg)

しかしこの degree の yaw 角ドリフトがある上に、回転する速度によって変化する値が結構変わってしまう、、、

# yaw 角を求めるプログラムを作る

yaw 角以外の値はぱっと見正しそうなので今回は yaw 角だけ求めるプログラムを自分で作ることにしました。

```c++
#define M5STACK_MPU6886
#define CALIBCOUNT 10000

#include <M5Stack.h>

float accX = 0.0F;
float accY = 0.0F;
float accZ = 0.0F;

float gyroX = 0.0F;
float gyroY = 0.0F;
float gyroZ = 0.0F;

float yaw   = 0.0F;

float gyroOffsetZ = 0.0;

float preTime = 0.0F;
float dt = 0.0F;

float pregz = 0.0F;
float degree = 0;

int cnt = 0;

void calibration()
{
  delay(1000);
  M5.Lcd.printf("...");
  float gyroSumZ = 0;
  int count = CALIBCOUNT;
  for (int i = 0; i < count; i++) {
    M5.update();

    float gyroZ;
    M5.IMU.getGyroData(&gyroX, &gyroY, &gyroZ);

    gyroSumZ += gyroZ;
    if (M5.BtnB.wasPressed())
    {
      M5.Lcd.clear();
      M5.Lcd.setCursor(140, 120);
      M5.Lcd.printf("Exit");
      delay(500);
      return;
    }
  }
  gyroOffsetZ = gyroSumZ / count - 0.02;
  M5.Lcd.clear();
  M5.Lcd.setCursor(140, 120);
  M5.Lcd.printf("Done");
  delay(500);
}

void GetGyro()
{
  M5.IMU.getGyroData(&gyroX, &gyroY, &gyroZ);
  M5.IMU.getAccelData(&accX, &accY, &accZ);

  gyroZ -= gyroOffsetZ;

  dt = (micros() - preTime) / 1000000;
  preTime = micros();

  yaw -= (pregz + gyroZ) * dt / 2;
  pregz = gyroZ;

  if(yaw > 180)
  {
    yaw -= 360;
  }
  else if(yaw < -180)
  {
    yaw += 360;
  }
  delay(10);
}

void Button()
{
  M5.update();
  if (M5.BtnA.wasPressed())
  {
    cnt--;
    M5.Lcd.clear();
  }

  if (M5.BtnC.wasPressed())
  {
    cnt++;
    M5.Lcd.clear();
  }
}

void ResetGyro()
{
  gyroZ = 0.0;
  pregz = 0.0;
  yaw = 0.0;
  M5.Lcd.clear();
  M5.Lcd.setCursor(120, 120);
  M5.Lcd.printf("RESET");
  delay(500);
  M5.Lcd.clear();
}

void Main()
{
  M5.Lcd.clear();
  while (true)
  {
    M5.update();
    M5.Lcd.fillCircle(160 + 80 * cos(degree), 120 + 80 * sin(degree), 10, BLACK);
    M5.Lcd.setCursor(160, 0);
    degree = (yaw - 90) / (180 / PI);
    GetGyro();
    M5.Lcd.drawCircle(160, 120, 80, WHITE);
    M5.Lcd.fillCircle(160 + 80 * cos(degree), 120 + 80 * sin(degree), 10, GREEN);
    M5.Lcd.printf("%4.0f", yaw);
    if (M5.BtnB.wasPressed())
    {
      M5.Lcd.clear();
      break;
    }
  }
}

void setup() {

  M5.begin();


  M5.Power.begin();

  M5.IMU.Init();

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(WHITE , BLACK);
  M5.Lcd.setTextSize(2);
  delay(1);
}


void loop() {
  Button();

  switch (cnt)
  {
    case 0:
      M5.Lcd.setCursor(140, 120);
      M5.Lcd.printf("Main");
      if (M5.BtnB.wasPressed())
      {
        Main();
      }
      break;
    case 1:
      M5.Lcd.setCursor(90, 120);
      M5.Lcd.printf("Calibration");
      if (M5.BtnB.wasPressed())
      {
        calibration();
      }
      break;
    case 2:
      M5.Lcd.setCursor(100, 120);
      M5.Lcd.printf("ResetGyro");
      if (M5.BtnB.wasPressed())
      {
        ResetGyro();
      }
      break;
    default:
      cnt = 0;
      break;
  }
}
```

プログラムが長くなってしまいました 💦
時間があったので余計な物まで追加しちゃってます。キャリブレーションと初期方向のリセット、実際の yaw 角の変化の可視化を同一プログラム内でできるようにしました。

## キャリブレーションをする関数 Calibration

Calibration では一番上で define した数 CALIBCOUNT 分だけデータを取りその値を平均した値をオフセット値に代入するという関数になっています。キャリブレーション中は IMU を動かさないというのが前提です。

## yaw 角の角度変化を求める関数 GetGyro

GetGyro では縦軸角速度(deg/s)、横軸時間(s)からなるグラフの面積を積算することで角度変化を求めるということをしています。（積分には台形による積算の方法を用いています。詳しくはこちらのサイトを参考にさせていただきました）

[https://garchiving.com/angular-from-angular-acceleration/](https://garchiving.com/angular-from-angular-acceleration/)
実際に yaw に入る値は-180~180 になるようにしています。

## ジャイロの方向を初期化する関数 ResetGyro

ResetGyro は yaw 角を求めるために必要なパラメーターと yaw 角自体を初期化するという簡単なものです。

## 最後に、求めた yaw 角の角度変化を可視化する関数 Main

今回最終的にやりたかったことが角度変化を可視化することであったので Main という名をつけました。
この関数では実際に GetGyro で求めた値を円上にプロットすることで可視化するというものです。円上の点の座標は半径を x、θ を yaw 角の角度変化とすると（xcosθ,xsinθ）となります。なので最終的に半径 x の円を画面中央に描画し(円の中心 x 座標＋(xcosθ),円の中心 y 座標＋(xsinθ))に点を描画することで可視化できました。

[https://twitter.com/yuu_gakusei/](https://twitter.com/yuu_gakusei/status/1521056534536790027?s=20&t=FiqcXCQDZsZt6hhCP67ssQ)
しかし一度描画した点は自動的に消えてはくれないので、毎回次のループでその点を黒く塗るということをおこなっています。そのせいで表示と消すという動きを繰り返すため点が点滅してしまい少し見づらいです、、、何かいい方法はないのでしょうか、、
