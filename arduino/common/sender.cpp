/**
 * \file	sender.c
 * \author	Thomas Fuhrmann <tomesman@gmail.com>
 * \brief   Functions to send data accross the serial communication line
 * \date	06/12/2016
 * \copyright Copyright (c) 2016 UTCoupe All rights reserved.
 */

#include "sender.h"
#include "parameters.h"
#include "Semaphore.h"
#include <QueueArray.h>

os48::Semaphore SerialSender::senderSemaphore;
QueueArray<String> SerialSender::dataToSend;

SerialSender::SerialSender() {
    SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
}

void SerialSender::SerialSend(SerialSendEnum level, String data) {
//    SERIAL_MAIN.println("SerialSend String");
//    SERIAL_MAIN.flush();
    if (level <= DEBUG_LEVEL) {
        dataToSend.push(data);
//        SERIAL_MAIN.println("SerialSend String pushed");
//        SERIAL_MAIN.flush();
        senderSemaphore.release();
    }
}

void SerialSender::SerialSend(SerialSendEnum level, const char* data, ...) {
    if (level <= DEBUG_LEVEL) {
        va_list args;
        va_start(args, data);

//        SERIAL_MAIN.println("SerialSend before sprintf");
//        SERIAL_MAIN.flush();

        static char formattedData[80];
        int formattedDataSize = sprintf(formattedData, data, args);

//        SERIAL_MAIN.println("SerialSend after sprintf");
//        SERIAL_MAIN.flush();
        if (formattedDataSize != 0) {
            String formattedDataString(formattedData);
//        String formattedDataString("toto");
            dataToSend.push(formattedDataString);

            SERIAL_MAIN.println("SerialSend release sem");
            SERIAL_MAIN.flush();

            senderSemaphore.release();
        }
    }
}

void SerialSender::SerialSendTask() {
    while (1) {
//        SERIAL_MAIN.println("SendTask before sem");
//        SERIAL_MAIN.flush();
        senderSemaphore.acquire();
        SERIAL_MAIN.println(dataToSend.count());
        SERIAL_MAIN.flush();
        if (!dataToSend.isEmpty()) {

//            SERIAL_MAIN.print("SendTask not empty");
//            SERIAL_MAIN.flush();

            SERIAL_MAIN.println(dataToSend.dequeue());
            SERIAL_MAIN.flush();
        }
    }
}
