#ifndef HOKUYO_CONFIG_H
#define HOKUYO_CONFIG_H

#include "fast_math.h"
#include <urg_ctrl.h>

#define SERIAL_STR_LEN 20

typedef struct ScanZone {
	int xmin, xmax, ymin, ymax;
} ScanZone_t;

typedef struct Angles {
	double pitch; // tangage
	double heading; // cap²
} Angles_t;

typedef struct Hokuyo {
	urg_t* urg;
	Pt_t pt;
	ScanZone_t zone;
	double orientation, cone_min, cone_max; //Scanne dans ori-cone;ori+cone
	int imin, imax, nb_data, isWorking;
	char *path;
	double error; // non utilisé coupe14, utilisé pour l'erreur de cap maintenant
	struct fastmathTrigo fm; // enregistre les cos et sin pour les n angles
} Hok_t;

int detectHokuyos(char (*paths)[SERIAL_STR_LEN], int nr);
Hok_t initHokuyo(char *path, double ori, double cone_min, double cone_max, Pt_t pt);
// void initWizard(Hok_t *hok1, Hok_t *hok2, int symetry);
void checkAndConnect(Hok_t *hok);
Hok_t applySymetry(Hok_t hok);

// IN : struct hokuyo, position (3 = côté ( -| ), 4 = coin ( _| ))
// OUT : erreur d'assiette/tangage th (angle en rad), erreur de cap
// Angles_t frameWizard(Hok_t *hok, int hok_pos, int symetry);

#endif
