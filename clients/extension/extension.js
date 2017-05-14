/**
 * Module des extensions
 * 
 * @module clients/Extension/extension
 * @requires module:clients/client
 */

"use strict";

const Client = require('../shared/client');
const Fifo = require('../shared/fifo');

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

        this.fifo = new Fifo();
    }

    takeOrder(from, name, param) {
        throw new TypeError("extension:takeOrder is pure virtual !");
    }

    processFifoOrder (name, param) {
        throw new TypeError("extension:processFifoOrder is pure virtual !");
    }

    // Inherited from client
    stop() {
        this.fifo.clean();
        super.stop();
    }

    start() {
        super.start();
    }
}

module.exports = Extension;