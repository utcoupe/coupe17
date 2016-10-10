/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ communication.ino
  └────────────────────

  Contain all functions relative to communication

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/


#include "constants.h"
#include "orders.h"
#include "communication_xbee.h"
#include "communication.h"

void processPacket(int address, int type, int id, int length, byte* params) {
  int nb_bytes_params;

  #ifdef DEBUG
    Serial.println("### Computing packet");
  #endif
  
  // Envoi ACK TODO
  
  nb_bytes_params = getNbBytes(type);
  #ifdef DEBUG
    Serial.print("Number of expected bytes: ");
    Serial.println(nb_bytes_params);
  #endif

  if(length != nb_bytes_params) {
    #ifdef DEBUG
      Serial.println("ERROR: Number of expected bytes is different from number of received bytes");
    #endif
    // TODO
  }
  else if(address != ADDRESS_ARDUINO) {
    #ifdef DEBUG
      Serial.print("Packet sent to another one (destination= ");
      Serial.print(address);
      Serial.print(", address Arduino=");
      Serial.print(ADDRESS_ARDUINO);
      Serial.println(")");
    #endif
    // TODO
  }
  else {
    executeOrder(type, params);
  }
}
