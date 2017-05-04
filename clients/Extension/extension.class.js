/**
 * Module des extensions
 * 
 * @module clients/Extension/extension
 * @requires module:clients/client
 */

"use strict";

const Client = require('../client.class.js');

/**
 * Classe abstraite représentant les extensions
 * 
 * @memberof module:clients/Extension/extension
 * @extends clients/client.Client
 */
class Extension extends Client {
    constructor(extensionName){
        super(extensionName);
        this.extensionName = extensionName;

        this.fifo = new (require('../fifo.class.js'))();
    }

    takeOrder(from, name, param) {
        this.fifo.newOrder(this.processFifoOrder(name, param).bind(this), name);
    }

    processFifoOrder (name, param) {
        throw new TypeError("extension:processFifoOrder is pure virtual !");
    }
}

module.exports = Extension;