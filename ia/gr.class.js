module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr(ia, color) {
		this.ia = ia;
		this.pos = require('./gr.'+color+'.json')['pos'];
		this.pos.color = color;
		this.size = {
			l: 290,
			L: 290,
			d: 420
		};
		this.orders = require('./gr.'+color+'.json')['script'];
		// logger.debug(this.orders);
		this.path = null;
	}

	Gr.prototype.start = function () {
		this.sendOrders();
	};

	Gr.prototype.stop = function() {
		logger.debug('stop GR');
		this.ia.client.send('gr', 'stop');
	}

	Gr.prototype.sendPos = function () {
		this.ia.client.send("gr", "setpos", this.pos);
	};

	Gr.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'gr.pos':
				this.pos.x = params.x;
				this.pos.y = params.y;
				this.pos.a = params.a;
			break;
			case 'gr.getpos':
				this.sendPos();
			break;
			default:
				logger.warn('Ordre inconnu dans ia.gr: '+name);
		}
	};

	Gr.prototype.sendOrders = function () {
		for(var i in this.orders) {
			this.ia.client.send("gr", this.orders[i].name, this.orders[i].data);
		}
	};

	Gr.prototype.onCollision = function () {
		logger.warn("Collision du gros robot");
		// TODO send order STOP
	};


	
	return Gr;
})();
