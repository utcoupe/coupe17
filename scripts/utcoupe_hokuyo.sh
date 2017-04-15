#!/bin/bash
### BEGIN INIT INFO
# Provides:		utcoupe_hokuyo
# Required-Start:
# Required-Stop:
# Default-Start:	2 3 4 5
# Default-Stop:		0 1 6
# Short-Description:	UTCoupe node client for the hokuyo
### END INIT INFO


PID_FILE_D=/var/log/utcoupe/utcoupe_hokuyo_deamon.pid
PID_FILE_F=/var/log/utcoupe/utcoupe_hokuyo_forever.pid

start_hokuyo() {
	echo -n "Starting the utcoupe_hokuyo node client..."
#	start-stop-daemon -p $PID_FILE_D -m -b -u $USER -S --exec forever -- --sourceDir=$UTCOUPE_WORKSPACE/hokuyo -l /var/log/utcoupe/forever.log -p $PID_FILE_F main.js

#	start-stop-daemon -p $PID_FILE_D -v -m -b --start --exec /usr/local/bin/node -- $UTCOUPE_WORKSPACE/hokuyo/main.js
#	start-stop-daemon --start -m --pidfile $PID_FILE_D --background --startas /bin/bash -- -E -c "/usr/local/bin/node $UTCOUPE_WORKSPACE/hokuyo/main.js > /var/log/utcoupe/hokuyo_daemon.log 2>&1"

	# Working !
#	UTCOUPE_WORKSPACE=$UTCOUPE_WORKSPACE start-stop-daemon --start -m --pidfile $PID_FILE_D --startas /bin/bash -- -c "node $UTCOUPE_WORKSPACE/hokuyo/main.js > /var/log/utcoupe/hokuyo_daemon.log 2>&1"

	UTCOUPE_WORKSPACE=$UTCOUPE_WORKSPACE start-stop-daemon --start -m --pidfile $PID_FILE_D --background --exec /usr/local/bin/node -- $UTCOUPE_WORKSPACE/hokuyo/main.js

#	start-stop-daemon --start -m --pidfile $PID_FILE_D --background --startas node -- $UTCOUPE_WORKSPACE/hokuyo/main.js > /var/log/utcoupe/hokuyo_daemon.log 2>&1
#	forever --sourceDir=$UTCOUPE_WORKSPACE/hokuyo -p $PID_FILE_F main.js
#	su - $USER -c "$UTCOUPE_WORKSPACE/node_modules/forever/bin/forever --sourceDir=$UTCOUPE_WORKSPACE/hokuyo -p $PID_FILE_F main.js"
#--> fail because fucking node is launching in sudo
	echo "done."
}

stop_hokuyo() {
	echo -n "Terminating the utcoupe_hokuyo node client...."
#	forever stop --sourceDir=$UTCOUPE_WORKSPACE/hokuyo main.js
#	start-stop-daemon -K -v -p $PID_FILE_D --startas /bin/bash -- -c "node $UTCOUPE_WORKSPACE/hokuyo/main.sh"
	start-stop-daemon -K -v -p $PID_FILE_D --exec /usr/local/bin/node
	echo "done."
}

[ -f /etc/default/utcoupe ] && . /etc/default/utcoupe
if [ -z "$UTCOUPE_WORKSPACE" ] ;  then
  echo "UTCOUPE_WORKSPACE is not set, please set it in /etc/default/utcoupe" >&2
  exit 1
fi

#export PATH=$PATH:$UTCOUPE_WORKSPACE/node_modules/forever/bin
#export NODE_PATH=$NODE_PATH:$UTCOUPE_WORKSPACE/node_module/forever/lib

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
