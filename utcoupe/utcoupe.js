/**
 * Main application
 * 
 * @module utcoupe/utcoupe
 */
(function () {
	/**
	 * @requires module:server/server
	 */
	var Server = require('../server/server.class.js');

	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');

	/** 
	 * Create the server with default port
	 */ 
	var server = new Server();
})();
