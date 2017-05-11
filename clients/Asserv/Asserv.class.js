/**
 * Module exportant la classe abstraite Asserve
 *
 * @module clients/Asserv/Asserv
 */

"use strict";

/**
 * Class Asserv.
 *
 * @memberof module:clients/Asserv/Asserv
 */
class Asserv{
	/**
	 * Creates an instance of Asserv.
	 * @param {any} client
	 * @param {any} robotName
	 * @param {any} fifo
	 */
	constructor(client, robotName, fifo, sendStatus, sp){
		/** @type {Log4js} */
		this.logger = require('log4js').getLogger('asserv');

		/** @type {Object} */
		this.client = client;

		/** @type {Object} */
		this.robotName = robotName;

		/** @type {Object} */
		this.pos = {};

		/** @type {clients/fifo.Fifo} */
		if(fifo === undefined || fifo === null){
			var Fifo = require('../fifo.class.js');
			this.fifo = new Fifo();
		}
		else 
			this.fifo = fifo;

		/** @type {Array}*/
		this.queue = []
		this.orderInProgress = false;

		this.getInitPos();
	}

	/**
	 * Convert Angle
	 *
	 * @param {int} a Angle
	 */
	// Attention, c'est une fonction a la base, pas une methode
	convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

	/**
	 * Set Angle
	 *
	 * @param {int} a Angle
	 */
	setA(a) {
		this.pos.a = this.convertA(a);
	}

	/**
	 * Position ?
	 *
	 * @param {Object} pos
	 */
	Pos(pos) {
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
	setPos(pos, callback){}

	/**
	 * Gets Position
	 *
	 * @param {Object} pos
	 */
	getInitPos(pos) {
		this.client.send('ia', this.robotName+'.getinitpos');
	}


	/**
	 * Sends Position
	 */
	sendPos() {
		this.client.send('ia', this.robotName+'.pos', this.pos);
	}

	/**
	 * Calage X
	 *
	 * @param {int} x
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageX(x, a, callback){}

	/**
	 * Calage Y
	 *
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageY(y, a, callback){}

	/**
	 * Set Vitesse
	 *
	 * @param {int} v Speed
	 * @param {float} r Rotation
	 * @param {Object} callback
	 */
	setVitesse(v, r, callback){}

	/**
	 * Speed ?
	 *
	 * @param {int} l
	 * @param {int} a Angle
	 * @param {int} ms
	 * @param {Object} callback
	 */
	speed(l, a, ms, callback){}

	/**
	 * Pulse Width Modulation
	 *
	 * @param {int} left
	 * @param {int} right
	 * @param {int} ms
	 * @param {Object} callback
	 */
	pwm(left, right, ms, callback){}

	/**
	 * Go X Y
	 *
	 * @param {int} x
	 * @param {int} y
	 * @param {string} sens
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goxy(x, y, sens, callback, no_fifo){}

	/**
	 * Simu Go Angle
	 *
	 * @param {int} a Angle
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goa(a, callback, no_fifo){}

	/**
	 * Set P I D
	 *
	 * @param {int} p
	 * @param {int} i
	 * @param {int} d
	 * @param {Object} callback
	 */
	setPid(p, i, d, callback){}

	/**
	 * Launch the next order TODO : put in fifo class
	 */
	actionFinished(){
		if(this.orderInProgress !== false) {
			this.logger.info("Asserv simu actionFinished : " + this.orderInProgress);

			this.orderInProgress = false;
			this.executeNextOrder();
		}
	}

	executeNextOrder(){
	 	if((this.queue.length > 0) && (!this.orderInProgress)) {
	 		var order = this.queue.shift();

	 		this.orderInProgress = order.name;

			this.logger.info("Executing " + this.orderInProgress);
	 		// this.logger.debug(order.params);

 			switch (order.name){
				case "send_message":
					// logger.debug("Send message %s", order.params.name);
					this.client.send('ia', order.params.name, order.params || {});
					this.executeNextOrder();
				break;
				case "pwm":
					this.pwm(order.params.left, order.params.right, order.params.ms, this.actionFinished());
				break;
				case "setvit":
					this.setVitesse(order.params.v, order.params.r, this.actionFinished());
				break;
				case "clean":
					this.clean(this.actionFinished());
				break;
				case "goa":
					this.logger.debug("Callback " + this.actionFinished); // TODO : undefined...
					this.goa(order.params.a, this.actionFinished, true);
				break;
				case "goxy":
					this.logger.debug("Callback goxy " + this.actionFinished); // TODO : undefined...
					this.goxy(order.params.x, order.params.y, order.params.sens, this.actionFinished, true);
				break;
				case "setpos":
					this.setPos(order.params, this.actionFinished());
				break;
				case "setpid":
					this.setPid(order.params.p, order.params.i, order.params.d, this.actionFinished());
				break;
				default:
					this.logger.fatal("This order is unknown for the " + this.robotName + " AsservSimu : " + order.name);
					this.actionFinished();
					this.executeNextOrder();
			}
	 	}
	}
}

module.exports = Asserv;
