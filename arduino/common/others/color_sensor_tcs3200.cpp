//
// Created by tfuhrman on 27/04/17.
// Based on Arduino Color Sensing Tutorial
// by Dejan Nedelkovski, www.HowToMechatronics.com
//

#include "color_sensor_tcs3200.h"
#include <Arduino.h>
#include "sender.h"

#define S0 4
#define S1 5
#define S2 6
#define S3 7
#define LED 12
#define sensorOut 3
int frequency = 0;
int mappedFrequency = 0;

uint8_t redFrequency = 0;
uint8_t greenFrequency = 0;
uint8_t blueFrequency = 0;

void setupColorSensor() {
    pinMode(S0, OUTPUT);
    pinMode(S1, OUTPUT);
    pinMode(S2, OUTPUT);
    pinMode(S3, OUTPUT);
    pinMode(LED, OUTPUT);
    pinMode(sensorOut, INPUT);

    // Setting frequency-scaling to 20%
    digitalWrite(S0,HIGH);
    digitalWrite(S1,LOW);

    // Activate the LED
    digitalWrite(LED,HIGH);
}

void colorSensorValue() {
    uint8_t readFrequency = 0;
    // Setting red filtered photodiodes to be read
    digitalWrite(S2,LOW);
    digitalWrite(S3,LOW);
    // Reading the output frequency
    readFrequency = pulseIn(sensorOut, LOW);
    //Remaping the value of the frequency to the RGB Model of 0 to 255
    redFrequency = constrain(map(readFrequency, 30,54,255,0), 0, 255);
    // Printing the value on the serial monitor
//    Serial.print("R= ");//printing name
//    Serial.print(frequency);//printing RED color frequency
//    Serial.print("  ");
    SerialSender::SerialSend(SERIAL_INFO, "RED : %d", redFrequency);
//    delay(100);
    // Setting Green filtered photodiodes to be read
    digitalWrite(S2,HIGH);
    digitalWrite(S3,HIGH);
    // Reading the output frequency
    readFrequency = pulseIn(sensorOut, LOW);
    //Remaping the value of the frequency to the RGB Model of 0 to 255
    greenFrequency = constrain(map(readFrequency, 20,100,255,0), 0, 255);
    // Printing the value on the serial monitor
//    Serial.print("G= ");//printing name
//    Serial.print(frequency);//printing RED color frequency
//    Serial.print("  ");
    SerialSender::SerialSend(SERIAL_INFO, "GRE : %d", greenFrequency);
//    delay(100);
    // Setting Blue filtered photodiodes to be read
    digitalWrite(S2,LOW);
    digitalWrite(S3,HIGH);
    // Reading the output frequency
    readFrequency = pulseIn(sensorOut, LOW);
    //Remaping the value of the frequency to the RGB Model of 0 to 255
    blueFrequency = constrain(map(readFrequency, 10,90,255,0), 0, 255);
    // Printing the value on the serial monitor
//    Serial.print("B= ");//printing name
//    Serial.print(frequency);//printing RED color frequency
//    Serial.println("  ");
    SerialSender::SerialSend(SERIAL_INFO, "BLU : %d", blueFrequency);
//    delay(100);
}

void computeColor() {

}