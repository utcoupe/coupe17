/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ communication_xbee.ino
  └────────────────────

  Contain all functions relative to communication with an XBee

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "constants.h"
#include "orders.h"
#include "communication.h"
#include "communication_xbee.h"

void readPackets() {
  uint8_t* data = 0;
  int length;
  int address, id, type;
  byte* params = 0;
  int i;
  
  xbee.readPacket();
  
  /** Lecture du paquet en attente **/
  if(xbee.getResponse().isAvailable()) {
    if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
      #ifdef DEBUG
        Serial.println("### Reading packet");
      #endif
      xbee.getResponse().getRx16Response(rx16);
      
      length = (int) rx16.getDataLength();
      data = rx16.getData();
  
      if(length < 3) {
        #ifdef DEBUG
          Serial.println("Invalid packet, three or more bytes needed.");
        #endif
        return;
      }
  
      address = (int) data[0];
      type = (int) data[1];
      id = (int) data[2];
      length -= 3;
      params = (byte*) malloc(length * sizeof(byte));
      for(i = 0; i < length; i++) {
          params[i] = (byte) data[i+3];
      }
  
      #ifdef DEBUG
        Serial.println("[Packet]");
        Serial.print("  address:");
        Serial.println(address);
        Serial.print("  type:");
        Serial.println(type);
        Serial.print("  id:");
        Serial.println(id);
        Serial.print("  length:");
        Serial.println(length);
        
        Serial.println("  params:");
        for(i = 0; i < length; i++) {
          Serial.print("    [");
          Serial.print(i);
          Serial.print("] ");
          Serial.println(params[i]);
        }
      #endif
  
      processPacket(address, type, id, length, params);
    }
  }
  else {
    #ifdef INFO
      Serial.println("No packet available");
    #endif
  }
}
