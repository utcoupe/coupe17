/**
 * Grand Robot Module
 * 
 * @module ia/gr
 * @see {@link ia/gr.Gr}
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	/**
	 * Gr Constructor
	 * 
	 * @exports ia/gr.Gr
	 * @constructor
	 * @param {Object} ia
	 * @param {string} color
	 */
	function Gr(ia, color) {
		/** IA */
		this.ia = ia;
		/** Position */
		this.pos = require('./gr.'+color+'.json')['pos'];
		this.pos.color = color;
		/** Size of the robot */
		this.size = {
			l: 290,
			L: 290,
			d: 420
		};
		/** Orders */
		this.orders = require('./gr.'+color+'.json')['script'];
		// logger.debug(this.orders);
		/** Path */
		this.path = null;
	}

	/**
	 * Start
	 */
	Gr.prototype.start = function () {
		this.sendOrders();
	};

	/**
	 * Stop
	 */
	Gr.prototype.stop = function() {
		logger.debug('stop GR');
		this.ia.client.send('gr', 'stop');
	}

	/**
	 * Send position
	 */
	Gr.prototype.sendPos = function () {
		this.ia.client.send("gr", "setpos", this.pos);
	};

	/**
	 * Parse Order
	 * 
	 * @param {string} from
	 * @param {string} name
	 * @param {Object} params
	 */
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

	/**
	 * Send Orders
	 */
	Gr.prototype.sendOrders = function () {
		for(var i in this.orders) {
			this.ia.client.send("gr", this.orders[i].name, this.orders[i].data);
		}
	};

	/**
	 * On Collision : TODO send order STOP
	 */
	Gr.prototype.onCollision = function () {
		logger.warn("Collision du gros robot");
		// TODO send order STOP
	};


	
	return Gr;
})();
