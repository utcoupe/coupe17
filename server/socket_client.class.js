module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');

	function SocketClient(params) {
		this.server_ip = params.server_ip || '127.0.0.1:3128';
		this.client = require('socket.io-client')('http://'+this.server_ip);
		this.callbacks = {};

		if(!!params.type)
			this.type = params.type;
		else
			logger.error("Missing client type.");

		// When the client is connected to the server
		this.client.on('connect', function(){
			logger.info('Client connected from server');
			this.client.emit('type', {
				type: this.type,
				options: {
					name: this.type
				}
			});
			if(!!this.callbacks.connect)
				this.callbacks.connect();
			// this.client.emit('order', {to:'client2',text:'Hello!'});
		}.bind(this));

		// When the client receive log from the server
		this.client.on('log', function(data){
			logger.info('[Server log] '+data);
		}.bind(this));

		// When the client receive order from the server
		this.client.on('order', function(data){
			// logger.info('[Order to '+data.to+'] '+data.text);
			if(!!this.callbacks.order)
				if (!!data.name)
					this.callbacks.order(data.from, data.name, data.params || {});
				else
					logger.error("Order has no name ! : " + data);
		}.bind(this));

		// If after 500ms the client isn't connected, throw "server not found" error
		setTimeout(function() {
			if(this.client.disconnected)
				this.errorServerNotFound();
		}.bind(this), 500);
	}

	SocketClient.prototype.connect = function (callback) {
		this.callbacks.connect = callback;
	};

	SocketClient.prototype.order = function (callback) {
		this.callbacks.order = callback;
	};
	SocketClient.prototype.send = function (to, name, params) {
		// logger.debug('send %s to %s', name, to);
		this.client.emit('order', {
			to: to,
			name: name,
			params: params,
			from: this.type
		});
	};

	// Error functions
	SocketClient.prototype.throwError = function (msg) {
		logger.error(msg);
	};
	SocketClient.prototype.errorServerNotFound = function () {
		this.throwError('Server not found at '+this.server_ip+', please make sure the server is running.');
	};
	SocketClient.prototype.errorServerTimeout = function () {
		this.throwError('Server timed out, please make sure the server is still running.');
	};

	return SocketClient;
})();