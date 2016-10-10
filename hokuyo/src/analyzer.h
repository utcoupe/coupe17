/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 17/11/2013    *
*******************************/

#ifndef ANALYZER_H
#define ANALYZER_H

#include "fast_math.h"

#define BAUDRATE 115200
#define YELLOW_SIDE 0
#define GREEN_SIDE 1

struct urg_params{
	urg_t *ptr;
	int x, y;
	int side;
};

struct points_group{
	struct coord first;
	struct coord last;
	struct coord coord;
	int size;
	int valid;
};

int init(urg_t *urg);//renvoie un pointeur sur l'urg en échange de l'ID su port
int get_points_2d(struct urg_params urg, struct coord *points);//*points peut être un pointeur NULL ou un pointeur déjà passé à cette fonction
int get_robots_2d(struct coord *robot_pos, struct coord *points, int n); 
void error_func(urg_t *urg, const char *message);//disconnect l'hokuyo, et écrit un message d'erreur

#endif
