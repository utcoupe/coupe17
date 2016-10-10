/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ order_LANCERBALLE.h
  └────────────────────

  Contient les prototypes des fonctions de order_LANCERBALLE.ino

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDER_LANCERBALLE_H
#define ORDER_LANCERBALLE_H

#define POS_BALLES_L0 4
#define POS_BALLES_R0 20 
#define POS_BALLES_L1 15
#define POS_BALLES_R1 11
#define POS_BALLES_L2 23
#define POS_BALLES_R2 5
#define POS_BALLES_L3 30
#define POS_BALLES_R3 3
#define PIN_SERVO_BALLES_L 38
#define PIN_SERVO_BALLES_R 30

void initOrder_LANCERBALLE();
void executeOrder_LANCERBALLE(int lanceur);

#endif