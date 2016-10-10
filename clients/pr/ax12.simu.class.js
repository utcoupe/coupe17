module.exports = (function () {
	var logger = require('log4js').getLogger('pr.ax12');

	function Ax12(fifo) {
		this.fifo = fifo;
	}

	Ax12.prototype.disconnect = function(x) {

	};

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

	Ax12.prototype.ouvrir = function(callback) {
		this.callCallback(callback, 1000);
	};

	Ax12.prototype.fermer = function(callback) {
		this.callCallback(callback, 1000);
	};
	Ax12.prototype.fermerBalle = function(callback) {
		this.callCallback(callback, 800);
	};
	Ax12.prototype.fermerBalle2 = function(callback) {
		this.callCallback(callback, 900);
	};

	return Ax12;
})();
