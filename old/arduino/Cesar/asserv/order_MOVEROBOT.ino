/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ AFMotor.ino
  └────────────────────

  Adafruit Motor shield library
  copyright Adafruit Industries LLC, 2009
  this code is public domain, enjoy!
  Adapté pour UTCoupe2011 par Arthur, 19/01/2011
  Moteurs 1 et 2 correspondent à la carte Rugged

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "brushlessMotor.h"
#include "order_MOVEROBOT.h"

BrushlessMotor motor_left(MOTOR_LEFT);
BrushlessMotor motor_right(MOTOR_RIGHT);

static int current_pwm = 0;
static int current_pwm_left = 0;
static bool status[4] = {false,false,false,false};

static unsigned long previous_time;

static float acceleration = 0.100; // PWM / secondes (1000 ms)
static int PMW_MAX = 128;

void initOrder_MOVEROBOT() {
  set_pwm_left(30);
  set_pwm_right(30);
}

void executeOrder_MOVEROBOT(int type, int dir) {
	bool new_state;
	if(type == KPDOWN)
		new_state = true;
	else
		new_state = false;

	status[dir] = new_state;
}

void loopOrder_MOVEROBOT() {
  	unsigned long current_time = millis();
	int i;
	unsigned long delay_time = current_time - previous_time;
    if(delay_time > 30) {
	if(status[KUP])
		current_pwm += int(float(delay_time) * acceleration);
	else if(status[KDOWN])
		current_pwm -= int(float(delay_time) * acceleration);
    /*else if(!status[KUP] && !status[KDOWN]) {
          // Décélération
          if(current_pwm > 0) {
            current_pwm -= int(float(delay_time) * acceleration * 2);
            if(current_pwm < 0)
              current_pwm = 0;
          }
          else if(current_pwm < 0) {
            current_pwm += int(float(delay_time) * acceleration * 2);
            if(current_pwm > 0)
              current_pwm = 0;
          }
        }
    */
        else
          current_pwm = 0;
	if(current_pwm > PMW_MAX) current_pwm = PMW_MAX;
	if(current_pwm < -PMW_MAX) current_pwm = -PMW_MAX;

	if(status[KLEFT])
		current_pwm_left += int(float(delay_time) * acceleration);
	else if(status[KRIGHT])
		current_pwm_left -= int(float(delay_time) * acceleration);
    else
        current_pwm_left = 0;
	if(current_pwm_left > PMW_MAX*2) current_pwm_left = PMW_MAX*2;
	if(current_pwm_left < -PMW_MAX*2) current_pwm_left = -PMW_MAX*2;

	set_pwm_left(current_pwm + current_pwm_left);
	set_pwm_right(current_pwm - current_pwm_left);

	previous_time = current_time;
    }
}

void set_pwm_left(int pwm){
	if (pwm != NO_PWM) {
		pwm += 127;

		if(pwm > 255)
			pwm = 255;
		else if(pwm < 0)
			pwm = 0;
	}
	motor_left.setPwm(pwm);
}

void set_pwm_right(int pwm) {
	if (pwm != NO_PWM) {
		pwm += 127;

		if(pwm > 255)
			pwm = 255;
		else if(pwm < 0)
			pwm = 0;

		pwm = 255 - pwm; // Moteur pas dans le même sens
	}
	motor_right.setPwm(pwm);
}


