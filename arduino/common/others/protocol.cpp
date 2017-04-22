//
// Created by tfuhrman on 21/04/17.
//

#include <Arduino.h>

#include <stdio.h>
#include <stdint.h>
#include "protocol.h"
#include "sender.h"

//todo find a way for the size
servoInformation servoData[7]= {{PR_MODULE_ARM, OPEN, 90},
             {PR_MODULE_ARM, CLOSE, 90},
             {PR_MODULE_DROP_R, OPEN, 90},
             {PR_MODULE_DROP_R, CLOSE, 90},
             {PR_MODULE_DROP_L, OPEN, 90},
             {PR_MODULE_DROP_L, CLOSE, 90},
             {PR_MODULE_ROTATE, OPEN, 90},
};

//order is order;id_servo;params
void parseAndExecuteOrder(const String& order) {
    static char receivedOrder[15];
    order.toCharArray(receivedOrder, order.length());
    char orderChar = receivedOrder[ORDER_INDEX];
//    uint16_t order_id = (uint16_t)(receivedOrder[ID_INDEX+1] << 8) + (uint16_t)(receivedOrder[ID_INDEX]);
    uint16_t order_id = (uint16_t) atoi(&receivedOrder[ID_INDEX]);
    SerialSender::SerialSend(SERIAL_INFO, "order : %c, id : %d", orderChar, order_id);
//    String order_id_s = String((int)order_id);
//    SerialSender::SerialSend(SERIAL_INFO, order_id_s);
//    SerialSender::SerialSend(SERIAL_INFO, order);
}

/*
receive orders as String, so keep this format
store the received strings in a QueueList (test that it's working and not using too much space)
when processing, copy the String buffer in an internal buffer to avoid any conflict
best is to use a generic parser, but the parser execute orders too, how to split them ??

goal is to integrate OS48 and to compile a chuck of code with a main (not generic at first) and
generic functions to read and to write through the serial port + trigger on S order with response
 */
