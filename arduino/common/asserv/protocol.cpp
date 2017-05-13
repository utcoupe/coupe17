//
// Created by tfuhrman on 09/05/17.
//

#include <Arduino.h>

#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include "protocol.h"
#include "sender.h"
#include <stdlib.h>

//get from old protocol file
extern "C" {
    #include "compat.h"
    #include "robotstate.h"
    #include "control.h"
    #include "goals.h"
    #include "emergency.h"
}

void autoSendStatus() {
    //todo auto_send ?
    SerialSender::SerialSend(SERIAL_INFO, "%c;%i;%i;%i;%i", AUTO_SEND, control.last_finished_id, (int)current_pos.x, (int)current_pos.y,(int)(current_pos.angle*FLOAT_PRECISION));
#if DEBUG_TARGET_SPEED
//    index += sprintf(message+index, ";%i;%i;%i;%i",
//			(int)wheels_spd.left,
//			(int)wheels_spd.right,
//			(int)(control.speeds.linear_speed - control.speeds.angular_speed),
//			(int)(control.speeds.linear_speed + control.speeds.angular_speed));
#endif
}


void ProtocolAutoSendStatus() {
#if AUTO_STATUS_HZ
    static int i=0;
    if (++i % (HZ / AUTO_STATUS_HZ) == 0) {
        autoSendStatus();
    }
#endif
}

uint8_t getLog10(const uint16_t number) {
    if(number>=10000) return 5;
    if(number>=1000) return 4;
    if(number>=100) return 3;
    if(number>=10) return 2;
    return 1;
}

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
            // Ack that arduino has started
            SerialSender::SerialSend(SERIAL_INFO, "%d;", order_id);
            SerialSender::SerialSend(SERIAL_DEBUG, "Arduino %s has started (%d)", ARDUINO_ID, order_id);
            flagArduinoConnected = 1;
            break;
        }
        case HALT:
        {
            // Ack that arduino has stopped
            SerialSender::SerialSend(SERIAL_INFO, "%d;", order_id);
            SerialSender::SerialSend(SERIAL_DEBUG, "Arduino %s has stopped (%d)", ARDUINO_ID, order_id);
            flagArduinoConnected = 0;
            break;
        }
        case PINGPING:
            //todo add LED on arduino
            digitalWrite(LED_DEBUG, HIGH);
            delay(1);
            digitalWrite(LED_DEBUG, LOW);
            break;
        case GET_CODER:
            SerialSender::SerialSend(SERIAL_INFO, "%d;%d;%d", order_id, left_ticks, right_ticks);
            break;
        case GOTO:
        {
            int x, y, direction;
            direction = 0;
            sscanf(receivedOrderPtr, "%i;%i;%i", &x, &y, &direction);
            goal_data_t goal;
            goal.pos_data = {x, y, direction};
            FifoPushGoal(order_id, TYPE_POS, goal);
            break;
        }
        case GOTOA:
        {
            int x, y, a_int, direction;
            float a;
            direction = 0;
            sscanf(receivedOrderPtr, "%i;%i;%i;%i", &x, &y, &a_int, &direction);
            a = a_int / (float)FLOAT_PRECISION;
            goal_data_t goal;
            goal.pos_data = {x, y, direction};
            FifoPushGoal(order_id, TYPE_POS, goal);
            goal.ang_data = {a, 1};
            FifoPushGoal(order_id, TYPE_ANG, goal);
            break;
        }
        case ROT:
        {
            int a_int;
            float a;
            sscanf(receivedOrderPtr, "%i", &a_int);
            a = a_int / (float)FLOAT_PRECISION;
            goal_data_t goal;
            goal.ang_data = {a, 1};
            FifoPushGoal(order_id, TYPE_ANG, goal);
            break;
        }
        case ROTNOMODULO:
        {
            long a_int;
            float a;
            sscanf(receivedOrderPtr, "%li", &a_int);
            a = a_int / (float)FLOAT_PRECISION;
            goal_data_t goal;
            goal.ang_data = {a, 0};
            FifoPushGoal(order_id, TYPE_ANG, goal);
            break;
        }
        case PWM:
        {
            int l, r, t;
            sscanf(receivedOrderPtr, "%i;%i;%i", &l, &r, &t);
            goal_data_t goal;
            goal.pwm_data = {(float)t, l, r};
            FifoPushGoal(order_id, TYPE_PWM, goal);
            break;
        }
        case SPD:
        {
            int l, a, t;
            sscanf(receivedOrderPtr, "%i;%i;%i", &l, &a, &t);
            goal_data_t goal;
            goal.spd_data = {(float)t, l, a};
            FifoPushGoal(order_id, TYPE_SPD, goal);
            break;
        }
        case PIDALL:
        case PIDRIGHT:
        case PIDLEFT:
        {
            long p_int, i_int, d_int;
            float p, i, d;
            sscanf(receivedOrderPtr, "%li;%li;%li", &p_int, &i_int, &d_int);
            p = p_int / (float)FLOAT_PRECISION;
            i = i_int / (float)FLOAT_PRECISION;
            d = d_int / (float)FLOAT_PRECISION;
            if (orderChar == PIDLEFT)
                PIDSet(&PID_left, p, i, d, LEFT_BIAS);
            else if (orderChar == PIDRIGHT)
                PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
            else {
                PIDSet(&PID_left, p, i, d, LEFT_BIAS);
                PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
            }
            break;
        }
        case KILLG:
            FifoNextGoal();
            ControlPrepareNewGoal();
            break;
        case CLEANG:
            FifoClearGoals();
            ControlPrepareNewGoal();
            break;
        case RESET_ID:
            control.last_finished_id = 0;
            break;
        case SET_POS:
        {
            int x, y, a_int;
            float angle;
            sscanf(receivedOrderPtr, "%i;%i;%i", &x, &y, &a_int);
            angle = a_int / (float)FLOAT_PRECISION;
            RobotStateSetPos(x, y, angle);
            break;
        }
        case GET_POS:
        {
            int x, y, a_int;
            float a;
            a = current_pos.angle;
            x = round(current_pos.x);
            y = round(current_pos.y);
            a_int = a * (float)FLOAT_PRECISION;
            SerialSender::SerialSend(SERIAL_INFO, "%d;%d;%d;%d", order_id, x, y, a_int);
            break;
        }
        case GET_SPD:
        {
            int l, r;
            l = wheels_spd.left;
            r = wheels_spd.right;
            SerialSender::SerialSend(SERIAL_INFO, "%d;%d;%d", order_id, l, r);
            break;
        }
        case GET_TARGET_SPD:
        {
            int left_spd, right_spd;
            left_spd = control.speeds.linear_speed - control.speeds.angular_speed;
            right_spd = control.speeds.linear_speed + control.speeds.angular_speed;
            SerialSender::SerialSend(SERIAL_INFO, "%d;%d;%d", order_id, left_spd, right_spd);
            break;
        }
        case GET_POS_ID:
        {
            int x, y, a_int;
            float a;
            a = current_pos.angle;
            x = round(current_pos.x);
            y = round(current_pos.y);
            a_int = a * (float)FLOAT_PRECISION;
            SerialSender::SerialSend(SERIAL_INFO, "%d;%d;%d;%d", order_id, x, y, a_int, control.last_finished_id);
            break;
        }
        case SPDMAX:
        {
            int r_int, s;
            float r;
            sscanf(receivedOrderPtr, "%i;%i", &s, &r_int);
            r = r_int / (float)FLOAT_PRECISION;
            control.max_spd = s;
            control.rot_spd_ratio = r;
            break;
        }
        case ACCMAX:
        {
            int a;
            sscanf(receivedOrderPtr, "%i", &a);
            control.max_acc = a;
            break;
        }
        case GET_LAST_ID:
            SerialSender::SerialSend(SERIAL_INFO, "%d", control.last_finished_id);
            break;
        case PAUSE:
            ControlSetStop(PAUSE_BIT);
            break;
        case RESUME:
            ControlUnsetStop(PAUSE_BIT);
            break;
        case WHOAMI:
            SerialSender::SerialSend(SERIAL_INFO, ARDUINO_ID);
            break;
        case SETEMERGENCYSTOP:
        {
            int enable;
            sscanf(receivedOrderPtr, "%i", &enable);
            EmergencySetStatus(enable);
            break;
        }
        default:
            SerialSender::SerialSend(SERIAL_INFO, "Order %c is wrong !", orderChar);
    }
}

