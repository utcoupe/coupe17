/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ communication_xbee.h
  └────────────────────

  Contain all prototypes of communication_xbee.ino

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDER_MOVEROBOT_H
#define ORDER_MOVEROBOT_H

#include "AFMotor.h"

#define NO_PWM  0
#define KUP     0
#define KDOWN   1
#define KLEFT   2
#define KRIGHT  3
#define KPDOWN  0
#define KPUP    1

void initOrder_MOVEROBOT();
void executeOrder_MOVEROBOT(int type, int dir);
void loopOrder_MOVEROBOT();

void set_pwm_right(int pwm);
void set_pwm_left(int pwm);
#endif
