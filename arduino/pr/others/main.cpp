//
// Created by tfuhrman on 21/04/17.
//
#include <Arduino.h>

#include <os48.h>

#include "parameters.h"

// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;

os48::Scheduler* scheduler = os48::Scheduler::get();
os48::TaskTimer* main_task = NULL;
os48::Task* serial_send_task = NULL;
os48::Task* serial_read_task = NULL;

bool mainTask() {
    while (!flagConnected) {
//        SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
        Serial.println(ARDUINO_ID);
        Serial.flush();
        delay(1000);
    }
    while (1) {
//        SerialSender::SerialSend(SERIAL_INFO, "Started up !");
        Serial.println("Started Up!");
        Serial.flush();
        delay(1000);
    }
}

void serialReadTask() {
    static char receivedCommand[20];
    String receivedString;
    while (true) {
        receivedString = Serial.readString();
        receivedString.replace("\n", "");
        if (receivedString != "") {
//            SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
            if (receivedString == "S") {
                flagConnected = true;
            }
            Serial.println(receivedString);
            Serial.flush();
            delay(1000);
        }
        delay(50);
    }
}

void setup() {
    Serial.begin(BAUDRATE, SERIAL_TYPE);

//    serial_send_task = scheduler->createTask(&SerialSender::SerialSendTask, 150);
    main_task = scheduler->createTaskTimer(&mainTask, 250, (uint32_t)(DT*1000));
    serial_read_task = scheduler->createTask(&serialReadTask, 100);

    scheduler->start();
}

void loop() {
}