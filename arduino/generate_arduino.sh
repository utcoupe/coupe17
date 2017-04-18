#!/bin/bash

USER_TARGET=""
USER_ROBOT=""
USER_PROGRAM=""

function generate_cmake() {
	mkdir -p build
	cd build
	cmake ../ -DTARGET_ARDUINO:STRING=$USER_TARGET -DTARGET_ROBOT:STRING=$USER_ROBOT -DTARGET_PROGRAM:STRING=$USER_PROGRAM
}

function ask_user() {
	printf "What's the target (nano, uno, leonardo, mega2560) ?"
	read answer
	#TODO shorter names ? (eg mega...)
	if [ "$answer" = "nano" ] || [ "$answer" = "uno" ] || [ "$answer" = "leonardo" ] || [ "$answer" = "mega2560" ]; then
		USER_TARGET="$answer"
	fi
	
	printf "What's the robot (pr, gr) ?"
	read answer
	if [ "$answer" = "pr" ] || [ "$answer" = "gr" ]; then
		USER_ROBOT="$answer"
	fi
	
	printf "What's the program (asserv, others) ?"
	read answer
	if [ "$answer" = "asserv" ] || [ "$answer" = "others" ]; then
		USER_PROGRAM="$answer"
	fi
	
	if [ "$USER_ROBOT" = "" ] || [ "$USER_ROBOT" = "" ] || [ "$USER_PROGRAM" = "" ]; then
		printf "Incorrect parameters, please relaunch the script with correct parameters..."
		exit 1
	fi
}

# "Main"
ask_user
generate_cmake
