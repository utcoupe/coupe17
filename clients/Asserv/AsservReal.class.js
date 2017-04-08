/**
 * Classe implémentant l'asservissement en mode réel.
 * 
 * @module clients/Asserv/AsservReal
 * @requires module:clients/Asserv/Asserv
 */

"use strict";

const Asserv = require('Asserv.class.js');

/**
 * Classe implémentant l'asservissement en mode réel
 * 
 * @memberof module:clients/Asserv/AsservReal
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservReal extends Asserv{
	constructor(sp, client, who, sendStatus, fifo){
		super(client, who, fifo);
		this.COMMANDS = require('./defineParser.js')('./arduino/asserv/protocol.h');
		this.DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable
		this.ready = true;
		this.sendStatus = sendStatus;
		this.currentId = 0;
		this.color = "yellow";

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
	convertColorX(x) {
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
	convertColorY(y) {
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
	convertColorA(a) {
		if(this.color == "yellow") {
			return convertA(a);
		} else {
			return convertA(Math.PI - a);
		}
	}

	/**
	 * Sets Position
	 * 
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	setPos(pos, callback) {
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
	 * Set position calage
	 * 
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	setPosCalage(pos, callback) {
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
	calageX(x, a, callback) {
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
	calageY(y, a, callback) {
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
	myWriteFloat(f){ return Math.round(f*COMMANDS.FLOAT_PRECISION); }
	
	/**
	 * My Parse float
	 * 
	 * @param {float} f
	 */
	myParseFloat(f){ return parseInt(f)/COMMANDS.FLOAT_PRECISION;  }

		/**
	 * Parse Command
	 * 
	 * @param {string} data
	 */
	parseCommand(data){
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
	sendCommand(cmd, args, wait_for_id, callback, no_fifo){
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
	setVitesse(v, r, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPDMAX, [
			parseInt(v),
			myWriteFloat(r)
		], false, callback);
	}

	/**
	 * Speed ?
	 * 
	 * @param {int} l
	 * @param {int} a Angle
	 * @param {int} ms
	 * @param {Object} callback
	 */
	speed(l, a, ms, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	}

	/**
	 * Set Acceleration
	 * 
	 * @param {int} acc
	 * @param {Object} callback
	 */
	setAcc(acc,callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.ACCMAX, [
			parseInt(acc)
		], false, callback);
	}

	/**
	 * Clean
	 * 
	 * @param {Object} callback
	 */
	clean(callback){
		this.sendCommand(COMMANDS.CLEANG, false, callback);
	}

	/**
	 * Pulse Width Modulation
	 * 
	 * @param {int} left
	 * @param {int} right
	 * @param {int} ms
	 * @param {Object} callback
	 */
	pwm(left, right, ms, callback) {
		this.sendCommand(COMMANDS.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true, callback);
		
	}

		/**
	 * Go X Y
	 * 
	 * @param {int} x
	 * @param {int} y
	 * @param {string} sens
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goxy(x, y, sens, callback, no_fifo){
		if(sens == "avant") sens = 1;
		else if(sens == "arriere") sens = -1;
		else sens = 0;
		
		this.sendCommand(COMMANDS.GOTO, [
			parseInt(this.convertColorX(x)),
			parseInt(this.convertColorY(y)),
			sens
		], true, callback, no_fifo);
	}

	/**
	 * Go Angle
	 * 
	 * @param {int} a
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goa(a, callback, no_fifo){
		// this.clean();
		this.sendCommand(COMMANDS.ROT, [
			myWriteFloat(this.convertColorA(a))
		], true, callback, no_fifo);
	}

		/**
	 * Set P I D
	 * @param {float} p
	 * @param {float} i
	 * @param {float} d
	 * @param {Object} callback
	 */
	setPid(p, i, d, callback){
		// this.clean();
		this.sendCommand(COMMANDS.PIDALL, [
			myWriteFloat(p),
			myWriteFloat(i),
			myWriteFloat(d)
		],false, callback);
	}
}

module.exports = AsservReal;