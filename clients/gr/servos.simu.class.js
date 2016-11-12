/**
 * Servos Simulator module
 * 
 * @module clients/gr/servos-simu
 * @see clients/gr/servos-simu.Servos
 */

module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.servos');

	/**
	 * Servos constructor
	 * 
	 * @exports clients/gr/servos-simu.Servos
	 * @constructor
	 * @param {Object} sp
	 */
	function Servos(sp) {

	}

	/**
	 * Acheter
	 * 
	 * @param {Object} callback
	 */
	Servos.prototype.acheter = function(callback) {
		setTimeout(callback, 500);
	};
	/**
	 * Vendre
	 * 
	 * @param {Object} callback
	 */
	Servos.prototype.vendre = function(callback) {
		setTimeout(callback, 500);
	};

	return Servos;
})();