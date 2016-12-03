#!/bin/sh

SLEEP_TIME=5
IP=nuc

while true; do
	echo "Checking server status"
	ping $IP -c 1 > /dev/null
	STATUS=$?

	if [ "$STATUS" -ne 0 ]; then
		date
		echo "Restarting wlan0"
		echo ""
		ifconfig wlan0 down
		ifconfig wlan0 up
	fi

	sleep $SLEEP_TIME
done
