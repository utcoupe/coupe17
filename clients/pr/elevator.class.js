/**
 * Elevator module
 * 
 * @module clients/pr/elevator
 * @see {@link clients/pr/elevator.Elevator}
 */

module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.elevator');
	var serialPort = require("serialport");

	var ORDER_ACHIEVED =		'K'; // Like Ok
	var ORDER_UNKNOWN =			'U'; // Like Unknown

	var ELEV_MOVE_UP =			'u';
	var ELEV_MOVE_DOWN =		'd';
	var ELEV_RELEASE =			'r';
	var ELEV_CHOUILLA =			'c';

	/**
	 * Elevator constructor
	 * 
	 * @exports clients/pr/elevator.Elevator
	 * @constructor
	 * @param {Object} sp Serial Port OBJECT
	 */
	function Elevator(sp, sendStatus) {
		/** @type {Object} */
		this.sp = sp;
		/** @type {boolean} */
		this.ready = false;
		/** @type {Object} */
		this.sendStatus = sendStatus;
		/** @type {string} */
		this.pos = 'down';
		/** @type {array<Object>} */
		this.orders_sent = [];

		this.sp.on("data", function(data) {
			this.ready = true;
			this.sendStatus();
			this.parseOrder(data.toString());
		}.bind(this));
	}

	/**
	 * Fonctions for sending orders to the Arduino
	 * 
	 * @param {string} order
	 */
	Elevator.prototype.sendOrder = function(order) {
		this.sp.write(order);
		this.orders_sent.push(order);
	};

	/**
	 * Disconnects
	 */
	Elevator.prototype.disconnect = function() {
		this.sp.close();
		this.ready = false;
		this.sendStatus();
	};


	// ====== General actions ======

	/**
	 * Monter
	 */
	Elevator.prototype.monter = function() {
		this.sendOrder(ELEV_MOVE_UP);
	};

	/**
	 * Monter choilla
	 */
	Elevator.prototype.monterChouilla = function() {
		this.sendOrder(ELEV_CHOUILLA);
	};

	/**
	 * Descendre
	 */
	Elevator.prototype.descendre = function() {
		this.sendOrder(ELEV_MOVE_DOWN);
		this.lacher();
	};

	/**
	 * Release
	 */
	Elevator.prototype.release = function() {
		this.sendOrder(ELEV_RELEASE);
	};

	/**
	 * Parse Order
	 * 
	 * @param {string} order
	 */
	Elevator.prototype.parseOrder = function(order) {
		if(order == ORDER_ACHIEVED) {
			switch(this.orders_sent.shift()) {
				case ELEV_MOVE_UP:
					this.pos = 'up';
					logger.info("Elevator is up");
				break;
				case ELEV_MOVE_DOWN:
					this.pos1 = 'down';
					logger.info("Elevator is down");
				break;
			}
		} else if (order == ORDER_UNKNOWN) {
			oldest_order = this.orders_sent.shift();
			logger.warn("Order sent unknown: "+this.orders_sent.shift());
		} else {
			logger.warn("Order received unknown: "+order);
		}
	};

	return Elevator;
})();