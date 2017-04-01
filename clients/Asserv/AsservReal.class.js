/**
 * Classe implémentant l'asservissement en mode réel.
 * 
 * @module clients/Asserv/AsservReal
 * @requires module:clients/Asserv/Asserv
 */

const Asserv = require('Asserv.class.js');

/**
 * Classe implémentant l'asservissement en mode réel
 * 
 * @memberof module:clients/Asserv/AsservReal
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservReal extends Asserv{
	constructor(){
		
	}
}

module.exports = AsservReal;