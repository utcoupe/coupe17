//
// Created by tfuhrman on 21/04/17.
//
#include <Arduino.h>

#include "sender.h"
#include "parameters.h"
#include "protocol.h"
#include "servo_motors.h"
#include "color_sensor_tcs3200.h"

// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;

//todo debug level as a parameter

void serialRead() {
//    static char receivedCommand[20];
    String receivedString;
    //readString has a default timeout of 1s
//    receivedString = Serial.readString();
    receivedString = Serial.readStringUntil('\n');
    receivedString.replace("\n", "");
    if (receivedString != "") {
        if (receivedString == "S") {
            flagConnected = true;
        } else {
            parseAndExecuteOrder(receivedString);
        }
//            SerialSender::SerialSend(SERIAL_INFO, receivedString);
//            Serial.println(receivedString);
//            Serial.flush();
//            delay(1000);
    }
//        delay(50);
}

void setup() {
    Serial.begin(BAUDRATE, SERIAL_TYPE);
    Serial.setTimeout(50);

    servoAttach();

    setupColorSensor();
}

//main loop, first read an order from serial, execute the order and then send all data to send
void loop() {
    static bool stop = false;
    servoTimerUpdate();
    // First step, read an order from serial and execute it
    serialRead();
    if (!flagArduinoConnected) {
        SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
        delay(1000);
        stop = false;
//        computeColor();
    } else {
        //todo something useful...
        if (!stop) {
//            servoDemo();
            stop = true;
//            open();
        }
//        delay(1000);
    }
    SerialSender::SerialSendTask();
}