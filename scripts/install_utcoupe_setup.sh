#!/bin/sh

### The goal of this script is to install all UTCoupe specific packages to have a working setup.
### This script is called automatically when you run a npm install.

### First install the linux packages

sudo apt-get install git build-essential python cmake libboost-dev libsdl1.2-dev

# Check if it's a PC or a raspi
if [ "$(uname -m)" == "x86_64" ]; then
	sudo apt-get install libsdl1.2-dev nodejs npm nodejs-legacy linux-headers-$(uname -r)
else
	sudo apt-get install libsdl1.2-dev raspberrypi-kernel-headers
	sudo apt-get remove npm nodejs nodejs-legacy
	curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
	sudo npm install npm@3.5.2 -g
fi

### Then setup the variable environment to taget the UTCoupe main folder

if [ -z "$UTCOUPE_WORKSPACE" ]; then
	echo "export UTCOUPE_WORKSPACE=$PWD" >> $HOME/.bashrc
	# Set the UTCOUPE_WORKSPACE variable by hand the first time, because can't source bashrc
	UTCOUPE_WORKSPACE=$PWD
fi

### Then install the UTCoupe libraries

# URG library for the hokuyo
cd $UTCOUPE_WORKSPACE/libs/urg-0.8.18
./configure && make && sudo make install

# Archer driver for 5 GHz wifi
cd $UTCOUPE_WORKSPACE/libs/Archer_T1U_V1_150909/Driver
sudo make && sudo make install
#TODO add the ra0 interface in configuration files

### Then install the UTCoupe softwares

# The pathfinding
cd $UTCOUPE_WORKSPACE/pathfinding
./make.sh

# The hokuyo
cd $UTCOUPE_WORKSPACE/hokuyo
./make.sh
