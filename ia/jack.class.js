/**
 * Jack Module
 * Sends "jack" message when detected on GPIO
 * 
 * @module ia/jack
 * @requires log4js
 * @see {@link ia/jack.Jack}
 */

const gpio = require('rpi-gpio');
const PLUS = 7; 	// LED side pin, OUTPUT +3.3V
const MINUS = 0; 	// Switch side pin, INPUT

module.exports = (function () {
	"use strict";
	const logger = require('log4js').getLogger('ia.jack');

	/**
	 * Jack Constructor
	 * 
	 * @exports ia/jack.Jack
	 * @constructor
	 * @param {Object} ia
	 */
	function Jack(ia) {
		/** IA */
		this.ia = ia;

		this.setup();
	}
	/**
	 * Setup Jack
	 */
	Jack.prototype.setup = function() {
		gpio.setup(PLUS, gpio.DIR_OUT, () => {
			gpio.write(PLUS, true, function(err) {
			    if (err) throw err;
			    logger.log('Written to pin ' + PLUS);
			});
		});

		gpio.setup(MINUS, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.on('change', this.valueChanged);
	};

	/**
	 * Read on GPIO, react accordingly
	 */
	Jack.prototype.valueChanged = function(channel, value) {
	    logger.log('Channel ' + channel + ' value is now ' + value);
	};

	/**
	 * Read on GPIO, react accordingly
	 */
	Jack.prototype.stop = function() {
		gpio.write(PLUS, true, function(err) {
		    if (err) throw err;
		    logger.log('Written to pin ' + PLUS);
		    
	        gpio.destroy(function() {
		        console.log('All pins unexported');
		    });
		});
	};


	return Jack;
})();

