var ffi = require('ffi');
var log4js = require('log4js');
var logger = log4js.getLogger('Test AX12');

var P_GOAL_POSITION_L = 30;
var P_POSITION = 36;
var P_SPEED	= 0x26;
var P_COUPLE = 34;

var libusb2ax = ffi.Library('../libs/dynamixel/src_lib/libusb2ax', {
  'dxl_initialize': ['int', ['int', 'int']],
  'dxl_write_word': ['void', ['int', 'int', 'int']],
  'dxl_read_word': ['int', ['int', 'int']],
  'dxl_terminate': ['void', ['void']],
  'dxl_get_result': ['int', ['void']]
})


function degToAx12(deg) {
	return parseInt((deg+150)*1024/300);
}

if(libusb2ax.dxl_initialize(0, 1) <= 0) {
	logger.error("Impossible de se connecter à l'USB2AX");
	process.exit(1);
}
libusb2ax.dxl_write_word(2, P_COUPLE, 1000);
libusb2ax.dxl_write_word(3, P_COUPLE, 1000);

logger.info("Looking for AX12s...");
let pos = 0;
for(let i = 250; i<255; i++) {
	pos = libusb2ax.dxl_read_word(i, P_POSITION);
	if(pos != 0) {
		logger.info("Found " + i + " at position " + pos);
		// libusb2ax.dxl_write_word(i, P_GOAL_POSITION_L, degToAx12(80));
	}
}