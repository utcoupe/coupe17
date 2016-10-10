#include "communication.h"
#include "fast_math.h"
#include "global.h"

#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <stdio.h>

extern FILE* logfile;

void sayHello(){
    printf("[HI:)] Hello !\n");
    fflush(stdin);
}

void pushResults(Cluster_t *coords, int nbr, long timestamp) {
    // timestamp not used !! XXX

    char message[50];

    strcpy(message, "[DATA]");

    for(int i=0; i<nbr; i++){
        sprintf(message, "%s%i,%i", message, coords[i].center.x, coords[i].center.y);
        if (i < nbr -1)
            sprintf(message, "%s#", message);
    }

    printf("%s\n", message);
    fflush(stdin);
}

void pushInfo(char info){
    printf("[INFO]%c\n", info);
    fflush(stdin);
}