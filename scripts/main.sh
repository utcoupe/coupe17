#!/bin/bash

while true; do
	cd /root/coupe15;
	pkill node;
	node utcoupe/utcoupe.js >> /var/log/utcoupe/server.log 2>&1;
	echo "!!!!!!!!!!!!!!!! SERVER FAILED !!!!!!!!!!!!!!!!" >> /var/log/utcoupe/server.log;
done &
