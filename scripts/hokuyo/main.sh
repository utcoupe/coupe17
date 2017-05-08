#!/bin/sh

pkill node
echo "Lauching Hokuyo"
cd /root/coupe15/new_hokuyo/urg_library-1.0.4/samples
echo > /var/log/utcoupe/client.log
node test.js > /var/log/utcoupe/client.log 2>&1

