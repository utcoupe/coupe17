#################################
# Choisir l'Arduino !
ARDUINO_TYPE="leonardo" # mega2560
#################################
echo "\033[34mCompilation de common.ino\033[0m"
scons ARDUINO_BOARD=$ARDUINO_TYPE ARDUINO_HOME=../arduino-1.0.5/

nb_args=$#
if [ "$nb_args" = "0" ] ; then
	if [ -e "/dev/ttyACM0" ] ; then
		echo "\033[34mEnvoi du programme sur le port /dev/ttyACM0, sur une Arduino "$ARDUINO_TYPE"\033[0m"
		scons upload ARDUINO_BOARD=$ARDUINO_TYPE ARDUINO_PORT=/dev/ttyACM0 ARDUINO_HOME=../arduino-1.0.5/ 
	elif [ -e "/dev/ttyACM1" ] ; then
		echo "\033[34mEnvoi du programme sur le port /dev/ttyACM1, sur une Arduino "$ARDUINO_TYPE"\033[0m"
		scons upload ARDUINO_BOARD=$ARDUINO_TYPE ARDUINO_PORT=/dev/ttyACM1 ARDUINO_HOME=../arduino-1.0.5/ 
	elif [ -e "/dev/ttyACM2" ] ; then
		echo "\033[34mEnvoi du programme sur le port /dev/ttyACM2, sur une Arduino "$ARDUINO_TYPE"\033[0m"
		scons upload ARDUINO_BOARD=$ARDUINO_TYPE ARDUINO_PORT=/dev/ttyACM2 ARDUINO_HOME=../arduino-1.0.5/ 
	else
		echo "\033[31mAucune Arduino connectée aux port /dev/ttyACM0 à /dev/ttyACM2.
Veuillez connecter une Arduino si ce n'est pas déjà fait.
Si ça l'est, veuillez indiquer le numéro du port de l'Arduino explicitement.
Exemple pour le port /dev/ttyACM3 : "$0" \033[0m"
		exit 1
	fi
else
	if [ -e $1 ] ; then
		echo "\033[34mEnvoi du programme sur le port "$1", sur une Arduino "$ARDUINO_TYPE"\033[0m"
		scons upload ARDUINO_BOARD=$ARDUINO_TYPE ARDUINO_PORT=$1
	else
		echo "\033[31mAucune Arduino connectée au port "$1" donné en paramètre \033[0m"
		exit 1
	fi
fi