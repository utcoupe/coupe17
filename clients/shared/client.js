/**
 * Module du client de base
 * 
 * @module clients/client
 * @requires module:server/socket_client
 * @requires module:config
 * @requires module:log4js
 */

"use strict";

const Log4js = require('log4js');
const CONFIG = require('../../config.js');
const SocketClient = require('../../server/socket_client.class.js');

/**
 * Client abstrait
 * 
 * @memberof module:clients/client
 */
class Client {
	/**
	 * Creates an instance of Client.
	 * @param {any} status
	 * @param {String} clientName
	 */
	constructor(clientName, status){
        this.logger = Log4js.getLogger(clientName);
        this.clientName = clientName;
		
		var server = CONFIG.server;

        this.client = new SocketClient({
            server_ip: server,
            type: clientName
        });

		this.parser = null;
		this.status = status;
        
        this.client.order(this.takeOrder.bind(this));
	}

    takeOrder (from, name, param) {
        throw new TypeError("client:takeOrder is abstract !");
    }

	sendDataToIA(name, params){
		this.client.send('ia', name, params);
	}

	start(){
		this.client.unMute();
	}

	stop(){
		//todo stop the socket client
		this.client.mute();
        this.logger.info(this.clientName + " has stopped.");
	}

	status(){

	}
}

module.exports = Client;