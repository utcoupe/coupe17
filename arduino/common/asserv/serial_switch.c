/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 18/12/13			*
 ****************************************/

#include <stdio.h>
#include "serial_switch.h"
#include "robotstate.h"
#include "protocol.h"
#include "control.h"
#include "encoder.h"
#include "compat.h"
#include "pins.h"
#include "goals.h"
#include "emergency.h"

//La fonction renvoit le nombre d'octet dans ret, chaine de caractère de réponse. Si doublon, ne pas executer d'ordre mais renvoyer les données à renvoyer
int switchOrdre(char ordre, int id, char *argv, char *ret, int *ret_size){ 
	*ret_size = 0;
	switch(ordre){
	case PINGPING:
		digitalWrite(LED_DEBUG, HIGH);
		delay(1);
		digitalWrite(LED_DEBUG, LOW);
		break;
	case GET_CODER:
		*ret_size = sprintf(ret, "%li;%li", left_ticks, right_ticks);
		break;
	case GOTO: {
		int x, y, direction;
		direction = 0;
		sscanf(argv, "%i;%i;%i", &x, &y, &direction);
		FifoPushGoal(id, TYPE_POS, POS_DATA(x, y, direction));
		}
		break;
	case GOTOA: {
		int x, y, a_int, direction;
		float a;
		direction = 0;
		sscanf(argv, "%i;%i;%i;%i", &x, &y, &a_int, &direction);
		a = a_int / (float)FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_POS, POS_DATA(x,y,direction));
		FifoPushGoal(id, TYPE_ANG, ANG_DATA(a,1));
		}
		break;
	case ROT: {
		int a_int;
		float a;
		sscanf(argv, "%i", &a_int);
		a = a_int / (float)FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_ANG, ANG_DATA(a,1));
		}
		break;
	case ROTNOMODULO: {
		long a_int;
		float a;
		sscanf(argv, "%li", &a_int);
		a = a_int / (float)FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_ANG, ANG_DATA(a,0));
		}
		break;
	case PWM:{
		int l, r, t;
		sscanf(argv, "%i;%i;%i", &l, &r, &t);
		FifoPushGoal(id, TYPE_PWM, PWM_DATA(l, r, t));
		}
		break;
	case SPD:{
		int l, a, t;
		sscanf(argv, "%i;%i;%i", &l, &a, &t);
		FifoPushGoal(id, TYPE_SPD, SPD_DATA(l, a, t));
		}
		break;
	case PIDALL:
	case PIDRIGHT:
	case PIDLEFT:{
		long p_int, i_int, d_int;
		float p, i, d;
		sscanf(argv, "%li;%li;%li", &p_int, &i_int, &d_int);
		p = p_int / (float)FLOAT_PRECISION;
		i = i_int / (float)FLOAT_PRECISION;
		d = d_int / (float)FLOAT_PRECISION;
		if (ordre == PIDLEFT) 
			PIDSet(&PID_left, p, i, d, LEFT_BIAS);
		else if (ordre == PIDRIGHT)
			PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
		else {
			PIDSet(&PID_left, p, i, d, LEFT_BIAS);
			PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
		}
		}
		break;
	case KILLG:
		FifoNextGoal();
		ControlPrepareNewGoal();
		break;
	case CLEANG:{
		FifoClearGoals();
		ControlPrepareNewGoal();
		}
		break;
	case RESET_ID:
		control.last_finished_id = 0;
		break;
	case SET_POS:{
		int x, y, a_int;
		float angle;
		sscanf(argv, "%i;%i;%i", &x, &y, &a_int);
		angle = a_int / (float)FLOAT_PRECISION;
		RobotStateSetPos(x, y, angle);
		}
		break;
	case GET_POS:{
		int x, y, a_int;
		float a;
		a = current_pos.angle;
	       	x = round(current_pos.x);
		y = round(current_pos.y);
		a_int = a * (float)FLOAT_PRECISION;
		*ret_size = sprintf(ret, "%i;%i;%i", x, y, a_int);
		}
		break;
	case GET_SPD: {
		int l, r;
		l = wheels_spd.left;
		r = wheels_spd.right;
		*ret_size = sprintf(ret, "%i;%i", l, r);
		}
		break;
	case GET_TARGET_SPD: {
		int left_spd, right_spd;
		left_spd = control.speeds.linear_speed - control.speeds.angular_speed;
		right_spd = control.speeds.linear_speed + control.speeds.angular_speed;
		*ret_size = sprintf(ret, "%i;%i", left_spd, right_spd);
		}
		break;
	case GET_POS_ID:{
		int x, y, a_int;
		float a;
		a = current_pos.angle;
	       	x = round(current_pos.x);
		y = round(current_pos.y);
		a_int = a * (float)FLOAT_PRECISION;
		*ret_size = sprintf(ret, "%i;%i;%i;%i", x, y, a_int, control.last_finished_id);
		}
		break;
	case SPDMAX:{
		int r_int, s;
		float r;
		sscanf(argv, "%i;%i", &s, &r_int);
		r = r_int / (float)FLOAT_PRECISION;
		control.max_spd = s;
		control.rot_spd_ratio = r;
		}
		break;
	case ACCMAX:{
		int a;
		sscanf(argv, "%i", &a);
		control.max_acc = a;
		}
		break;
	case GET_LAST_ID: {
		*ret_size = sprintf(ret, "%i", control.last_finished_id);
		break;
		}
	case PAUSE: 
		ControlSetStop(PAUSE_BIT);
		break;
	case RESUME:
		ControlUnsetStop(PAUSE_BIT);
		break;
	case WHOAMI:
		*ret_size = sprintf(ret, ARDUINO_ID);
		break;
	case SETEMERGENCYSTOP: {
		int enable;
		sscanf(argv, "%i", &enable);
		EmergencySetStatus(enable);
		}
		break;
	default:
		return -1;//commande inconnue
	}
	return 0;
}
