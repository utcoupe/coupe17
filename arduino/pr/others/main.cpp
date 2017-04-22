//
// Created by tfuhrman on 21/04/17.
//
#include <Arduino.h>

#include <os48.h>

#include "sender.h"
#include "parameters.h"
#include "protocol.h"

// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;

os48::Scheduler* scheduler = os48::Scheduler::get();
os48::TaskTimer* main_task = NULL;
os48::Task* serial_send_task = NULL;
os48::Task* serial_read_task = NULL;

//todo debug level as a parameter

bool mainTask() {
    while (true) {
        if (!flagArduinoConnected) {
            SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
            Serial.flush();
            delay(1000);
        } else {
            //todo something useful...
            delay(1000);
        }
    }
}

void serialReadTask() {
//    static char receivedCommand[20];
    String receivedString;
    while (true) {
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
}

void setup() {
    Serial.begin(BAUDRATE, SERIAL_TYPE);

    serial_send_task = scheduler->createTask(&SerialSender::SerialSendTask, 200);
    main_task = scheduler->createTaskTimer(&mainTask, 200, (uint32_t)(DT*1000));
    serial_read_task = scheduler->createTask(&serialReadTask, 200);

    scheduler->start();
}

void loop() {
}