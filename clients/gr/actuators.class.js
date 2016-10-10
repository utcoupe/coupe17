module.exports = (function () {
	var logger = require('log4js').getLogger('gr.acts');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;
	var fifo = new (require('../shared/fifo.class.js'))();

	var servos = null;
	var asserv = null;
	var date = new Date();
	var lastSendStatus =  date.getTime();

	function Acts(client, sendChildren) {
		this.client = client;
		this.sendChildren = sendChildren;
		this.start();
	}

	Acts.prototype.start = function(){

	};
	
	Acts.prototype.clean = function(){
		fifo.clean(); // A priori déjà vide
		asserv.clean();
	};

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

	Acts.prototype.sendStatus = function() {
		if(lastSendStatus <  date.getTime()-1000){
			this.sendChildren(this.getStatus);
			lastSendStatus =  date.getTime();
		}
	};

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

	Acts.prototype.quit = function(){
		if (!!servos && servos.ready)
			servos.disconnect();
		if (!!asserv && asserv.ready)
			asserv.disconnect();
	};

	// Order switch
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
