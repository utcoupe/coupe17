var ffi = require('ffi');
var log4js = require('log4js');
var logger = log4js.getLogger('test.ascenseur');

var libusb2ax = ffi.Library('../libs/dynamixel/src_lib/libusb2ax', {
  'dxl_initialize': ['int', ['int', 'int']],
  'dxl_write_word': ['void', ['int', 'int', 'int']],
  'dxl_read_word': ['int', ['int', 'int']],
  'dxl_terminate': ['void', ['void']],
  'dxl_get_result': ['int', ['void']]
})

var P_GOAL_POSITION_L = 30;
var P_POSITION = 36;
var P_SPEED	= 0x26;
var P_COUPLE = 34;
var MARGE_POS = 40;
var MARGE_POS_MVT = 5;

var ax12s = {
	'2':{
		id: 2,
		obj: 0, pos: 0, arrived: false
	},
	'3':{
		id: 3,
		obj: 0, pos: 0, arrived: false
	}
};

function loopAX12() {
	var speed;
	for(var i in ax12s) {
		// Si il est pas à la bonne position
		if(ax12s[i].pos < ax12s[i].obj - MARGE_POS || ax12s[i].pos > ax12s[i].obj + MARGE_POS) {
			ax12s[i].arrived = false;
			speed = libusb2ax.dxl_read_word(ax12s[i].id, P_SPEED);
			// Si il bouge pas, on renvoie l'ordre
			if(speed == 0) {
				console.log("ordre"+i);
				libusb2ax.dxl_write_word(ax12s[i].id, P_GOAL_POSITION_L, ax12s[i].obj);
			}
			else {
				ax12s[i].pos = libusb2ax.dxl_read_word(ax12s[i].id, P_POSITION);
			}
		}
		else {
			if(!ax12s[i].arrived) {
				ax12s[i].arrived = true;
				logger.info(new Date().getTime()+" "+ax12s[i].id+" arrivé !");
			}
		}
	}
	setTimeout(loopAX12, 50);
}

function degToAx12(deg) {
	return parseInt((deg+150)*1024/300);
}
function openAx12Down() {
	ax12s['2'].obj = degToAx12(0);
	ax12s['3'].obj = degToAx12(0);
}
function closeAx12Down() {
	ax12s['2'].obj = degToAx12(-75);
	ax12s['3'].obj = degToAx12(75);
}
// var t = true;
// function loop() {
// 	if(t) {
// 		closeAx12Down();
// 	} else {
// 		openAx12Down();
// 	}
// 	t = !t;
// 	setTimeout(loop, 3000);
// }
// loop();

// AX12
if(libusb2ax.dxl_initialize(1, 1) <= 0) {
	logger.error("Impossible de se connecter à l'USB2AX");
	process.exit(1);
}
libusb2ax.dxl_write_word(2, P_COUPLE, 700);
libusb2ax.dxl_write_word(3, P_COUPLE, 700);
openAx12Down();
loopAX12();

// Servos
var five = require("johnny-five");
var board = new five.Board({
	port: '/dev/ttyACM0',
	repl: false
});
var servo1, servo2;
function ouvrirServos() {
  servod.to(80);
  servog.to(10);
}
function fermerServos() {
  servod.to(55);
  servog.to(35);
}
board.on("ready", function() {
  servod = new five.Servo(7);
  servog = new five.Servo(9);
  fermerServos();
});

// Ascenseur
var Elevator = require('../clients/pr/elevator.class.js');
var elevator = new Elevator('/dev/ttyACM2');
function descendreAscenseur() {
	elevator.move1Down();
}
function monterAscenseur() {
	elevator.move1Up();
}

// Orders
var orders = [closeAx12Down, ouvrirServos, monterAscenseur, fermerServos, openAx12Down, descendreAscenseur];
// var orders = [closeAx12Down, ouvrirServos, fermerServos, openAx12Down];
var order_id = -1;
function nextOrder() {
	order_id++;
	if(order_id >= orders.length) {
		order_id = 0;
	}
	orders[order_id]();
}

// Programme principal
var keypress = require('keypress');
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
	if (key.name == 'enter') {
		nextOrder();
	}
});