//
// Created by tfuhrman on 23/04/17.
//

#include "servo_motors.h"
#include "parameters.h"
#include "sender.h"
#include <Servo.h>
#include <Arduino.h>

void servoApplyCommand(uint8_t servo_id, uint8_t value);

//todo init, min & max values for all servo

Servo pr_module_arm;
Servo pr_module_drop_r;
Servo pr_module_drop_l;
Servo pr_module_rotate;

//todo find a way for the size
servoInformation servoData[MAX_SERVO]= {
        {PR_MODULE_ARM, INIT, 90},
        {PR_MODULE_ARM, OPEN, 0},
        {PR_MODULE_ARM, CLOSE, 150},
        {PR_MODULE_DROP_R, OPEN, 90},
        {PR_MODULE_DROP_R, CLOSE, 90},
        {PR_MODULE_DROP_L, OPEN, 90},
        {PR_MODULE_DROP_L, CLOSE, 90},
        {PR_MODULE_ROTATE, OPEN, 90},
};

uint8_t servoValues[4][3] = {
        {90, 0, 150},   //PR_MODULE_ARM - INIT, OPEN, CLOSE
        {255, 255, 255},   //PR_MODULE_DROP_R - INIT, OPEN, CLOSE
        {255, 255, 255},   //PR_MODULE_DROP_L - INIT, OPEN, CLOSE
        {255, 255, 255}    //PR_MODULE_ROTATE - INIT, OPEN, CLOSE
};

void servoAttach() {
    pr_module_arm.attach(PR_MODULE_ARM_PIN);
    pr_module_drop_r.attach(PR_MODULE_DROP_R_PIN);
    pr_module_drop_l.attach(PR_MODULE_DROP_L_PIN);
    pr_module_rotate.attach(PR_MODULE_ROTATE_PIN);
}

void servoDemo() {
    //todo assume to be the min
    pr_module_arm.write(0);
    delay(1000);
    //todo assume to be the max
    pr_module_arm.write(90);
    delay(1000);
    pr_module_arm.write(150);
    delay(1000);
}

void open() {
    pr_module_arm.write(0);
    delay(400);
}

void servoAction(uint8_t servo_id, SERVO_POSITION position) {
    //todo maximal servo id as define
    if ((servo_id < 4) && (position < NB_POS)) {
        servoApplyCommand(servo_id, servoValues[servo_id][position]);
    } else {
        SerialSender::SerialSend(SERIAL_INFO, "Servo %d doesn't exist or position %d is unknown...", servo_id, position);
    }
}

void servoApplyCommand(uint8_t servo_id, uint8_t value) {
    if (value < 255) {
        switch (servo_id) {
            case PR_MODULE_ARM:
                pr_module_arm.write(value);
                break;
            default:
                SerialSender::SerialSend(SERIAL_INFO, "Servo %d doesn't exist...", servo_id);
                break;
        }
    } else {
        SerialSender::SerialSend(SERIAL_INFO, "Value %d for servo %d doesn't exist...", value, servo_id);
    }
}

/*pr_module_arm :
 * initial value : 90
 * open value : 0
 * close value : 90
 * push module value : 150
 */