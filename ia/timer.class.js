module.exports = (function () {
	"use strict";

	function Timer(ia) {
		this.t0 = null;
		this.match_started = false;
		this.ia = ia;
	}
	Timer.prototype.start = function() {
		this.t0 = Date.now();
		this.match_started = true; // le match commence
		setTimeout(function() {
			logger.fatal("TIME OVER");
			this.ia.stop();
		}.bind(this), 89000);
	};


	Timer.prototype.get = function () { // permet d'obtenir le temps écoulé en ms
		if (this.match_started)
			return Date.now() - this.t0;
		else
			return 0;
	};
	Timer.prototype.status = function () {
		if (this.match_started) {
			return "Match started";
		}
		else {
			return "Wainting for jack";
		}
	};

	return Timer;
})();

