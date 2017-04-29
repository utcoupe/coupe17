/**
 * Module du client de base
 * 
 * @module clients/client
 * @requires module:server/socket_client
 */

"use strict";

const Log4js = require('log4js');
const SocketClient = require('../server/socket_client.class.js');

/**
 * Client abstrait
 * 
 * @memberof module:clients/client
 */
class Client {
	/**
	 * Creates an instance of Client.
	 * @param {any} status
	 */
	constructor(status){
		this.Log4js = Log4js;
		this.SocketClient = SocketClient;
		this.parser = null;
		this.status = status;
	}

	send(){

	}

	start(){

	}

	stop(){
		
	}

	status(){

	}
}

module.exports = Client;