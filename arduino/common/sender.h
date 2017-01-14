/**
 * \file	sender.h
 * \author	Thomas Fuhrmann <tomesman@gmail.com>
 * \brief   Functions to send data accross the serial communication line
 * \date	06/12/2016
 * \copyright Copyright (c) 2016 UTCoupe All rights reserved.
 */

#ifndef ARDUINO_SENDER_H
#define ARDUINO_SENDER_H

#include "Semaphore.h"
#include "Sync.h"
#include <QueueArray.h>

#include "os48.h"

//#include <String.h>

typedef enum
{
    SERIAL_ERROR = 0,
    SERIAL_INFO,
    SERIAL_DEBUG
} SerialSendEnum;

class SerialSender
{
public:
    SerialSender();
    ~SerialSender() {}
    //to be used everywhere
    static void SerialSend(SerialSendEnum level, const char* data, ...);
    static void SerialSend(SerialSendEnum level, String data);
    //to be used in the task
    static void SerialSendTask();
    static void SerialTest();
    static void SerialSendA(SerialSendEnum level, const char* data, ...);
private:
    static String CharArrayToString(const char * str, unsigned char size);
    static os48::Semaphore senderSemaphore;
    static os48::Sync senderSync;
    static QueueArray<String> dataToSend;
    static os48::Scheduler* scheduler;
};

#endif //ARDUINO_SENDER_H
