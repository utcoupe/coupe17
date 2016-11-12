/**
 * Actuators module
 * 
 * @module clients/gr/actuators
 * @requires module:clients/shared/fifo
 * @requires module:clients/gr/servos
 * @requires module:clients/gr/servos-simu
 * @requires module:clients/shared/asserv
 * @requires module:clients/shared/asserv-simu
 * @see {@link clients/gr/actuators.Acts}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('gr.acts');
	var serialPort = require("serialport");
	/** @type {Object} */
	var SerialPort = serialPort.SerialPort;
	/** @type {clients/shared/fifo.Fifo} */
	var fifo = new (require('../shared/fifo.class.js'))();

	/** @type {clients/gr/servos.Servos} */
	var servos = null;
	/** @type {clients/gr/asserv.Asserv} */
	var asserv = null;
	var date = new Date();
	/** @type {int} */
	var lastSendStatus =  date.getTime();

	/**
	 * Acts Constructor
	 * 
	 * @exports clients/gr/actuators.Acts
	 * @constructor
	 * @param {Object} client
	 * @param {Object} sendChildren
	 */
	function Acts(client, sendChildren) {
		/** @type {Object} */
		this.client = client;
		/** @type {Object} */
		this.sendChildren = sendChildren;
		this.start();
	}

	/**
	 * Starts (nothing ?)
	 */
	Acts.prototype.start = function(){

	};
	
	/**
	 * Cleans fifo and asserv
	 */
	Acts.prototype.clean = function(){
		fifo.clean(); // A priori déjà vide
		asserv.clean();
	};

	/**
	 * Connect to the servos
	 * 
	 * @param {Object} [struct]
	 */
	Acts.prototype.connectTo = function(struct){
		if (!struct.servos) {
			logger.fatal("Lancement des servos gr en mode simu !");
			servos = new (require('./servos.simu.class.js'))();
		} else {
			servos = new (require('./servos.class.js'))(struct.servos, this.sendStatus);
		}
		if (!struct.asserv) {
			logger.fatal("Lancement de l'asserv gr en mode simu !");
			asserv = new (require('../shared/asserv.simu.class.js'))(this.client, 'gr', fifo);
		} else {
			asserv = new (require('../shared/asserv.class.js'))(
				new SerialPort(struct.asserv, {
					baudrate: 57600,
					parser:serialPort.parsers.readline('\n'),
				}), this.client, 'gr', this.sendStatus, fifo
			);
		}
	};

	/**
	 * Sends Status
	 */
	Acts.prototype.sendStatus = function() {
		if(lastSendStatus <  date.getTime()-1000){
			this.sendChildren(this.getStatus);
			lastSendStatus =  date.getTime();
		}
	};

	/**
	 * Gets the status
	 */
	Acts.prototype.getStatus = function(){
		var data = {
			"status": "",
			"children": []
		};

		data.status = "everythingIsAwesome";

		if(servos && servos.ready){
			data.children.push("Arduino servos");
		}else
			data.status = "ok";

		if(asserv && asserv.ready){
			data.children.push("Arduino asserv");
		}else
			data.status = "error";

		return data;
	};

	/**
	 * Tries to quit
	 */
	Acts.prototype.quit = function(){
		if (!!servos && servos.ready)
			servos.disconnect();
		if (!!asserv && asserv.ready)
			asserv.disconnect();
	};

	/**
	 * Order switch
	 * 
	 * @param {string} from
	 * @param {string} name
	 * @param {Object} params
	 * @param {Object} callback
	 */
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		logger.info(name, params);

		switch (name){
			// Others
			case "acheter":
				servos.acheter(callback);
			break;
			case "vendre":
				servos.vendre(callback);
			break;
			// Asserv
			case "pwm":
				asserv.pwm(params.left, params.right, params.ms,callback);
			break;
			case "setvit":
				asserv.setVitesse(params.v, params.r, callback);
			break;
			case "clean":
				asserv.clean(callback);
			break;
			case "goa":
				asserv.goa(params.a,callback);
			break;
			case "goxy":
				asserv.goxy(params.x, params.y, "avant",callback);
			break;
			case "setpos":
				asserv.setPos(params,callback);
			break;
			case "setpid":
				asserv.setPid(params.p, params.i, params.d,callback);
			break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
				callback();
		}
	};

	return Acts;
})();
