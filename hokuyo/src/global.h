/*******************************
* Quentin CHATEAU pour UTCOUPE *
* quentin.chateau@gmail.com    *
* Last edition : 17/11/2013    *
*******************************/

#ifndef GLOBAL_H
#define GLOBAL_H

#define LX 3000.0 //longueur de la table en mm
#define LY 2000.0 //largeur de la table en mm

#define X_WINDOW_RESOLUTION 1050 
#define Y_WINDOW_RESOLUTION 700

//distance (mm) minimale entre un robot et le bord de la carte pour que
//le robot soit accepté. Cela permet d'éviter de détercter des personnes
//se promenant trop près du bord.
#define MIN_DIST_TO_EDGE 30 
#define DIST_DIFF_GROUP 100 //taille en mm entre eux robots
#define POINTS_MIN 2

#define DETECTABLE_ROBOTS 100

// postion de l'hokuyo par rapport au coin inférieur droit
// le coin est dépendant du side, c'est à dire que la valeur
// n'est pas dépendante du side
#define HOKUYO_X 3040
#define HOKUYO_Y 1000
#define HOKUYO_A PI
#define ANGLE_MIN -PI/2
#define ANGLE_MAX PI/2


//**********
// PRIVATE *
//**********

#define DATA_MAX 700
#define MAX_GROUPS 350 //résolution/2

#endif
