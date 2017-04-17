#!/usr/bin/env python2

"""
Script to communicate with an arduino.
This script is useful to test the good working of them
and to have a serial debug line.
"""

import serial
import sys
import getopt
import os
import threading
import time

__date__ = 17/12/2016
__author__ = "Thomas Fuhrmann"


def process_args(argv):
    """
    Process the command line arguments.
    Args:
        argv: list of command line arguments

    Returns: nothing

    """
    try:
        opts, args = getopt.getopt(argv, "hla:", ["help", "list", "arduino="])
    except:
        print_usage()
        sys.exit()
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print_usage()
            sys.exit()
        elif opt in ("-l", "--list"):
            print_arduino_list()
        elif opt in ("-a", "--arduino="):
            start_com_line(arg)


def print_usage():
    """
    Prints the usage of the script.
    Returns: nothing

    """
    print sys.argv[0], " - A script to dialog with an Arduino\n"
    print "Usage: ", sys.argv[0], "[-l] [-a arduino] [-h]\n"
    print "Options:"
    print "\t-l\tlists the devices available"
    print "\t-a  arduino\tsets the arduino to dialogue with"
    print "\t-h\tshows this help"


def print_arduino_list():
    """
    Prints the list of arduino.
    To be up to date, run check_arduino.py first.
    Returns: nothing

    """
    print "Arduino list :"
    if os.path.isdir("/dev/arduino"):
        arduino_list = os.listdir("/dev/arduino")
        for arduino in arduino_list:
            print "\t", arduino
    else:
        print "No arduino detected, please connect one and launch check_arduino.py script."


def start_com_line(port):
    """
    Starts the serial communication line : one for sending data to the arduino
    and one another to get the data sent by the arduino.
    Args:
        port: name of the serial port to use

    Returns: nothing

    """
    arduino_port = "/dev/arduino/" + port
    try:
        com_line = serial.Serial(arduino_port, 57600, timeout=0.5)
    except serial.SerialException:
        print "Port : ", port, " is ot available, make sure you have plugged the right arduino."
        sys.exit()
    sender_thread = threading.Thread(target=data_sender, args=(com_line,))
    sender_thread.setDaemon(True)
    sender_thread.start()
    while 1:
        # Data received from the arduino
        try:
            received_data = com_line.readline()
        except KeyboardInterrupt:
            break
        if received_data:
            print time.strftime("%Y-%m-%d_%H:%M:%S"), port, " : ", received_data


def data_sender(com_line):
    """
    Sends data received from stdin to the com_line serial port.
    Args:
        com_line: opened Serial object

    Returns: nothing

    """
    # Data to send to the arduino
    while 1:
        try:
            data_to_send = sys.stdin.readline()
        except KeyboardInterrupt:
            break
        if data_to_send:
            com_line.write(data_to_send)


if __name__ == "__main__":
    process_args(sys.argv[1:])
