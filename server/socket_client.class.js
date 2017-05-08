/**
 * Socket Client
 * 
 * @module server/socket_client
 * @requires log4js
 * @requires socket.io-client
 * @see {@link server/socket_client.SocketClient}
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');

	/**
	 * Create a socket for the clients
	 * 
	 * @exports server/socket_client.SocketClient
	 * @constructor
	 * @param {Object} params
	 * @param {string} [params.server_ip=127.0.0.1:3128] Server IPv4 and port
	 * @param {string} params.type Type of client
	 */
	function SocketClient(params) {
		/**
		 * Server IP
		 * @type {string}
		 */
		this.server_ip = params.server_ip || '127.0.0.1:3128';
		/**
		 * Socket du client
		 * @type {socket.io-client}
		 */
		this.client = require('socket.io-client')('http://'+this.server_ip);
		/**
		 * callbacks
		 * @type {Array<Function>}
		 */
		this.callbacks = {};
		/**
		 * Variable permettant au client d'ignorer les échanges réseaux
		 */
		this.muted = false;

		if(!!params.type)
			/** Type of client */
			this.type = params.type;
		else
			logger.error("Missing client type.");

		// When the client is connected to the server
		this.client.on('connect', function(){
			logger.info('Client connected to server');
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

		// When the client is connected to the server
		this.client.on('disconnect', function(){
			logger.error('Client disconnected from server');
		}.bind(this));

		// When the client receive log from the server
		this.client.on('log', function(data){
			logger.info('[Server log] '+data);
		}.bind(this));

		// When the client receive order from the server
		this.client.on('order', function(data){
			// logger.info('[Order to '+data.to+'] '+data.text);
			// On n'autorise pas la réception de message si on est muet, sauf si c'est un start
			if (this.muted && data.name != "start" && data.name != "kill")
				logger.info("A client tried to receive an order, but he is muted!");
			else
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

	/**
	 * connect
	 * 
	 * @param callback
	 */
	SocketClient.prototype.connect = function (callback) {
		this.callbacks.connect = callback;
	};

	/**
	 * order
	 * 
	 * @param callback
	 */
	SocketClient.prototype.order = function (callback) {
		this.callbacks.order = callback;
	};
	/**
	 * Send parameters
	 * 
	 * @param {string} to
	 * @param {string} name
	 * @param {Object} params
	 */
	SocketClient.prototype.send = function (to, name, params) {
		// logger.debug('send %s to %s', name, to);
		if (this.muted)
			logger.info('A client tried to send an order, but he is muted!');
		else
			this.client.emit('order', {
				to: to,
				name: name,
				params: params,
				from: this.type
			});
	};

	// Error functions
	/**
	 * Appends the error message in the logger
	 * 
	 * @param {string} msg message to send
	 */
	SocketClient.prototype.throwError = function (msg) {
		logger.error(msg);
	};
	/**
	 * Throw Server not found
	 */
	SocketClient.prototype.errorServerNotFound = function () {
		this.throwError('Server not found at '+this.server_ip+', please make sure the server is running.');
	};
	/**
	 * Throw Server timed out
	 */
	SocketClient.prototype.errorServerTimeout = function () {
		this.throwError('Server timed out, please make sure the server is still running.');
	};

	/**
	 * Désactive temporairement le client
	 */
	SocketClient.prototype.mute = function () {
		this.muted = true;
	};

	/**
	 * Réactive le client
	 */
	SocketClient.prototype.unMute = function () {
		this.muted = false;
	}

	return SocketClient;
})();