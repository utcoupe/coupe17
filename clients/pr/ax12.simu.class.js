/**
 * AX12 Simulator module
 * 
 * @module clients/pr/ax12-simu
 * @see {@link clients/pr/ax12-simu.Ax12}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('pr.ax12');

	/**
	 * Ax12 constructor
	 * 
	 * @exports clients/pr/ax12-simu.Ax12
	 * @constructor
	 * @param {clients/shared/fifo.Fifo} fifo
	 */
	function Ax12(fifo) {
		this.fifo = fifo;
	}

	/**
	 * Disconnects (nothing ?)
	 * 
	 * @param {} x
	 */
	Ax12.prototype.disconnect = function(x) {

	};

	/**
	 * Calls callback
	 * 
	 * @param {Object} [callback]
	 * @param {int} ms
	 */
	Ax12.prototype.callCallback = function(callback, ms) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			setTimeout(function() {
				callback();
				this.fifo.orderFinished();
			}.bind(this), parseInt(ms/5));
		}.bind(this));
	}

	/**
	 * Ouvrir
	 * 
	 * @param {Object} callback
	 */
	Ax12.prototype.ouvrir = function(callback) {
		this.callCallback(callback, 1000);
	};

	/**
	 * Fermer
	 * 
	 * @param {Object} callback
	 */
	Ax12.prototype.fermer = function(callback) {
		this.callCallback(callback, 1000);
	};
	/**
	 * Fermer Balle
	 * 
	 * @param {Object} callback
	 */
	Ax12.prototype.fermerBalle = function(callback) {
		this.callCallback(callback, 800);
	};
	/**
	 * Fermer Balle 2
	 * 
	 * @param {Object} callback
	 */
	Ax12.prototype.fermerBalle2 = function(callback) {
		this.callCallback(callback, 900);
	};

	return Ax12;
})();
