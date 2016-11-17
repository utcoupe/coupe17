/**
 * First In First Out module
 * 
 * @module clients/shared/fifo
 * @see {@link clients/shared/fifo.Fifo}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('Fifo');

	/**
	 * Fifo Constructor
	 * 
	 * @exports clients/shared/fifo.Fifo
	 * @constructor
	 */
	function Fifo() {
		this.clean();
	}

	/**
	 * Clean
	 */
	Fifo.prototype.clean = function(callback) {
		/** fifo */
		this.fifo = [];
		/** @type {boolean} */
		this.order_in_progress = false;
	}

	/**
	 * Order finished
	 */
	Fifo.prototype.orderFinished = function() {
		this.order_in_progress = false;
		this.nextOrder();
	}

	/**
	 * New Order
	 * 
	 * @param {Object} callback
	 * @param {string} [name]
	 */
	Fifo.prototype.newOrder = function(callback, name) {
		if (name === undefined)
			name = "";
		this.fifo.push({callback: callback, name: name});
		this.nextOrder();
	}

	/**
	 * Next Order
	 */
	Fifo.prototype.nextOrder = function() {
		if(!this.order_in_progress && this.fifo.length > 0) {
			// logger.debug(this.fifo.length);
			this.order_in_progress = true;
			object = this.fifo.shift();
			// logger.debug("Calling : "+object.name);
			object.callback();
		}
	}


	return Fifo;
})();
