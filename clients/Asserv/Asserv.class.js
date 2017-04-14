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
	 * @param {any} who
	 * @param {any} fifo
	 */
	constructor(client, who, fifo){
		/** @type {Log4js} */
		this.logger = require('log4js').getLogger('asserv');

		/** @type {Object} */
		this.client = client;

		/** @type {Object} */
		this.who = who;

		/** @type {Object} */
		this.pos = {};

		/** @type {clients/fifo.Fifo} */
		this.fifo = fifo;
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
	getPos(pos) {
		this.client.send('ia', this.who+'.getpos');
	}


	/**
	 * Sends Position
	 */
	sendPos() {
		this.client.send('ia', this.who+'.pos', this.pos);
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
	calageX(y, a, callback){}

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
}

module.exports = Asserv;
