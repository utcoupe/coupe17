#!/bin/sh

dhclient wlan0 &
wpa_supplicant -iwlan0 -c/etc/wpa_supplicant/wpa_supplicant.conf &
ip route del default
ip route add default via 172.25.0.1 dev wlan0
