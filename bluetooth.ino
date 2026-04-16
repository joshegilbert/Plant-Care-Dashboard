#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include "heltec.h"
#include "DHTesp.h"

#define DEVICE_NAME         "Joshua BLE"
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer *pServer = nullptr;
BLECharacteristic *pCharacteristic = nullptr;
int Moisture_signal = 13; 
DHTesp dht;
float lastTemperature = -1.0; 
float lastHumidity = -1.0;    

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.println("Client disconnected, start advertising");
      BLEDevice::startAdvertising(); 
    }
};

void setup() {
  Heltec.begin(true, false, true);
  pinMode(Moisture_signal, INPUT);
  Serial.begin(9600);

  
  dht.setup(27, DHTesp::DHT11);

  
  BLEDevice::init(DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks()); 
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("BLE Initialized");
}

void printToScreen(String s) {
  Heltec.display->clear();

  int lineSpacing = 10;  
  int yPos = 0;
  
  
  int idx = 0;
  while (idx != -1) {
    int newLineIdx = s.indexOf('\n', idx);
    String line = (newLineIdx == -1) ? s.substring(idx) : s.substring(idx, newLineIdx);
    Heltec.display->drawString(0, yPos, line);
    yPos += lineSpacing;
    if (newLineIdx == -1) break;
    idx = newLineIdx + 1;
  }

  Heltec.display->display();
}

void loop() {
  int Moisture = analogRead(Moisture_signal);

  float temperature = dht.getTemperature();
  float humidity = dht.getHumidity();

  
  if (!isnan(temperature) && temperature != lastTemperature) {
    lastTemperature = temperature;
  }
  if (!isnan(humidity) && humidity != lastHumidity) {
    lastHumidity = humidity;
  }

  
  String displayText = "Soil Moisture (A): " + String(Moisture) + 
                       "\nTemp: " + String(lastTemperature) + "°C" +
                       "\nHumidity: " + String(lastHumidity) + "%";
  printToScreen(displayText);

  String sensorData = String(Moisture) + "," + String(lastTemperature) + "," + String(lastHumidity);
  if (pCharacteristic) {
    pCharacteristic->setValue(sensorData.c_str());
    pCharacteristic->notify();
  }

  delay(2000); 
}
