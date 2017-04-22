//
// Created by tfuhrman on 20/04/17.
//

#ifndef OTHERS_PROTOCOL_H
#define OTHERS_PROTOCOL_H

//#include <String>

#include "parameters.h"

class String;

//todo ack format ?

// BEGIN_ORDERS - Do not remove this comment
#define START               'S'     //no args, start the program
#define HALT                'h'     //no args, halt the program
#define PARAMETER           'p'     //servo_id(int);position(int);value(int), respond TODO, position = open or close
#define MODULE_ROTATE       'r'     //color(int) = 0 (whatever color), 1 (blue), 2 (yellow), respond TODO
#define SERVO_OPEN          'o'     //servo_id(int), respond ack when done
#define SERVO_CLOSE         'c'     //servo_id(int), respond ack when done
#define PR_MODULE_ARM       0       //servo controlling the arm which gets the module
#define PR_MODULE_DROP_R    1       //right servo controlling the drop of the module
#define PR_MODULE_DROP_L    2       //left servo controlling the drop of the module
#define PR_MODULE_ROTATE    3       //continuous rotation servo to turn modules
// END_ORDERS - Do not remove this comment

enum SERVO_POSITION {
    OPEN = 0,
    CLOSE
};

enum MODULE_COLOR {
    WHATEVER = 0,
    BLUE,
    YELLOW
};

struct servoInformation {
    uint8_t servoId;
    SERVO_POSITION position;
    uint8_t value;
};

#define ORDER_INDEX (uint8_t)0
#define ID_INDEX    (uint8_t)2

extern servoInformation servoData[];

extern unsigned char flagArduinoConnected;

//todo move to cpp file ?
static const unsigned int servoMapping[4][2] = {{PR_MODULE_ARM, PR_MODULE_ARM_PIN},
                                                {PR_MODULE_DROP_R, PR_MODULE_DROP_R_PIN},
                                                {PR_MODULE_DROP_L, PR_MODULE_DROP_L_PIN},
                                                {PR_MODULE_ROTATE, PR_MODULE_ROTATE_PIN},};

void parseAndExecuteOrder(const String& order);

uint8_t getLog10(const uint16_t number);

void changeServoParameter(const uint8_t servo_id, const SERVO_POSITION servo_position, const uint8_t servo_value);

#endif //OTHERS_PROTOCOL_H
