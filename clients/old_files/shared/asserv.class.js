/**
 * Asserv module
 * 
 * @module clients/shared/asserv
 * @requires module:clients/shared/defineParser
 * @see {@link clients/shared/asserv.Asserv}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('asserv');
	var COMMANDS = require('./defineParser.js')('./arduino/asserv/protocol.h');
	var DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable

	// function Asserv(sp, client) {
	// 	this.client = client;
	// 	this.getPos();
	// 	this.sp = sp;
	// 	this.pos = {};
	// 	this.sentCommands = {};
	// 	this.currentId = 0;
	// }

	/**
	 * Asserv Constructor
	 * 
	 * @exports clients/shared/asserv.Asserv
	 * @constructor
	 * @param {Object} sp
	 * @param {Object} client
	 * @param {Object} who
	 * @param {Object} sendStatus
	 * @param {clients/shared/asserv.Asserv} fifo
	 */
	function Asserv(sp, client, who, sendStatus, fifo) {
		/** @type {boolean} */
		this.ready = true;
		/** @type {Object} */
		this.sendStatus = sendStatus;
		/** @type {Object} */
		this.sp = sp;
		/** @type {Object} */
		this.client = client;
		/** @type {Object} */
		this.pos = {};
		/** @type {Object} */
		this.who = who;
		/** @type {int} */
		this.currentId = 0;
		/** @type {string} */
		this.color = "yellow";
		/** @type {clients/shared/asserv.Asserv} */
		this.fifo = fifo;

		this.sp.on("data", function(data){
			if(this.ready === false){
				this.ready = true;
				this.sendStatus();
			}
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			this.ready = false;
			this.sendStatus();
			logger.debug("error", data.toString());
		}.bind(this));
		this.sp.on("close", function(data){
			this.ready = false;
			this.sendStatus();
			logger.error("Serial port close");
		}.bind(this));

		setTimeout(function() {
			this.getPos();
		}.bind(this), 2000);
	}
	/**
	 * Convert color x
	 * 
	 * @param {int} x
	 */
	Asserv.prototype.convertColorX = function(x) {
		if(this.color == "yellow") {
			return x;
		} else {
			return 3000-x;
		}
	}
	/**
	 * Convert color y
	 * 
	 * @param {int} y
	 */
	Asserv.prototype.convertColorY = function(y) {
		if(this.color == "yellow") {
			return y;
		} else {
			return y;
		}
	}
	/**
	 * Convert color Angle
	 * 
	 * @param {int} a
	 */
	Asserv.prototype.convertColorA = function(a) {
		if(this.color == "yellow") {
			return convertA(a);
		} else {
			return convertA(Math.PI - a);
		}
	}

	/**
	 * Convert Angle
	 * 
	 * @param {int} a
	 */
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	/**
	 * Set Angle
	 * 
	 * @param {int} a
	 */
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}
	/**
	 * Position ?
	 * 
	 * @param {Object} pos
	 */
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
	/**
	 * Sets Position
	 * 
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	Asserv.prototype.setPos = function(pos, callback) {
		logger.debug(pos);
		if(pos.color !== undefined)
			this.color = pos.color;
		this.sendCommand(COMMANDS.SET_POS, [
			parseInt(this.convertColorX(pos.x)),
			parseInt(this.convertColorY(pos.y)),
			myWriteFloat(this.convertColorA(pos.a))
		], false, callback);
	}
	/**
	 * Gets Potition
	 * 
	 * @param {Object} pos
	 */
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	/**
	 * Sends Position
	 */
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

	/**
	 * Set position calage
	 * 
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	Asserv.prototype.setPosCalage = function(pos, callback) {
		this.sendCommand(COMMANDS.SET_POS, [
			parseInt(this.convertColorX(pos.x)),
			parseInt(this.convertColorY(pos.y)),
			myWriteFloat(this.convertColorA(pos.a))
		], false, function() {
			callback();
			this.fifo.orderFinished();
		}.bind(this), true);
	}

	/**
	 * Calage X
	 * 
	 * @param {int} x
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	Asserv.prototype.calageX = function(x, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: x, y: this.pos.y, a: a}, callback);
		}.bind(this), 'calageX');

	}
	/**
	 * Calage Y
	 * 
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	Asserv.prototype.calageY = function(y, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: this.pos.x, y: y, a: a}, callback, true);
		}.bind(this), 'calageY');
	}

	// For float
	/**
	 * My write float
	 * 
	 * @param {float} f
	 */
	function myWriteFloat(f){ return Math.round(f*COMMANDS.FLOAT_PRECISION); }
	/**
	 * My Parse float
	 * 
	 * @param {float} f
	 */
	function myParseFloat(f){ return parseInt(f)/COMMANDS.FLOAT_PRECISION;  }


	/**
	 * Parse Command
	 * 
	 * @param {string} data
	 */
	Asserv.prototype.parseCommand = function(data){
		// logger.debug(data);
		var datas = data.split(';');
		var cmd = datas.shift();//, id = datas.shift();
		if(cmd == COMMANDS.AUTO_SEND && datas.length >= 4) { // periodic position update
			var lastFinishedId = parseInt(datas.shift()); // TODO
			this.Pos({
				x: this.convertColorX(parseInt(datas.shift())),
				y: this.convertColorY(parseInt(datas.shift())),
				a: this.convertColorA(myParseFloat(datas.shift()))
			});

			
			this.sendPos();

			// logger.debug(lastFinishedId);
			if(this.currentId != lastFinishedId) {
				// logger.fatal('finish id', lastFinishedId);
				this.currentId = lastFinishedId;
				var use_fifo = this.use_fifo;
				this.use_fifo = true;
				this.callback();
				if(use_fifo)
					this.fifo.orderFinished();
			}
		} else if(cmd == this.order_sent) {
			this.order_sent = '';
			// logger.debug('finish', datas.shift());
			if(!this.wait_for_id) {
				var use_fifo = this.use_fifo;
				this.use_fifo = true;
				this.callback();
				if(use_fifo)
					this.fifo.orderFinished();
			}
		} else if (cmd == COMMANDS.JACK) {
			logger.info("JACK !");
			this.client.send("ia", "ia.jack");
		} else {
			// logger.warn(datas);
			logger.warn("Command return from Arduino to unknown cmd="+cmd);
		}
	}
	/**
	 * Sends Command
	 * 
	 * @param {string} cmd
	 * @param {string} args
	 * @param {int} wait_for_id
	 * @param {Object} [callback]
	 * @param {boolean} no_fifo
	 */
	Asserv.prototype.sendCommand = function(cmd, args, wait_for_id, callback, no_fifo){
		function nextOrder() {
			if(callback === undefined)
				callback = function(){};
			this.callback = callback;
			args = args || [];
			this.order_sent = cmd;
			this.wait_for_id = wait_for_id;
			logger.debug([cmd,this.currentId+1].concat(args).join(";")+"\n");
			this.sp.write([cmd,this.currentId+1].concat(args).join(";")+"\n");
		}

		this.use_fifo = !no_fifo;

		if(this.use_fifo) {
			this.fifo.newOrder(nextOrder.bind(this), 'sendCommandAsserv('+cmd+':'+args+')');
		} else {
			nextOrder.call(this);
		}
	}

	/**
	 * Set Vitesse
	 * 
	 * @param {int} v Speed
	 * @param {float} r Rotation
	 * @param {Object} callback
	 */
	Asserv.prototype.setVitesse = function(v, r, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPDMAX, [
			parseInt(v),
			myWriteFloat(r)
		], false, callback);
	};

	/**
	 * Speed ?
	 * 
	 * @param {int} l
	 * @param {int} a Angle
	 * @param {int} ms
	 * @param {Object} callback
	 */
	Asserv.prototype.speed = function(l, a, ms, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	};

	/**
	 * Set Acceleration
	 * 
	 * @param {int} acc
	 * @param {Object} callback
	 */
	Asserv.prototype.setAcc = function(acc,callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.ACCMAX, [
			parseInt(acc)
		], false, callback);
	};

	/**
	 * Clean
	 * 
	 * @param {Object} callback
	 */
	Asserv.prototype.clean = function(callback){
		this.sendCommand(COMMANDS.CLEANG, false, callback);
	};

	/**
	 * Pulse Width Modulation
	 * 
	 * @param {int} left
	 * @param {int} right
	 * @param {int} ms
	 * @param {Object} callback
	 */
	Asserv.prototype.pwm = function(left, right, ms, callback) {
		this.sendCommand(COMMANDS.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true, callback);
		
	};

	/**
	 * Go X Y
	 * 
	 * @param {int} x
	 * @param {int} y
	 * @param {string} sens
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	Asserv.prototype.goxy = function(x, y, sens, callback, no_fifo){
		if(sens == "avant") sens = 1;
		else if(sens == "arriere") sens = -1;
		else sens = 0;
		
		this.sendCommand(COMMANDS.GOTO, [
			parseInt(this.convertColorX(x)),
			parseInt(this.convertColorY(y)),
			sens
		], true, callback, no_fifo);
	};
	/**
	 * Go Angle
	 * 
	 * @param {int} a
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	Asserv.prototype.goa = function(a, callback, no_fifo){
		// this.clean();
		this.sendCommand(COMMANDS.ROT, [
			myWriteFloat(this.convertColorA(a))
		], true, callback, no_fifo);
	};

	/**
	 * Set P I D
	 * @param {float} p
	 * @param {float} i
	 * @param {float} d
	 * @param {Object} callback
	 */
	Asserv.prototype.setPid = function(p, i, d, callback){
		// this.clean();
		this.sendCommand(COMMANDS.PIDALL, [
			myWriteFloat(p),
			myWriteFloat(i),
			myWriteFloat(d)
		],false, callback);
	};

	// Asserv.prototype.gotoPath = function(callback, path){
	// 	this.clean();
	// 	if(instanceof path !=== "Array") path = path.path; // not sure about Path class right now
	// 	path.forEach(function(item));
	// };

	return Asserv;
})();
