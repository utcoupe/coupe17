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

#include "AFMotor.h"
#include "order_MOVEROBOT.h"

AF_DCMotor motor_left(1, MOTOR12_64KHZ);
AF_DCMotor motor_right(2, MOTOR12_64KHZ);

static int current_pwm = 0;
static int current_pwm_left = 0;
static float acceleration = 0.500; // PWM / secondes (1000 ms)
static bool status[4] = {false,false,false,false};

static unsigned long previous_time;

static int PMW_MAX = 255;

void initOrder_MOVEROBOT() {
	set_pwm_right(0);
	set_pwm_left(0);
	previous_time = millis();
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
        
	if(status[KUP])
		current_pwm += int(float(delay_time) * acceleration);
	else if(status[KDOWN])
		current_pwm -= int(float(delay_time) * acceleration);
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

	if(current_pwm_left >= 0) {
		set_pwm_right(current_pwm + current_pwm_left);
		set_pwm_left(current_pwm - current_pwm_left);
	}
	else {
		set_pwm_right(current_pwm + current_pwm_left);
		set_pwm_left(current_pwm - current_pwm_left);
	}

	previous_time = current_time;
}

void set_pwm_left(int pwm){
	pwm = -pwm;//les moteurs sont faces à face, pour avancer il faut qu'il tournent dans un sens différent
	/*
	if (pwm > 0)
		pwm += PWM_MIN;
	else if (pwm < 0)
		pwm -= PWM_MIN;
	*/
	if(pwm > 255)
		pwm = 255;
	else if(pwm < -255)
		pwm = -255;

	if(pwm >= 0)
		motor_left.run(FORWARD);
	else
		motor_left.run(BACKWARD);

	motor_left.setSpeed(abs(pwm));
}

void set_pwm_right(int pwm) {
	/*
	if (pwm > 0)
		pwm += PWM_MIN;
	else if (pwm < 0)
		pwm -= PWM_MIN;
	*/
	if(pwm > 255)
		pwm = 255;
	else if(pwm < -255)
		pwm = -255;

	if(pwm >= 0)
		motor_right.run(FORWARD);
	else
		motor_right.run(BACKWARD);
	
	motor_right.setSpeed(abs(pwm));
}


