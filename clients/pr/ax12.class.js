module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.ax12');
	var ffi = require('ffi');
	var libusb2ax = ffi.Library('./libs/dynamixel/lib/libusb2ax', {
		'dxl_initialize': ['int', ['int', 'int']],
		'dxl_write_word': ['void', ['int', 'int', 'int']],
		'dxl_read_word': ['int', ['int', 'int']],
		'dxl_terminate': ['void', ['void']],
		'dxl_get_result': ['int', ['void']]
	});

	// Constants
	var AX12_COUPLE = 800;
	var P_GOAL_POSITION_L = 30;
	var P_POSITION = 36;
	var P_SPEED	= 0x26;
	var P_COUPLE = 34;
	var MARGE_POS = 80;
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

	function Ax12(sp, sendStatus, fifo) {
		// sp is Serial Port NAME
		this.ready = false;
		this.sendStatus = sendStatus;
		this.orders_sent = [];
		this.fifo = fifo;

		this.connect(sp);
	}


	// ====== General actions ======

	POS_OPENED = 40;
	POS_CLOSED = 10;
	POS_BALL_1 = 0;
	POS_BALL_2 = 0;


	Ax12.prototype.connect = function(sp) {
		if(libusb2ax.dxl_initialize(sp.substring("/dev/ttyACM".length), 1) <= 0) {
			logger.error("Impossible de se connecter à l'USB2AX");
		} else {
			logger.info("Connecté à l'USB2AX !");
		}
		this.ready = true;
		this.sendStatus();
		this.ax12s = {};
		this.type_callback = null;

		libusb2ax.dxl_write_word(2, P_COUPLE, 400);
		libusb2ax.dxl_write_word(3, P_COUPLE, 400);

		this.ouvrir();
		this.loopAX12();
	};

	Ax12.prototype.disconnect = function(x) {
		this.ready = false;
		this.sendStatus();
	};

	Ax12.prototype.loopAX12 = function() {
		var speed;
		for(var i in ax12s) {
			// S'il n'est pas à la bonne position
			ax12s[i].pos = libusb2ax.dxl_read_word(ax12s[i].id, P_POSITION);
			speed = libusb2ax.dxl_read_word(ax12s[i].id, P_SPEED);

			if (!ax12s[i].started) {
				libusb2ax.dxl_write_word(ax12s[i].id, P_COUPLE, AX12_COUPLE);
				libusb2ax.dxl_write_word(ax12s[i].id, P_GOAL_POSITION_L, ax12s[i].obj);
				if (Math.abs(speed) > MARGE_POS_MVT) {
					ax12s[i].started = true;
				}
			} else {
				speed = libusb2ax.dxl_read_word(ax12s[i].id, P_SPEED);
				if (Math.abs(speed) < MARGE_POS_MVT) {
					ax12s[i].arrived = true;
				}
			}
			if(Math.abs(ax12s[i].pos - ax12s[i].obj) < MARGE_POS) {
				ax12s[i].arrived = true;
			}
		}
		// logger.debug(ax12s['2'].pos + ' ; ' + ax12s['3'].pos);
		if(ax12s['2'].started && ax12s['3'].started && this.type_callback == "ouvrir" ||
		   ax12s['2'].arrived && ax12s['3'].arrived && this.type_callback) {
			this.type_callback = null;
			this.callback();
			this.fifo.orderFinished();
		}

		setTimeout(function() { this.loopAX12(); }.bind(this), 50);
	};

	Ax12.prototype.degToAx12 = function(deg) {
		return parseInt((deg+150)*1024/300);
	};

	Ax12.prototype.ouvrir = function(callback) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			ax12s['2'].obj = this.degToAx12(0);
			ax12s['3'].obj = this.degToAx12(0);
			ax12s['2'].arrived = false;
			ax12s['2'].started = false;
			ax12s['3'].arrived = false;
			ax12s['3'].started = false;
			this.callback = callback;
			this.type_callback = 'ouvrir';
		}.bind(this), 'AX12-Ouvrir');
	};

	Ax12.prototype.fermer = function(callback) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			ax12s['2'].obj = this.degToAx12(-85);
			ax12s['3'].obj = this.degToAx12(85);
			// logger.debug(ax12s['2'].obj);
			ax12s['2'].arrived = false;
			ax12s['2'].started = false;
			ax12s['3'].arrived = false;
			ax12s['3'].started = false;
			this.callback = callback;
			this.type_callback = 'fermer';
		}.bind(this), 'AX12-Fermer');
	};
	Ax12.prototype.fermerBalle = function(callback) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			ax12s['2'].obj = this.degToAx12(-50);
			ax12s['3'].obj = this.degToAx12(50);
			// logger.debug(ax12s['2'].obj);
			ax12s['2'].arrived = false;
			ax12s['2'].started = false;
			ax12s['3'].arrived = false;
			ax12s['3'].started = false;
			this.callback = callback;
			this.type_callback = 'fermer';
		}.bind(this), 'AX12-Fermer balle');
	};
	Ax12.prototype.fermerBalle2 = function(callback) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			ax12s['2'].obj = this.degToAx12(-75);
			ax12s['3'].obj = this.degToAx12(75);
			// logger.debug(ax12s['2'].obj);
			ax12s['2'].arrived = false;
			ax12s['2'].started = false;
			ax12s['3'].arrived = false;
			ax12s['3'].started = false;
			this.callback = callback;
			this.type_callback = 'fermer';
		}.bind(this), 'AX12-Fermer balle 2');
	};

	return Ax12;
})();
