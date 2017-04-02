/**
 * Module des extensions
 * 
 * @module clients/Extension/extension
 * @requires module:clients/client
 */

const Client = require('../client.class.js');

/**
 * Classe abstraite représentant les extensions
 * 
 * @memberof module:clients/Extension/extension
 * @extends clients/client.Client
 */
class Extension extends Client {
    constructor(){
        //
    }
}

module.exports = Extension;