#!/bin/sh

pkill avrdude
cd /root/coupe17/arduino/GB;
./make upload ARDUINO_PORT=/dev/arduino/asserv
ssh -o ConnectTimeout=3 -o BatchMode=yes -o StrictHostKeyChecking=no root@igep '/root/flash_arduinos.sh'
