/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders.ino
  └────────────────────

  Contient toutes les fonctions relatives à la gestion des ordres

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "constants.h"
#include "orders.h"

#include "order_BLINK.h"
#include "order_LANCERBALLE.h"

static int* orders[NB_ORDERS];

// Switch géant dans lequel sont exécutés les ordres
void executeOrder(int type, byte* params) {
  int int1; int int2;
  long long1; long long2;
  
  switch(type) {
    case BLINK:
      int1 = getParamInt(type, 1, params);
      long1 = getParamLong(type, 2, params);
      executeOrder_BLINK(int1, long1);
    break;
    case LANCERBALLE:
      int1 = getParamInt(type, 1, params);
      executeOrder_LANCERBALLE(int1);
    break;
  }
}

// Initialisation des ordres et des paramètres associés
void initOrders() {
  int i, j;
  // Initialisation
  for(i = 0; i < NB_ORDERS; i++) {
    orders[i] = NULL;
  }

  orders[PING]        = params(0);
  orders[BLINK]       = params(2, INT, LONG);
  orders[LANCERBALLE] = params(1, INT);
}

/** Fonctions permettant de gérer les paramètres des ordres **/

int* params(int nb, ...) {
  int i;
  int* final_param = NULL;
  int temp;
  va_list ap;

  final_param = (int*) malloc((nb+1) * sizeof(int));
  if(final_param == NULL) {
    return NULL;
  }
  final_param[0] = nb;

  va_start(ap, nb);
  for(i = 1; i <= nb; i++) {
    temp = va_arg(ap, int);
    Serial.print(" ");
    Serial.println(temp);
    final_param[i] = temp;
  }
  va_end(ap);
  
  return final_param;
}

int getNbParams(int type) {
  return getTypeParam(type, 0);
}

int getNbBytes(int type) {
  int i, nb_bytes = 0;
  int nb_params = getNbParams(type);
  for(i = 1; i <= nb_params; i++) {
    nb_bytes += getNbBytesType(getTypeParam(type, i));
  }
  return nb_bytes;
}

int getNbBytesType(int type) {
  switch(type) {
    case INT:
      return NB_BYTES_INT;
    case CHAR:
      return NB_BYTES_CHAR;
    case LONG:
      return NB_BYTES_LONG;
    case FLOAT:
      return NB_BYTES_FLOAT;
    default:
      return 0;
  }
}

int getTypeParam(int type, int n) {
  if(orders[type] == NULL) {
    return 0;
  }
  return orders[type][n];
}

int getParamInt(int type, int n, byte* params) {
  return (int) params[getNbBytesBeforeParam(type, n)];
}

char getParamChar(int type, int n, byte* params) {
  return (char) params[getNbBytesBeforeParam(type, n)];
}

long getParamLong(int type, int n, byte* params) {
  int first_index_param_n;
  unsigned long param_temp = 0, i;
  long param;

  first_index_param_n = getNbBytesBeforeParam(type, n);
  for(i = 0; i < NB_BYTES_LONG; i++) {
    param_temp += ((unsigned long) params[first_index_param_n + i]) << (8 * (NB_BYTES_LONG - i - 1));
  }

  if(param_temp > LONG_MAX_POSITIVE_NUMBER)
    param = param_temp - LONG_OFFSET;
  else
    param = param_temp;

  return param;
}

float getParamFloat(int type, int n, byte* params) {
  return (float) getParamLong(type, n, params) / LONG_TO_FLOAT_COEFF;
}

int getNbBytesBeforeParam(int type, int n) {
  int i, nb_bytes = 0;

  for(i = 1; i < n; i++) {
    nb_bytes += getNbBytesType(getTypeParam(type, i));
  }

  return nb_bytes;
}
