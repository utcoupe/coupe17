/**
 * Module Asservissement en mode simulateur
 * 
 * @module clients/Asserv/AsservSimu
 * @requires module:clients/Asserv/Asserv
 */

const Asserv = require('Asserv.class.js');

/**
 * Classe héritant de l'asservissement, mode simulateur
 * 
 * @memberof module:clients/Asserv/AsservSimu
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservSimu extends Asserv{
	constructor(){
		
	}
}

module.exports = AsservSimu;