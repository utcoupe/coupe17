/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 18/11/2013    *
*******************************/
#include <stdlib.h>
#include <urg_utils.h>
#include <math.h>


#include "fast_math.h"
#include "global.h"

double get_val(enum action ask, int index, urg_t *urg){
	static double cos_table[DATA_MAX];
	static double sin_table[DATA_MAX];
	if(ask == calc){
		int i,n;
		n=urg_get_distance(urg, NULL, NULL);
		for(i=0;i<=n;i++){
			cos_table[i] = cos(urg_index2rad(urg, i)+HOKUYO_A);
			sin_table[i] = sin(urg_index2rad(urg, i)+HOKUYO_A);
		}
	}
	else if(ask == cosinus)
		return cos_table[index];
	else if(ask == sinus)
		return sin_table[index];
	return -1;
}

int dist_to_edge(struct coord p){
	int x_to_edge = min(p.x, LX - p.x);
	int y_to_edge = min(p.y, LY - p.y);
	int res = min(x_to_edge, y_to_edge);
	return res;
}

int dist(struct coord p1, struct coord p2){
	int res = abs(p1.x - p2.x) + abs(p1.y - p2.y); //distance = abs( ( x1 - x2 ) + ( y1 - y2) )
	return res;
}
