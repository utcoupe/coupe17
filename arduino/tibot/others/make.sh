#!/bin/bash

export AVR_HOME=/usr/bin ARDUINO_HOME=../../../libs/arduino-1.0
export ARDUINO_BOARD=leonardo

scons -f ../../scripts/scons/SConstruct $@
