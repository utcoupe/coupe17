var ffi = require('ffi');
var log4js = require('log4js');
const readline = require('readline');
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

function degToAx12(deg) {
	return parseInt((deg+150)*1024/300);
}

function ax12ToDeg(pos) {
	return parseInt((300*pos)/1024 - 150);
}

function goToDeg(deg) {
	goToAx12(degToAx12(deg));
}

function goToAx12(pos) {
	libusb2ax.dxl_write_word(id, P_GOAL_POSITION_L, pos);
}

function printInfo(){
	let speed = libusb2ax.dxl_read_word(id, P_SPEED);
	let pos = libusb2ax.dxl_read_word(id, P_POSITION);
	let destPos = libusb2ax.dxl_read_word(id, P_GOAL_POSITION_L);

	if (pos != old.pos || destPos != old.destPos || speed != old.speed) {
		logger.info("Destination: " + destPos + "\t | Pos: " + pos + "\t | Pos (°) : " + ax12ToDeg(pos) + "\t | Speed: " + speed);
	}

	old.speed = speed;
	old.pos = pos;
	old.destPos = destPos;
}

if(libusb2ax.dxl_initialize(0, 1) <= 0) {
	logger.error("Impossible de se connecter à l'USB2AX");
	process.exit(1);
}
libusb2ax.dxl_write_word(2, P_COUPLE, 1000);
libusb2ax.dxl_write_word(3, P_COUPLE, 1000);


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var id = 1;
var old = {
	pos: Infinity,
	speed: Infinity,
	destPos: Infinity
}
var infoInterval;


rl.question('What is the AX-12 id? ', (answer) => {
	// Ask AX12 id
	id = parseInt(answer);

	if (isNaN(id)) {
		logger.error("Id not understood");
		rl.close();
	} else {
		infoInterval = setInterval(printInfo, 100);

		logger.info("Speaking to " + id);
		// askPos(id, rl);

		// Ask destinations
		logger.info('Destination ? (°) (type \'e\' to exit)');
		rl.on('line', (answer) => {
			let destinationAngle = parseInt(answer);

			if (isNaN(destinationAngle)) {
				if (answer != 'e') {
					logger.error("Destination not understood");
				} else {
					logger.warn("Closing");
				}
				clearInterval(infoInterval);
				rl.close();
			} else {
				logger.info("Going to " + destinationAngle);
				goToDeg(destinationAngle);
			}
		});
	}

});