#!/bin/sh

echo "Killing server"
pkill -9 main.sh
pkill -9 node

echo "Updating Git"
bash -c "cd /root/coupe15/; git pull"
ssh -o ConnectTimeout=3 -o BatchMode=yes -o StrictHostKeyChecking=no root@igep '/root/sync_git.sh; exit'
ssh -o ConnectTimeout=3 -o BatchMode=yes -o StrictHostKeyChecking=no root@raspi '/root/sync_git.sh; exit'

echo "Restarting server"
/root/main.sh
