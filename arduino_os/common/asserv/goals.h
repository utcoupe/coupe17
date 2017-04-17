/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#ifndef GOALS_H
#define GOALS_H

#include "parameters.h"
#define MAX_GOALS 15 //nombre max de goals dans la file, évite surcharge mémoire

#define TYPE_POS 1
#define TYPE_ANG 2
#define TYPE_PWM 3
#define TYPE_SPD 4
#define NO_GOAL -1
#define STRUCT_NO_GOAL {.type = NO_GOAL, .is_reached=0}

#define POS_DATA(px,py,direction) ((goal_data_t){ .pos_data=(pos_data_t){.x=px, .y=py, .d=direction}})
#define ANG_DATA(a,m) ((goal_data_t){ .ang_data=(ang_data_t){.angle=a, .modulo=m}})
#define PWM_DATA(l,r,t) ((goal_data_t){ .pwm_data=(pwm_data_t){.pwm_l=l, .pwm_r=r, .time=t}})
#define SPD_DATA(l,a,t) ((goal_data_t){ .spd_data=(spd_data_t){.lin=l, .ang=a, .time=t}})

typedef struct pos_data {
	int x, y, d;
} pos_data_t;

typedef struct ang_data {
	float angle;
	int modulo;
} ang_data_t;

typedef struct pwm_data {
	float time;
	int pwm_l, pwm_r;
} pwm_data_t;

typedef struct spd_data {
	float time;
	int lin, ang;
} spd_data_t;

typedef union goal_data {
	pos_data_t pos_data;
	ang_data_t ang_data;
	pwm_data_t pwm_data;
	spd_data_t spd_data;
} goal_data_t;

typedef struct goal {
	goal_data_t data;
	int type;
	int ID;
	int is_reached;
} goal_t;

typedef struct fifo {
	goal_t fifo[MAX_GOALS];
	int nb_goals;
	int current_goal;
	int last_goal;

} fifo_t;

extern fifo_t fifo;
void FifoInit();
int FifoPushGoal(int ID, int type, goal_data_t data);
goal_t* FifoCurrentGoal();
goal_t* FifoNextGoal();
extern inline void FifoClearGoals() { FifoInit(); }

#endif
