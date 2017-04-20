#!/bin/bash

pkill -9 node
rsync nuc:/root/coupe17 /root/ -av --exclude 'node_modules' --exclude '.git' --exclude '*.so'
