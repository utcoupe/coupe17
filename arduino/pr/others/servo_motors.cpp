//
// Created by tfuhrman on 23/04/17.
//

#include "servo_motors.h"
#include "parameters.h"
#include "sender.h"
#include <Servo.h>
#include <Arduino.h>
#include "color_sensor_tcs3200.h"
#include <Timer.h>

//todo create a real servo object ??

void servoApplyCommand(uint8_t servo_id, uint8_t value);

//todo min & max values for all servo

Servo pr_module_arm;
Servo pr_module_drop_r;
Servo pr_module_drop_l;
Servo pr_module_rotate;

// parameters are : INIT, OPEN, CLOSE, ACTION_TIME(ms)
uint8_t servoValues[4][4] = {
        {90, 10, 170, 100},      //PR_MODULE_ARM
        {80, 180, 80, 100},      //PR_MODULE_DROP_R
        {90, 10, 90, 100},       //PR_MODULE_DROP_L
        {90, 10, 170, 200}       //PR_MODULE_ROTATE
};

//todo adjust timer time
Timer armTimer = Timer(servoValues[PR_MODULE_ARM][TIMER], &servoArmCallback);
Timer dropRTimer = Timer(servoValues[PR_MODULE_DROP_R][TIMER], &servoDropRCallback);
Timer dropLTimer = Timer(servoValues[PR_MODULE_DROP_L][TIMER], &servoDropLCallback);
Timer rotateTimer = Timer(servoValues[PR_MODULE_ROTATE][TIMER], &servoRotateCallback);

//todo dynamic structure with mapping servo_id - order_id ?
// 0 is the default value, stands for no order
uint16_t armLastId = 0;
uint16_t dropRLastId = 0;
uint16_t dropLLastId = 0;
MODULE_COLOR servoRotateColor = WHATEVER;

//todo find a way for the size
//servoInformation servoData[MAX_SERVO]= {
//        {PR_MODULE_ARM, INIT, 90},
//        {PR_MODULE_ARM, OPEN, 0},
//        {PR_MODULE_ARM, CLOSE, 150},
//        {PR_MODULE_DROP_R, OPEN, 90},
//        {PR_MODULE_DROP_R, CLOSE, 90},
//        {PR_MODULE_DROP_L, OPEN, 90},
//        {PR_MODULE_DROP_L, CLOSE, 90},
//        {PR_MODULE_ROTATE, OPEN, 90},
//};

void servoAttach() {
    pr_module_arm.attach(PR_MODULE_ARM_PIN);
    pr_module_drop_r.attach(PR_MODULE_DROP_R_PIN);
    pr_module_drop_l.attach(PR_MODULE_DROP_L_PIN);
    pr_module_rotate.attach(PR_MODULE_ROTATE_PIN);
    // Apply default values
    pr_module_arm.write(servoValues[PR_MODULE_ARM][INIT]);
    pr_module_drop_r.write(servoValues[PR_MODULE_DROP_R][INIT]);
    pr_module_drop_l.write(servoValues[PR_MODULE_DROP_L][INIT]);
    pr_module_rotate.write(servoValues[PR_MODULE_ROTATE][INIT]);
}

void servoDemo() {
    //todo assume to be the min
    pr_module_arm.write(0);
    delay(1000);
    //todo assume to be the max
//    pr_module_arm.write(90);
//    delay(1000);
    pr_module_arm.write(170);
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

//todo put the timer start in another function to avoid multiple call ba protocol.cpp
void servoApplyCommand(uint8_t servo_id, uint8_t value) {
    if (value < MAX_UINT8_T_VALUE) {
        switch (servo_id) {
            case PR_MODULE_ARM:
                armTimer.Start();
                //todo use real order id...
                armLastId = 36;
                pr_module_arm.write(value);
                break;
            case PR_MODULE_DROP_R:
                dropRTimer.Start();
                //todo use real order id...
                dropRLastId = 36;
                pr_module_drop_r.write(value);
                break;
            case PR_MODULE_DROP_L:
                dropLTimer.Start();
                //todo use real order id...
                dropLLastId = 36;
                pr_module_drop_l.write(value);
                break;
            case PR_MODULE_ROTATE:
                pr_module_rotate.write(value);
                break;
            default:
                SerialSender::SerialSend(SERIAL_INFO, "Servo %d doesn't exist...", servo_id);
                break;
        }
    } else {
        SerialSender::SerialSend(SERIAL_INFO, "Value %d for servo %d doesn't exist...", value, servo_id);
    }
}

void servoChangeParameter(const uint8_t servo_id, const SERVO_POSITION servo_position, const uint8_t servo_value) {
    SerialSender::SerialSend(SERIAL_INFO, "servo=%d, pos=%d, value=%d", servo_id, servo_position, servo_value);
    //todo servo id as define
    if ((servo_id < MAX_SERVO) && (servo_position < NB_POS) && (servo_position < MAX_UINT8_T_VALUE)) {
        servoValues[servo_id][servo_position] = servo_value;
    } else {
        SerialSender::SerialSend(SERIAL_INFO, "Servo id (%d) or servo position (%d) is not correct", servo_id, servo_position);
    }
}

void servoRotate(MODULE_COLOR color) {
    //if color is whatever, no need to rotate
    SerialSender::SerialSend(SERIAL_INFO, "servoRotate color : %d", color);
    if (color != WHATEVER) {
        // Activate rotation
        servoAction(PR_MODULE_ROTATE, OPEN);
        servoRotateColor = color;
        rotateTimer.Start();
    }
}

void servoRotateCallback() {
    if (servoRotateColor != WHATEVER) {
        if (computeColor() == servoRotateColor) {
            // Stop the rotate servo motor
            servoAction(PR_MODULE_ROTATE, INIT);
            // Put the global variable to default value
            servoRotateColor = WHATEVER;
            //todo send a message to the IA to advertise that color is ok
            rotateTimer.Stop();
        }
    }
}

void servoArmCallback() {
    if (armLastId != 0) {
        SerialSender::SerialSend(SERIAL_INFO, "%d;", armLastId);
        armLastId = 0;
        armTimer.Stop();
    }
}

void servoDropRCallback() {
    if (dropRLastId != 0) {
        SerialSender::SerialSend(SERIAL_INFO, "%d;", dropRLastId);
        dropRLastId = 0;
        dropRTimer.Stop();
    }
}

void servoDropLCallback() {
    if (dropLLastId != 0) {
        SerialSender::SerialSend(SERIAL_INFO, "%d;", dropLLastId);
        dropLLastId = 0;
        dropLTimer.Stop();
    }
}

void servoTimerUpdate() {
    armTimer.Update();
    dropRTimer.Update();
    dropLTimer.Update();
    rotateTimer.Update();
}


/*pr_module_arm :
 * initial value : 90
 * open value : 0
 * close value : 90
 * push module value : 150
 */