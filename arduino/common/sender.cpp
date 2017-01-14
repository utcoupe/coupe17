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
#include "Sync.h"
#include <QueueArray.h>
#include <QueueList.h>
//#include <String.h>

#include <string.h>

os48::Semaphore SerialSender::senderSemaphore;
QueueArray<String> SerialSender::dataToSend;
QueueList<String> SerialSender::dataToSendList;
os48::Scheduler* SerialSender::scheduler = os48::Scheduler::get();

os48::Sync SerialSender::senderSync;

String SerialSender::data;

SerialSender::SerialSender() {
    SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
//    senderSync = os48::Sync();
//    scheduler = os48::Scheduler::get();
}

void SerialSender::SerialSend(SerialSendEnum level, String data) {
//    SERIAL_MAIN.println("SerialSend String");
//    SERIAL_MAIN.flush();
//    if (level <= DEBUG_LEVEL) {
    if (1) {
        OS48_NO_CS_BLOCK
        {
            dataToSendList.push(data);
        }
//        SERIAL_MAIN.println("SerialSend String pushed");
//        SERIAL_MAIN.flush();
//        senderSemaphore.release();
        senderSync.releaseOne();
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

        senderSync.wait();

        //todo print all the data, not just one...

//        senderSemaphore.acquire();
//        SERIAL_MAIN.println(data);
//        SERIAL_MAIN.flush();
//        SERIAL_MAIN.println("SendTask sem acquired");
//        SERIAL_MAIN.flush();

//        if (!dataToSend.isEmpty()) {
        if (!dataToSendList.isEmpty()) {

//            SERIAL_MAIN.print("SendTask not empty");
//            SERIAL_MAIN.flush();
//            SERIAL_MAIN.println(dataToSend.dequeue());
//            SERIAL_MAIN.flush();
            String dataToPrint;
            OS48_NO_CS_BLOCK
            {
                dataToPrint = dataToSendList.pop();
            }
            SERIAL_MAIN.println(dataToPrint);
            SERIAL_MAIN.flush();
        }

//        scheduler->yield();

//        SERIAL_MAIN.println("SendTask after yield");
//        SERIAL_MAIN.flush();
//        delay(1000);
    }
}

void SerialSender::SerialTest() {
//    char* charString = "test char %d oy yeah !";
    SerialSendA(SERIAL_INFO, "test %d char %l oh %c yeah !", -36, -45000000, 'X');

//    SERIAL_MAIN.println("SerialTest enter");
//    SERIAL_MAIN.flush();

//    SerialSendA(SERIAL_INFO, "Hello world : %d hein", 36);

//    SERIAL_MAIN.println("SerialTest exit");
//    SERIAL_MAIN.flush();

//    senderSync.releaseOne();

//    static char* tmpCharString[30];
//    String to_return = "";
//    String tmp;
//    int counter = 0;
//    while (charString[counter] != '\0') {
//        if (charString[counter] = '%') {
//            tmpCharString[counter] = '/0';
//            to_return += String(tmpCharString);
//        } else {
//            tmpCharString[counter] = charString[counter];
//        }
//    }
}

void SerialSender::SerialSendA(SerialSendEnum level, const char* str, ...) {
    int i, j, count = 0;
    String serialData, tmpString = "";

    va_list argv;
    va_start(argv, str);
    for(i = 0, j = 0; str[i] != '\0'; i++) {
        if (str[i] == '%') {
            count++;

//            Serial.write(reinterpret_cast<const uint8_t*>(str+j), i-j);
//            tmpString = CharArrayToString(reinterpret_cast<const uint8_t*>(str+j), i-j);
            tmpString = CharArrayToString((str+j), i-j);
//            SERIAL_MAIN.print("TmpString : ");
//            SERIAL_MAIN.println(tmpString);
            serialData.concat(tmpString);
//            SERIAL_MAIN.print("SerialData : ");
//            SERIAL_MAIN.println(serialData);
//            SERIAL_MAIN.flush();

            switch (str[++i]) {
                case 'd': tmpString = String(va_arg(argv, int));
                    break;
                case 'l': tmpString = String(va_arg(argv, long));
                    break;
                case 'f': //tmpString = String(va_arg(argv, float), 4);
                    break;
                case 'c': tmpString = String((char)va_arg(argv, int));
                    break;
                case 's': tmpString = String(va_arg(argv, char *));
                    break;
                case '%': Serial.print("%");
                    break;
                default:;
            };
//            SERIAL_MAIN.print("TmpString : ");
//            SERIAL_MAIN.println(tmpString);
            serialData.concat(tmpString);
//            SERIAL_MAIN.print("SerialData : ");
//            SERIAL_MAIN.println(serialData);
//            SERIAL_MAIN.flush();

            j = i+1;
        }
    };
    va_end(argv);

    if(i > j) {
//        Serial.write(reinterpret_cast<const uint8_t*>(str+j), i-j);
//        tmpString = CharArrayToString(reinterpret_cast<const uint8_t*>(str+j), i-j);
        tmpString = CharArrayToString((str+j), i-j);
//        SERIAL_MAIN.print("TmpString : ");
//        SERIAL_MAIN.println(tmpString);
        serialData.concat(tmpString);
//        SERIAL_MAIN.print("SerialData : ");
//        SERIAL_MAIN.println(serialData);
//        SERIAL_MAIN.flush();
    }

//    SERIAL_MAIN.println(serialData);
//    SERIAL_MAIN.flush();

//    dataToSend.enqueue(serialData);
    OS48_NO_CS_BLOCK
    {
        dataToSendList.push(serialData);
    }
//    data = serialData;
//    senderSemaphore.release();
    senderSync.releaseOne();

//    SERIAL_MAIN.println("exit SerialSendA");
//    SERIAL_MAIN.flush();

//    return count;
}

String SerialSender::CharArrayToString(const char * str, unsigned char size) {
    String returnedString = "";
    if (str && size > 0 && size < 51) {
        char tmpBuffer[50];
        memcpy(tmpBuffer, str, size);
        tmpBuffer[size] = '\0';
        returnedString = String(tmpBuffer);
    }
    return returnedString;
}
