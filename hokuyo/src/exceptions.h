#ifndef EXCEPTIONS_H
#define EXCEPTIONS_H

#include "analyzer.h"

int ignore(struct coord p);//renvoie 1 si le point est à ignorer, 0 sinon
int group_exception(struct points_group p); //renvoit 1 si le groupe est invalide, 0 sinon

#endif
