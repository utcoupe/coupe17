#!/bin/sh
### BEGIN INIT INFO
# Provides:		utcoupe_hokuyo
# Default-Start		2 3 4 5
# Default-Stop		0 1 6
# Short-Description:	Starts the utcoupe node client for the hokuyo
### END INIT INFO
#/etc/init.d/utcoupe_hokuyo

#export PATH=$PATH:/usr/local/bin
#export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

PID_FILE=/var/log/utcoupe/utcoupe_hokuyo.pid

function start_hokuyo {
	echo -n "Starting the utcoupe_hokuyo node client..."
	exec forever --sourceDir=$UTCOUPE_WORKSPACE/hokuyo -p $PID_FILE main.js
	echo "done."
}

function stop_hokuyo {
	echo -n "Terminating the utcoupe_hokuyo node client...."
	exec forever stop --sourceDir=$UTCOUPE_WORKSPACE/hokuyo main.js
	echo "done."
}

# Retrieves the UTCOUPE_WORKSPACE value
[ -f /etc/default/utcoupe ] && . /etc/default/utcoupe
if [ -z "$UTCOUPE_WORKSPACE" ] ;  then
  echo "UTCOUPE_WORKSPACE is not set, please set it in /etc/default/utcoupe" >&2
  exit 1
fi

case "$1" in
start)
	start_hokuyo
	;;
stop)
	stop_hokuyo
  ;;
restart|reload|force-reload)
	stop_hokuyo
	start_hokuyo
	;;
*)
  echo "Usage: /etc/init.d/utcoupe_hokuyo {start|stop|restart}"
  exit 1
  ;;
esac

exit 0
