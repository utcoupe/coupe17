/**
 * Others Simulator module
 * 
 * @module clients/pr/others-simu
 * @see {@link clients/pr/others-simu.Others}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('pr.others');

	/**
	 * Others constructor
	 * 
	 * @exports clients/pr/others-simu.Others
	 * @constructor
	 * @param {clients/shared/fifo.Fifo} fifo
	 */
	function Others(fifo) {
		/** @type {clients/shared/fifo.Fifo} */
		this.fifo = fifo;
	}

	/**
	 * Disconnects (nothing ?)
	 */
	Others.prototype.disconnect = function(x) {

	};

	/**
	 * Call callback
	 * 
	 * @param {Object} [callback]
	 * @param {int} ms
	 */
	Others.prototype.callCallback = function(callback, ms) {
		if(callback === undefined) {
			callback = function(){};
		}
		this.fifo.newOrder(function() {
			setTimeout(function() {
				callback();
				this.fifo.orderFinished();
			}.bind(this), parseInt(ms/5));
		}.bind(this));
	};

	/**
	 * Fermer stabilisateur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.fermerStabilisateur = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Ouvrir stabilisateur moyen
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		this.callCallback(callback, 200);
	};
	
	/**
	 * Ouvrir stabilisateur grand
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Fermer bloqueur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.fermerBloqueur = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Ouvrir bloqueur moyen
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Ouvrir bloqueur grand
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Sortir clap
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.sortirClap = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Ranger clap
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.rangerClap = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Prendre Gobelet
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.prendreGobelet = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Lacher Gobelet
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.lacherGobelet = function(callback) {
		this.callCallback(callback, 200);
	};

	/**
	 * Monter ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.monterAscenseur = function(callback) {
		this.callCallback(callback, 1000);
	};

	/**
	 * Monter un peu ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.monterUnPeuAscenseur = function(callback) {
		this.callCallback(callback, 300);
	};

	/**
	 * Descendre un peu ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.descendreUnPeuAscenseur = function(callback) {
		this.callCallback(callback, 300);
	};

	/**
	 * Monter moyen ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.monterMoyenAscenseur = function(callback) {
		this.callCallback(callback, 500);
	};

	/**
	 * Descendre moyen ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.descendreMoyenAscenseur = function(callback) {
		this.callCallback(callback, 500);
	};

	/**
	 * Descendre ascenseur
	 * 
	 * @param {Object} callback
	 */
	Others.prototype.descendreAscenseur = function(callback) {
		this.callCallback(callback, 1000);
	};

	
	return Others;
})();
