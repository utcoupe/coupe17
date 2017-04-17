/**
 * \file	sender.c
 * \author	Thomas Fuhrmann <tomesman@gmail.com>
 * \brief   Functions to send data accross the serial communication line
 * \date	06/12/2016
 * \copyright Copyright (c) 2016 UTCoupe All rights reserved.
 */

#include "sender.h"
#include "parameters.h"

#include "Sync.h"

#include <QueueList.h>
#include <Arduino.h>

/* Initialize static members */
QueueList<String> SerialSender::dataToSend;
//os48::Scheduler* SerialSender::scheduler = os48::Scheduler::get();
os48::Sync SerialSender::senderSync;

//void SerialSendC(SerialSendEnum level, String data) {
//    SerialSender::SerialSend(level, data);
//}

SerialSender::SerialSender() {
    SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
}

void SerialSender::SerialSend(SerialSendEnum level, const char* data, va_list args) {
    int i, j, count = 0;
    String serialData, tmpString = "";
    if (level <= DEBUG_LEVEL) {
        for (i = 0, j = 0; data[i] != '\0'; i++) {
            if (data[i] == '%') {
                count++;

                tmpString = CharArrayToString((data + j), i - j);
                serialData.concat(tmpString);

                switch (data[++i]) {
                    case 'i':
                    case 'd':
                        tmpString = String(va_arg(args, int));
                        break;
                    case 'l':
                        tmpString = String(va_arg(args, long));
                        break;
                    case 'f': //tmpString = String(va_arg(args, float), 4);
                        break;
                    case 'c':
                        tmpString = String((char) va_arg(args, int));
                        break;
                    case 's':
                        tmpString = String(va_arg(args, char *));
                        break;
                    case '%':
                        Serial.print("%");
                        break;
                    default:;
                };
                serialData.concat(tmpString);
                j = i + 1;
            }
        };

        if (i > j) {
            tmpString = CharArrayToString((data + j), i - j);
            serialData.concat(tmpString);
        }

        OS48_NO_CS_BLOCK
        {
            dataToSend.push(serialData);
        }
        senderSync.releaseOne();
    }
}

void SerialSender::SerialSend(SerialSendEnum level, String data) {
    if (level <= DEBUG_LEVEL && data != "") {
        OS48_NO_CS_BLOCK
        {
            dataToSend.push(data);
        }
        senderSync.releaseOne();
    }
}

void SerialSender::SerialSend(SerialSendEnum level, const char* str, ...) {
    int i, j, count = 0;
    String serialData, tmpString = "";
    if (level <= DEBUG_LEVEL) {
        va_list argv;
        va_start(argv, str);
        for (i = 0, j = 0; str[i] != '\0'; i++) {
            if (str[i] == '%') {
                count++;

                tmpString = CharArrayToString((str + j), i - j);
                serialData.concat(tmpString);

                switch (str[++i]) {
                    case 'i':
                    case 'd':
                        tmpString = String(va_arg(argv, int));
                        break;
                    case 'l':
                        tmpString = String(va_arg(argv, long));
                        break;
                    case 'f': //tmpString = String(va_arg(argv, float), 4);
                        break;
                    case 'c':
                        tmpString = String((char) va_arg(argv, int));
                        break;
                    case 's':
                        tmpString = String(va_arg(argv, char *));
                        break;
                    case '%':
                        Serial.print("%");
                        break;
                    default:;
                };
                serialData.concat(tmpString);
                j = i + 1;
            }
        };
        va_end(argv);

        if (i > j) {
            tmpString = CharArrayToString((str + j), i - j);
            serialData.concat(tmpString);
        }

        OS48_NO_CS_BLOCK
        {
            dataToSend.push(serialData);
        }
        senderSync.releaseOne();
    }
}

void SerialSender::SerialSendTask() {
    String dataToPrint;
    while (1) {
        senderSync.wait();
        while (!dataToSend.isEmpty()) {
            OS48_NO_CS_BLOCK
            {
                dataToPrint = dataToSend.pop();
            }
            SERIAL_MAIN.println(dataToPrint);
            SERIAL_MAIN.flush();
        }
    }
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
