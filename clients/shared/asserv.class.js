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

	function Asserv(sp, client, who, sendStatus, fifo) {
		this.ready = true;
		this.sendStatus = sendStatus;
		this.sp = sp;
		this.client = client;
		this.pos = {};
		this.who = who;
		this.currentId = 0;
		this.color = "yellow";
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
	Asserv.prototype.convertColorX = function(x) {
		if(this.color == "yellow") {
			return x;
		} else {
			return 3000-x;
		}
	}
	Asserv.prototype.convertColorY = function(y) {
		if(this.color == "yellow") {
			return y;
		} else {
			return y;
		}
	}
	Asserv.prototype.convertColorA = function(a) {
		if(this.color == "yellow") {
			return convertA(a);
		} else {
			return convertA(Math.PI - a);
		}
	}

	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
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
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

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

	Asserv.prototype.calageX = function(x, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: x, y: this.pos.y, a: a}, callback);
		}.bind(this), 'calageX');

	}
	Asserv.prototype.calageY = function(y, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: this.pos.x, y: y, a: a}, callback, true);
		}.bind(this), 'calageY');
	}

	// For float
	function myWriteFloat(f){ return Math.round(f*COMMANDS.FLOAT_PRECISION); }
	function myParseFloat(f){ return parseInt(f)/COMMANDS.FLOAT_PRECISION;  }


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

	Asserv.prototype.setVitesse = function(v, r, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPDMAX, [
			parseInt(v),
			myWriteFloat(r)
		], false, callback);
	};

	Asserv.prototype.speed = function(l, a, ms, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	};

	Asserv.prototype.setAcc = function(acc,callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.ACCMAX, [
			parseInt(acc)
		], false, callback);
	};

	Asserv.prototype.clean = function(callback){
		this.sendCommand(COMMANDS.CLEANG, false, callback);
	};

	Asserv.prototype.pwm = function(left, right, ms, callback) {
		this.sendCommand(COMMANDS.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true, callback);
		
	};

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
	Asserv.prototype.goa = function(a, callback, no_fifo){
		// this.clean();
		this.sendCommand(COMMANDS.ROT, [
			myWriteFloat(this.convertColorA(a))
		], true, callback, no_fifo);
	};

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

/*

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

	function Asserv(sp, client, who, sendStatus, fifo) {
		this.ready = true;
		this.sendStatus = sendStatus;
		this.sp = sp;
		this.client = client;
		this.pos = {};
		this.who = who;
		this.currentId = 0;
		this.color = "yellow";
		this.fifo = fifo;

		this.data_sent = {};

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
			logger.debug(data.toString());
		}.bind(this));

		setTimeout(function() {
			this.getPos();
		}.bind(this), 2000);
	}
	Asserv.prototype.convertColorX = function(x) {
		if(this.color == "yellow") {
			return x;
		} else {
			return 3000-x;
		}
	}
	Asserv.prototype.convertColorY = function(y) {
		if(this.color == "yellow") {
			return y;
		} else {
			return y;
		}
	}
	Asserv.prototype.convertColorA = function(a) {
		if(this.color == "yellow") {
			return convertA(a);
		} else {
			return convertA(Math.PI - a);
		}
	}

	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
	Asserv.prototype.setPos = function(pos, callback) {
		if(pos.color !== undefined)
			this.color = pos.color;
		this.sendCommand(COMMANDS.SET_POS, [
			parseInt(this.convertColorX(pos.x)),
			parseInt(this.convertColorY(pos.y)),
			myWriteFloat(this.convertColorA(pos.a))
		], false, callback);
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

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

	Asserv.prototype.calageX = function(x, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: x, y: this.pos.y, a: a}, callback);
		}.bind(this), 'calageX');

	}
	Asserv.prototype.calageY = function(y, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: this.pos.x, y: y, a: a}, callback, true);
		}.bind(this), 'calageY');
	}

	// For float
	function myWriteFloat(f){ return Math.round(f*COMMANDS.FLOAT_PRECISION); }
	function myParseFloat(f){ return parseInt(f)/COMMANDS.FLOAT_PRECISION;  }


	Asserv.prototype.parseCommand = function(data){
		// logger.debug(data);
		var datas = data.split(';');
		var cmd = datas.shift();//, id = datas.shift();
		var id = parseInt(datas.shift());
		if(cmd == COMMANDS.AUTO_SEND && datas.length >= 4) { // periodic position update
			this.Pos({
				x: this.convertColorX(parseInt(datas.shift())),
				y: this.convertColorY(parseInt(datas.shift())),
				a: this.convertColorA(myParseFloat(datas.shift()))
			});

			
			this.sendPos();

			// logger.debug(lastFinishedId);
			if(this.data_sent[id] !== undefined) {
				// logger.fatal('finish id', lastFinishedId);
				// this.currentId = lastFinishedId;
				this.data_sent[id].callback();
				if(this.data_sent[id].use_fifo)
					this.fifo.orderFinished();
				// else
				// 	this.use_fifo = this.old_use_fifo;
				delete this.data_sent[id];
			}
		} else if(this.data_sent[id] !== undefined && this.data_sent[id].cmd == cmd) {
			// this.order_sent = '';
			// logger.debug('finish', datas.shift());
			if(!this.data_sent[id].wait_for_id) {
				this.data_sent[id].callback();
				if(this.data_sent[id].use_fifo)
					this.fifo.orderFinished();
				delete this.data_sent[id];
				// else
				// 	this.use_fifo = this.old_use_fifo;
			}
		} else if (cmd == COMMANDS.JACK) {
			logger.info("JACK !");
			this.client.send("ia", "ia.jack");
		} else {
			// logger.warn(datas);
			logger.warn("Command return from Arduino to unknown cmd="+cmd);
		}
	}
	Asserv.prototype.sendCommand = function(cmd, args, wait_for_id, callback, no_fifo){
		if(callback === undefined)
			callback = function(){};

		this.currentId += 1;
		var id = this.currentId.toString();
		args = args || [];

		function nextOrder() {
			this.sp.write([cmd,id].concat(args).join(";")+"\n");
		}
		this.data_sent[id] = {
			callback: callback,
			cmd: cmd,
			wait_for_id: wait_for_id,
			use_fifo: !no_fifo
		};

		if(!no_fifo) {
			this.fifo.newOrder(nextOrder.bind(this), 'sendCommandAsserv('+cmd+':'+args+')');
		} else {
			nextOrder.call(this);
		}
	}

	Asserv.prototype.setVitesse = function(v, r, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPDMAX, [
			parseInt(v),
			myWriteFloat(r)
		], false, callback);
	};

	Asserv.prototype.speed = function(l, a, ms, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	};

	Asserv.prototype.setAcc = function(acc,callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.ACCMAX, [
			parseInt(acc)
		], false, callback);
	};

	Asserv.prototype.clean = function(callback){
		this.sendCommand(COMMANDS.CLEANG, false, callback);
	};

	Asserv.prototype.pwm = function(left, right, ms, callback) {
		this.sendCommand(COMMANDS.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true, callback);
		
	};

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
	Asserv.prototype.goa = function(a, callback, no_fifo){
		// this.clean();
		this.sendCommand(COMMANDS.ROT, [
			myWriteFloat(this.convertColorA(a))
		], true, callback, no_fifo);
	};

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

*/
