#!/bin/bash

export AVR_HOME=/usr/bin ARDUINO_HOME=../../../libs/arduino-1.0
export ARDUINO_BOARD=mega2560

if ! ../../scripts/check_protocol; then
	echo "Found duplicate value for orders in protocol.h, aborting build."
	exit 1
fi

scons -f ../../scripts/scons/SConstruct -Y ../../common/asserv/ -Y ../../common/os48 $@
