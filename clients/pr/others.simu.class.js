module.exports = (function () {
	var logger = require('log4js').getLogger('pr.others');

	function Others(fifo) {
		this.fifo = fifo;
	}

	Others.prototype.disconnect = function(x) {

	};

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

	Others.prototype.fermerStabilisateur = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		this.callCallback(callback, 200);
	};
	
	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.sortirClap = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.rangerClap = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.prendreGobelet = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.lacherGobelet = function(callback) {
		this.callCallback(callback, 200);
	};

	Others.prototype.monterAscenseur = function(callback) {
		this.callCallback(callback, 1000);
	};

	Others.prototype.monterUnPeuAscenseur = function(callback) {
		this.callCallback(callback, 300);
	};

	Others.prototype.descendreUnPeuAscenseur = function(callback) {
		this.callCallback(callback, 300);
	};

	Others.prototype.monterMoyenAscenseur = function(callback) {
		this.callCallback(callback, 500);
	};

	Others.prototype.descendreMoyenAscenseur = function(callback) {
		this.callCallback(callback, 500);
	};

	Others.prototype.descendreAscenseur = function(callback) {
		this.callCallback(callback, 1000);
	};

	
	return Others;
})();
