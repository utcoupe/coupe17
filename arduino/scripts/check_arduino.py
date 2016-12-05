#!/usr/bin/env python2

import serial
import glob

ports_list = glob.glob('/dev/tty[A-Z]*')
available_port_list = []

print("In the main.")

for port in ports_list:
    try:
        com_line = serial.Serial(port, 57600)
        com_line.close()
        available_port_list.append(port)
    except serial.SerialException:
        pass

for port in available_port_list:
    print port
    com_line = serial.Serial(port, 57600, timeout=1)
    try:
        com_line.readline()
        arduino_id = com_line.readline()
    except :
        pass
    com_line.close()
    print arduino_id
