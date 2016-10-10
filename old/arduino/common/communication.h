/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ communication.h
  └────────────────────

  Contain all prototypes of communication.ino

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef COMMUNICATION_H
#define COMMUNICATION_H

void processPacket(int address, int type, int id, int length, byte* params);

#endif