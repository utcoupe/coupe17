#!/bin/sh

date --set "05/12/2015" > /dev/null
echo "Lauching PR"
pkill node
cd /root/coupe15
node ./clients/pr/main.js > /var/log/utcoupe/client.log 2>&1
