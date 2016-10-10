/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ order_BLINK.h
  └────────────────────

  Contient les prototypes des fonctions de order_BLINK.ino

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDER_BLINK_H
#define ORDER_BLINK_H

void initOrder_BLINK();
void executeOrder_BLINK(int new_pwm, long new_delay);
void loopOrder_BLINK();

#endif