//
// Created by tfuhrman on 21/04/17.
//

#include <Arduino.h>

#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include "protocol.h"
#include "sender.h"
#include "servo_motors.h"

unsigned char flagArduinoConnected = 0;

//order is order;id_servo;params
void parseAndExecuteOrder(const String& order) {
    static char receivedOrder[15];
    char* receivedOrderPtr = receivedOrder;
    order.toCharArray(receivedOrder, order.length());
    char orderChar = receivedOrder[ORDER_INDEX];
    uint16_t order_id = (uint16_t) atoi(&receivedOrder[ID_INDEX]);
    uint8_t numberDigits = getLog10(order_id);
    SerialSender::SerialSend(SERIAL_INFO, "order : %c, id : %d (digits : %d)", orderChar, order_id, numberDigits);
    // Move to the first parameter of the order
    receivedOrderPtr +=  ID_INDEX + numberDigits + (uint8_t)1;
    switch (orderChar) {
        case START:
        {
            SerialSender::SerialSend(SERIAL_INFO, "Arduino %s has started (%d)", ARDUINO_ID, order_id);
            flagArduinoConnected = 1;
            break;
        }
        case HALT:
        {
            SerialSender::SerialSend(SERIAL_INFO, "Arduino %s has stopped (%d)", ARDUINO_ID, order_id);
            flagArduinoConnected = 0;
            break;
        }
        case PARAMETER:
        {
            //todo try to be able to use uint8_t
            unsigned int servo_id, servo_position, servo_value;
            sscanf(receivedOrderPtr, "%u;%u;%u;", &servo_id, &servo_position, &servo_value);
            changeServoParameter((uint8_t)servo_id, (SERVO_POSITION)servo_position, (uint8_t)servo_value);
            break;
        }
        case MODULE_ROTATE:
        {
            //todo
            break;
        }
        case SERVO_OPEN:
        {
            unsigned int servo_id;
            sscanf(receivedOrderPtr, "%u;", &servo_id);
            SerialSender::SerialSend(SERIAL_INFO, "SERVO_OPEN(%d)", servo_id);
            servoAction((uint8_t)servo_id, OPEN);
            break;
        }
        case SERVO_CLOSE:
        {
            unsigned int servo_id;
            sscanf(receivedOrderPtr, "%u;", &servo_id);
            servoAction(servo_id, CLOSE);
            break;
        }
        case SERVO_INIT:
        {
            unsigned int servo_id;
            sscanf(receivedOrderPtr, "%u;", &servo_id);
            servoAction(servo_id, INIT);
            break;
        }
        default:
            SerialSender::SerialSend(SERIAL_INFO, "Order %c is wrong !", orderChar);
    }
}

uint8_t getLog10(const uint16_t number) {
    if(number>=10000) return 5;
    if(number>=1000) return 4;
    if(number>=100) return 3;
    if(number>=10) return 2;
    return 1;
}

void changeServoParameter(const uint8_t servo_id, const SERVO_POSITION servo_position, const uint8_t servo_value) {
    SerialSender::SerialSend(SERIAL_INFO, "servo=%d, pos=%d, value=%d", servo_id, servo_position, servo_value);
    //todo servo id as define
    if ((servo_id < MAX_SERVO) && (servo_position <= CLOSE)) {
        uint8_t index = 0;
        //todo servo id...
//        while (index < MAX_SERVO) {
            //todo
//            if ((servoData[index].servoId == servo_id) && (servoData[index].position == servo_position)) {
//                servoData[index].value = servo_value;
//                //todo
//                // Exit the loop
//                index = MAX_SERVO;
//            }
//            index++;
//        }
    } else {
        SerialSender::SerialSend(SERIAL_INFO, "Servo id (%d) or servo position (%d) is not correct", servo_id, servo_position);
    }
}

/*
receive orders as String, so keep this format
store the received strings in a QueueList (test that it's working and not using too much space)
when processing, copy the String buffer in an internal buffer to avoid any conflict
best is to use a generic parser, but the parser execute orders too, how to split them ??

goal is to integrate OS48 and to compile a chuck of code with a main (not generic at first) and
generic functions to read and to write through the serial port + trigger on S order with response
 */
