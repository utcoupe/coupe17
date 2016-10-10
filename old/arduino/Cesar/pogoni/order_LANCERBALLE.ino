/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ order_LANCERBALLE.ino
  └────────────────────

  Contient les fonctions de l'ordre LANCERBALLE

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/
#include <Servo.h>
#include "order_LANCERBALLE.h"

Servo servogauche; 
Servo servodroit; 

void initOrder_LANCERBALLE() {
  servogauche.attach(PIN_SERVO_BALLES_L);  
  servodroit.attach(PIN_SERVO_BALLES_R);  
  servogauche.write(POS_BALLES_L0);  
  servodroit.write(POS_BALLES_R0);
}

void executeOrder_LANCERBALLE(int lanceur) {
	switch(lanceur)
	{
		case 1:
			servogauche.write(POS_BALLES_L1);  
		break;      
		case 2:
			servodroit.write(POS_BALLES_R1); 
		break;
		case 4:
			servogauche.write(POS_BALLES_L2); 
		break;

		case 5:
			servodroit.write(POS_BALLES_R2); 
		break;
		case 7:
			servogauche.write(POS_BALLES_L3);   
		break;  
		case 8:
			servodroit.write(POS_BALLES_R3);       
		break;
	}
	delay(200); 
	servogauche.write(POS_BALLES_L0);  
	servodroit.write(POS_BALLES_R0);
}
