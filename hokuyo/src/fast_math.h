/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 18/11/2013    *
*******************************/

#ifndef FAST_MATH_H
#define FAST_MATH_H

#include <urg_utils.h>

#define max(a,b) (a>=b?a:b)
#define min(a,b) (a<=b?a:b)

#define PI 3.14159265358979323846264338327950288

struct coord{
	int x;
	int y;
};

enum action{sinus, cosinus, calc};

double get_val(enum action ask, int index, urg_t *urg);

int dist_to_edge(struct coord p);
int dist(struct coord p1, struct coord p2);

#endif
