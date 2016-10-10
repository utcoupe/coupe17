module.exports = (function () {
	var logger = require('log4js').getLogger('Fifo');

	function Fifo() {
		this.clean();
	}
	Fifo.prototype.clean = function(callback) {
		this.fifo = [];
		this.order_in_progress = false;
	}

	Fifo.prototype.orderFinished = function() {
		this.order_in_progress = false;
		this.nextOrder();
	}

	Fifo.prototype.newOrder = function(callback, name) {
		if (name === undefined)
			name = "";
		this.fifo.push({callback: callback, name: name});
		this.nextOrder();
	}

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
