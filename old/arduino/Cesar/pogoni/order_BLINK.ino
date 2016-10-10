/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ order_BLINK.ino
  └────────────────────

  Contient les fonctions de l'ordre BLINK

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "order_BLINK.h"

static const int PIN_LED = 13;
static int pwm = 255;
static bool led_active = false;
static long delay_active = 1000;

static unsigned long previous_time = millis();

void initOrder_BLINK() {
  pinMode(PIN_LED, OUTPUT); 
  analogWrite(PIN_LED, LOW);
}

void executeOrder_BLINK(int new_pwm, long new_delay) {
  pwm = new_pwm;
  delay_active = new_delay;
}

void loopOrder_BLINK() {
  unsigned long current_time = millis();

  if(current_time > previous_time + delay_active) {
    if(led_active) {
      analogWrite(PIN_LED, LOW);
    }
    else {
      analogWrite(PIN_LED, pwm);
    }

    previous_time = current_time;
    led_active = !led_active;
  }
}
