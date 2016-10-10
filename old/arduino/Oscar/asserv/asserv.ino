/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ pogoni.ino
  └────────────────────

  Main file of Arduino board inside Cesar

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include <XBee.h>

#include "constants.h"
#include "orders.h"
#include "communication.h"
#include "communication_xbee.h"

#include "order_MOVEROBOT.h"

// Variables
XBee xbee = XBee();
Rx16Response rx16 = Rx16Response();

void setup() {
  Serial2.begin(BAUDRATE_XBEE);
  xbee.setSerial(Serial2);
  #ifdef DEBUG
    Serial.begin(BAUDRATE_USB);
  #endif
  
  initOrders();
  initOrder_MOVEROBOT();
}

void loop() {
  #ifdef INFO
    Serial.println("###### Begin of main loop ######");
  #endif
  
  readPackets();

  // loopOrder_BLINK();
  loopOrder_MOVEROBOT();

  delay(10);
}
