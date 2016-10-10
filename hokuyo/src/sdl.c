/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 30/09/2013    *
*******************************/
#ifdef SDL

#include <SDL.h>
#include "sdl.h"
#include "global.h"
#include "fast_math.h"
#include "analyzer.h"
#include <time.h>

void affichage_sdl(struct urg_params hokuyo){
	struct coord data[DATA_MAX], robots_pos[DETECTABLE_ROBOTS];
	int i, n_data, n_robots, continuer = 1;

	//INITIALISATION DES ELEMENTS SDL

	//Initialisation de la fenetre
	SDL_Surface *ecran = NULL, *sdl_points, *sdl_robots, *sdl_hokuyo;
	SDL_Rect sdl_points_position[DATA_MAX], sdl_robots_position[DETECTABLE_ROBOTS], sdl_hokuyo_pos;
	SDL_Init(SDL_INIT_VIDEO);
	SDL_Event event;
	ecran = SDL_SetVideoMode(X_WINDOW_RESOLUTION, Y_WINDOW_RESOLUTION, 32, SDL_HWSURFACE);
	if(ecran == NULL){
		fprintf(stderr, "Erreur chargement SDL");
		exit(EXIT_FAILURE);
	}
	SDL_WM_SetCaption("Hokuyo", NULL);
	SDL_FillRect(ecran, NULL, SDL_MapRGB(ecran->format, 200, 200, 200));

	//Creation des points et des robots
	sdl_points = SDL_CreateRGBSurface(SDL_HWSURFACE, 2, 2, 32, 0, 0, 0, 0);
	SDL_FillRect(sdl_points, NULL, SDL_MapRGB(ecran->format, 255, 0, 0));
	sdl_robots = SDL_CreateRGBSurface(SDL_HWSURFACE, 30, 30, 32, 0, 0, 0, 0);
	SDL_FillRect(sdl_robots, NULL, SDL_MapRGB(ecran->format, 0, 255, 0));
	sdl_hokuyo = SDL_CreateRGBSurface(SDL_HWSURFACE, 20, 20, 32, 0, 0, 0, 0);
	SDL_FillRect(sdl_hokuyo, NULL, SDL_MapRGB(ecran->format, 50, 50, 255));

	printf("SDL Initialized\n");
	
	//RECUPERATION ET AFFICHAGE DES POINTS
	while(continuer){
		SDL_PollEvent(&event); // On doit utiliser PollEvent car il ne faut pas attendre d'évènement de l'utilisateur pour mettre à jour la fenêtre
		switch(event.type)
		{
			case SDL_QUIT:
				continuer = 0;
			        break;
		}
		//Recuperation des poins
		n_data = get_points_2d(hokuyo, data);
		printf("got %dpts\n", n_data);
		SDL_FillRect(ecran, NULL, SDL_MapRGB(ecran->format, 200, 200, 200));//on clean l'ecran
		//Recuperation des robots
		n_robots = get_robots_2d(robots_pos, data, n_data);
		printf("got %drob\n", n_robots);
		for(i=0;i<n_robots;i++){
			//affichage des robots
			sdl_robots_position[i].x = robots_pos[i].x*X_WINDOW_RESOLUTION/LX;
			sdl_robots_position[i].x -= 30/2; //pour que le robot soit CENTRE sur son point
			sdl_robots_position[i].y = Y_WINDOW_RESOLUTION - (robots_pos[i].y*Y_WINDOW_RESOLUTION/LY);//attention, l'origine en SDL est en haut à gauche
			sdl_robots_position[i].y -= 30/2; //pour que le robot soit CENTRE sur son point
			SDL_BlitSurface(sdl_robots, NULL, ecran, &sdl_robots_position[i]);
		}
		for(i=0;i<n_data;i++){
			//affichage des points
			sdl_points_position[i].x = data[i].x*X_WINDOW_RESOLUTION/LX;
			sdl_points_position[i].y = Y_WINDOW_RESOLUTION - (data[i].y*Y_WINDOW_RESOLUTION/LY);//attention, l'origine en SDL est en haut à gauche
			SDL_BlitSurface(sdl_points, NULL, ecran, &sdl_points_position[i]);
		}
		sdl_hokuyo_pos.x = HOKUYO_X;
		sdl_hokuyo_pos.x -= 20/2;
		sdl_hokuyo_pos.y = Y_WINDOW_RESOLUTION - HOKUYO_Y;
		sdl_hokuyo_pos.y -= 20/2;
		SDL_BlitSurface(sdl_hokuyo, NULL, ecran, &sdl_hokuyo_pos);
		SDL_Flip(ecran);
	}
	SDL_FreeSurface(sdl_points);
	SDL_FreeSurface(sdl_robots);
	SDL_Quit();
}

#endif
