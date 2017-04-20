var ffi = require('ffi');
var log4js = require('log4js');
var logger = log4js.getLogger('Test AX12');

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
	'253':{
		id: 253,
		obj: 0, pos: 0, arrived: false
	},
	'254':{
		id: 254,
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
			if(speed > 2) {
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
				t = !t;
			}
		}
	}
	setTimeout(loopAX12, 50);
}

function degToAx12(deg) {
	return parseInt((deg+150)*1024/300);
}
function openAx12Down() {
	for(let key of Object.keys(ax12s)){
		ax12s[key].obj = degToAx12(0);
	}
}
function closeAx12Down() {
	for(let key of Object.keys(ax12s)){
		ax12s[key].obj = degToAx12(80);
	}
}

if(libusb2ax.dxl_initialize(0, 1) <= 0) {
	logger.error("Impossible de se connecter à l'USB2AX");
	process.exit(1);
}
libusb2ax.dxl_write_word(2, P_COUPLE, 1000);
libusb2ax.dxl_write_word(3, P_COUPLE, 1000);
loopAX12();

var t = true;
function loop() {
	if(t) {
		closeAx12Down();
	} else {
		openAx12Down();
	}
	setTimeout(loop, 3000);
}
loop();
