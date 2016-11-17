/**
 * Main application
 * 
 * @module utcoupe/utcoupe
 * @requires module:server/server
 */
(function () {
	/**
	 * Server
	 * @type {server/server.Server}
	 */
	var Server = require('../server/server.class.js');

	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');

	/** 
	 * Create the server with default port
	 */ 
	var server = new Server();
})();
