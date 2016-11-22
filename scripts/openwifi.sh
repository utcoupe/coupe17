#!/bin/sh

dhclient wlan0 &
wpa_supplicant -iwlan0 -c/etc/wpa_supplicant/wpa_supplicant.conf &
