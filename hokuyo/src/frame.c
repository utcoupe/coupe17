#include "frame.h"
#include "global.h"
#include "fast_math.h"
#include "analyzer.h"

#include <stdio.h>

void frame(struct urg_params hokuyo){
	struct coord data[DATA_MAX], robots_pos[DETECTABLE_ROBOTS];
	int i, n_data, n_robots;

	//Recuperation des poins
	n_data = get_points_2d(hokuyo, data);
	//Recuperation des robots
	n_robots = get_robots_2d(robots_pos, data, n_data);

	printf("[DATA]");
	for (i=0; i<n_robots; i++) {
		if (i>0) {
			printf("#");
		}
		printf("%d,%d", robots_pos[i].x, robots_pos[i].y);
	}
	printf("\n");
	fflush(stdout);
}
