/**
 * Module des extensions
 * 
 * @module clients/Extension/extension
 * @requires module:clients/client
 */

"use strict";

const Client = require('../client.class.js');
const SocketClient = require('../../server/socket_client.class.js');
const CONFIG = require('../../config.js');

/**
 * Classe abstraite représentant les extensions
 * 
 * @memberof module:clients/Extension/extension
 * @extends clients/client.Client
 */
class Extension extends Client {
    constructor(extensionName){
        super();
        this.extensionName = extensionName;
        this.logger = this.Log4js.getLogger(extensionName);

        var server = CONFIG.server;

        this.client = new SocketClient({
            server_ip: server,
            type: extensionName
        });
        this.client.order(this.takeOrder.bind(this));
    }

    takeOrder (from, name, param) {
        throw new TypeError("extension:takeOrder is abstract !");
    }
}

module.exports = Extension;