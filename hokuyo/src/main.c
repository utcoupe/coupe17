/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 30/09/2013    *
*******************************/

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "global.h"
#include "fast_math.h"
#include "analyzer.h"
#include "frame.h"

#ifdef SDL
#include "sdl.h"
#endif

int main(int argc, char **argv){
	//INITIALISATION
	urg_t urg;
	struct urg_params hokuyo;

	hokuyo.ptr = &urg;
	hokuyo.x = HOKUYO_X;
	hokuyo.y = HOKUYO_Y;

	int error = 1;
	
	while (error) {
		error = init(hokuyo.ptr);
	}

	if(error < 0){
		fprintf(stderr, "Erreur de connection\n");
		exit(EXIT_FAILURE);
	}

	//On initialise la structure hokuyo avec ses paramètres de side et de position
	if(argc >= 2){
		if(strcmp(argv[1], "green") == 0)
			hokuyo.side = GREEN_SIDE;
		else if(strcmp(argv[1], "yellow") == 0)
			hokuyo.side = YELLOW_SIDE;
	}
	else{
		fprintf(stderr, "Préciser un side (blue/red)\n");
		exit(EXIT_FAILURE);
	}

	fprintf(stderr, "Hokuyo initialized\n");

#ifdef SDL
	affichage_sdl(hokuyo);
#else
	printf("[HI:)] Hello !");
	while(1) {
		frame(hokuyo);
	}
#endif
	return 0;
}
