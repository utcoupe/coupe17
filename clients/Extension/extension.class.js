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
    }
}

module.exports = Extension;