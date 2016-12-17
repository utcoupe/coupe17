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

void SerialSender::SerialSend(SerialSendEnum level, const char* data, ...) {
    if (level <= DEBUG_LEVEL) {
        va_list args;
        va_start(args, data);

        char* formattedData;
//        int formattedDataSize;
//        formattedDataSize = sprintf(formattedData, data, args);
        sprintf(formattedData, data, args);

//        String formattedDataString(formattedData, formattedDataSize);
        String formattedDataString(formattedData);
        dataToSend.push(formattedDataString);

        senderSemaphore.release();
    }
}

void SerialSender::SerialSendTask() {
    senderSemaphore.acquire();
    if (!dataToSend.isEmpty()) {
        SERIAL_MAIN.println(dataToSend.dequeue());
        SERIAL_MAIN.flush();
    }
}
