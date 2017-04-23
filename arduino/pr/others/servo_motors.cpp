//
// Created by tfuhrman on 23/04/17.
//

#include "servo_motors.h"
#include "parameters.h"
#include <Servo.h>
#include <Arduino.h>

//todo init, min & max values for all servo

Servo pr_module_arm;
Servo pr_module_drop_r;
Servo pr_module_drop_l;
Servo pr_module_rotate;

void servoAttach() {
    pr_module_arm.attach(PR_MODULE_ARM_PIN);
    pr_module_drop_r.attach(PR_MODULE_DROP_R_PIN);
    pr_module_drop_l.attach(PR_MODULE_DROP_L_PIN);
    pr_module_rotate.attach(PR_MODULE_ROTATE_PIN);
}

void servoDemo() {
    //todo assume to be the min
    pr_module_arm.write(0);
    delay(500);
    //todo assume to be the max
    pr_module_arm.write(180);
    delay(500);
    pr_module_arm.write(90);
}

void servoAction(SERVO_POSITION position) {

}