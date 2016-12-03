#!/bin/sh

pkill avrdude
cd /root/coupe15/arduino/PB
./make upload ARDUINO_PORT=/dev/arduino/asserv
#cd /root/coupe15/arduino/pr_others/
#./make upload ARDUINO_PORT=/dev/arduino/others
