//
// Created by tfuhrman on 23/04/17.
//

#ifndef ARDUINO_SERVO_MOTORS_H
#define ARDUINO_SERVO_MOTORS_H

#include "protocol.h"
#include <stdint.h>


struct servoInformation {
    uint8_t servoId;
    SERVO_POSITION position;
    uint8_t value;
};

extern servoInformation servoData[];

void servoAttach();
void servoDemo();
void servoAction(uint8_t servo_id, SERVO_POSITION position);
void servoChangeParameter(const uint8_t servo_id, const SERVO_POSITION servo_position, const uint8_t servo_value);
void open();

#endif //ARDUINO_SERVO_MOTORS_H
