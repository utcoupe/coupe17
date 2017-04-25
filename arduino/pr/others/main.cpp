//
// Created by tfuhrman on 21/04/17.
//
#include <Arduino.h>

#include "sender.h"
#include "parameters.h"
#include "protocol.h"
#include "servo_motors.h"

// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;

//todo debug level as a parameter

void serialRead() {
//    static char receivedCommand[20];
    String receivedString;
    //readString has a default timeout of 1s
    receivedString = Serial.readString();
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

    servoAttach();
}

//main loop, first read an order from serial, execute the order and then send all data to send
void loop() {
    // First step, read an order from serial and execute it
    serialRead();
    if (!flagArduinoConnected) {
        SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
        delay(1000);
    } else {
        //todo something useful...
//            servoDemo();

        delay(1000);
    }
    SerialSender::SerialSendTask();
}