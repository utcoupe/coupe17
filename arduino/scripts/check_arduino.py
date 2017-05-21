#!/usr/bin/env python2

"""
Small script to detect the port of each arduino connected.
The script creates automatically a symbolic link in /dev/arduino
to the responding arduino, using its ID (robotName_function).
Ex : grobot_asserv, tibot_others, ...
"""

import serial
import glob
import os

__date__ = 05/12/2016
__author__ = "Thomas Fuhrmann"

# List of all serial ports
ports_list = glob.glob('/dev/tty[A-Z]*')
# List of available serial ports
available_port_list = []
# Dictionary of (arduino_id, arduino_port) Ex : (grobot_asserv, /dev/ttyACM0)
arduino_port_dict = {}

# Create the list of available serial ports
for port in ports_list:
    try:
        com_line = serial.Serial(port, 57600)
        com_line.close()
        available_port_list.append(port)
    except serial.SerialException:
        pass

# Create the dictionary of connected arduino
arduino_id = ""
for port in available_port_list:
    com_line = serial.Serial(port, 57600, timeout=0.5)
    try:
        # First line may be empty
        com_line.readline()
        arduino_id = com_line.readline()
    except :
        pass
    com_line.close()
    if arduino_id != "":
        arduino_id = arduino_id.replace("\r\n", "")
        print "add arduino on port : " + port
        arduino_port_dict[arduino_id] = port

# Creates the symbolic links
if not os.path.isdir("/dev/arduino"):
    os.mkdir("/dev/arduino" )
for arduino in arduino_port_dict.keys():
    print arduino
    if not os.path.exists("/dev/arduino/" + arduino):
        os.symlink(arduino_port_dict[arduino], "/dev/arduino/" + arduino)
