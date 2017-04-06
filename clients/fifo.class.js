/**
 * First In First Out module
 * 
 * @module clients/fifo
 * @see {@link clients/fifo.Fifo}
 */

"use strict";

/**
 * First In First Out class
 * 
 * @class Fifo
 * @memberof module:clients/fifo
 */
class Fifo {

	/**
	 * Fifo Constructor
	 */
	constructor() {
		this.logger = require('log4js').getLogger('Fifo');
		this.clean();
	}

	/**
	 * Clean
	 * 
	 * @param {function} callback
	 */
	clean (callback) {
		/** fifo */
		this.fifo = [];
		/** @type {boolean} */
		this.order_in_progress = false;
	}

	/**
	 * Order finished
	 */
	orderFinished () {
		this.order_in_progress = false;
		this.nextOrder();
	}

	/**
	 * New Order
	 * 
	 * @param {Object} callback
	 * @param {string} [name]
	 */
	newOrder (callback, name) {
		if (name === undefined)
			name = "";
		this.fifo.push({callback: callback, name: name});
		this.nextOrder();
	}

	/**
	 * Next Order
	 */
	nextOrder () {
		if(!this.order_in_progress && this.fifo.length > 0) {
			// logger.debug(this.fifo.length);
			this.order_in_progress = true;
			var object = this.fifo.shift();
			// logger.debug("Calling : "+object.name);
			object.callback();
		}
	}
}

module.exports = Fifo;
