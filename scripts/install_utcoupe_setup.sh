#!/bin/sh

### The goal of this script is to install all UTCoupe specific packages to have a working setup.
### This script is called automatically when you run a npm install.

function green_echo () {
	echo -e "\033[32m$1\033[0m"
}

function red_echo () {
	echo -e "\033[31m$1\033[0m"
}

# Globals
ARCH=$(uname -m)


### Install the linux packages
function apt_install() {
	green_echo "Install missing packages..."
	sudo apt-get install git build-essential python cmake libboost-dev libsdl1.2-dev

	# Check if it's a PC or a raspi
	if [ "$ARCH" = "x86_64" ]; then
		green_echo "x86 architecture detected."
		sudo apt-get install nodejs npm nodejs-legacy linux-headers-$(uname -r)
	else
		green_echo "Raspberry Pi system detected, remove previous npm installation to setup the used version."
		sudo apt-get install raspberrypi-kernel-headers
		sudo apt-get remove npm nodejs nodejs-legacy
		curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
		sudo npm install npm@3.5.2 -g
	fi
}

### Setup the variable environment to taget the UTCoupe main folder
function env_setup() {
	if [ -z "$UTCOUPE_WORKSPACE" ]; then
		green_echo "Env variable is not set."
		echo "export UTCOUPE_WORKSPACE=$PWD" >> $HOME/.bashrc
		exec bash
	fi
}

### Compile and install the UTCoupe libraries

# URG library for the hokuyo
function compile_urg() {
	cd $UTCOUPE_WORKSPACE/libs/urg-0.8.18
	./configure && make && sudo make install
}

# Archer driver for 5 GHz wifi
function compile_archer() {
	cd $UTCOUPE_WORKSPACE/libs/Archer_T1U_V1_150909/Driver
	sudo make && sudo make install
	#TODO add the ra0 interface in configuration files
}

### Then install the UTCoupe softwares

# The pathfinding
function compile_pathfinding() {
	cd $UTCOUPE_WORKSPACE/pathfinding
	./make.sh
}

# The hokuyo
function compile_hokuyo() {
	cd $UTCOUPE_WORKSPACE/hokuyo
	./make.sh
}

function launch_script() {
	env_setup
	
	printf "Install apt missing packets ? [Y/n]?"
	read answer
	if [ "$answer" = "" ] || [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
		install_apt
	fi
	
	printf "Compile urg library (mandatory for hokuyo) ? [Y/n]?"
	read answer
	if [ "$answer" = "" ] || [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
		compile_urg
	fi
	
	printf "Compile archer library (mandatory for 5 GHz usb wifi key) ? [Y/n]?"
	read answer
	if [ "$answer" = "" ] || [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
		compile_archer
	fi
	
	printf "Compile UTCoupe exe (pathfinding and hokuyo) ? [Y/n]?"
	read answer
	if [ "$answer" = "" ] || [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
		compile_pathfinding
		compile_hokuyo
	fi
}

printf "Launch install script ? [Y/n]?"
read answer
if [ "$answer" = "" ] || [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
	launch_script
fi
