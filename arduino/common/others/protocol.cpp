//
// Created by tfuhrman on 21/04/17.
//

#include "protocol.h"

//todo find a way for the size
servoInformation servoData[7]= {{PR_MODULE_ARM, OPEN, 90},
             {PR_MODULE_ARM, CLOSE, 90},
             {PR_MODULE_DROP_R, OPEN, 90},
             {PR_MODULE_DROP_R, CLOSE, 90},
             {PR_MODULE_DROP_L, OPEN, 90},
             {PR_MODULE_DROP_L, CLOSE, 90},
             {PR_MODULE_ROTATE, OPEN, 90},
};

void parseAndExecuteOrder(const String& order) {

}

/*
receive orders as String, so keep this format
store the received strings in a QueueList (test that it's working and not using too much space)
when processing, copy the String buffer in an internal buffer to avoid any conflict
best is to use a generic parser, but the parser execute orders too, how to split them ??

goal is to integrate OS48 and to compile a chuck of code with a main (not generic at first) and
generic functions to read and to write through the serial port + trigger on S order with response
 */
