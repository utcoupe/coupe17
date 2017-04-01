/**
 * Module du robot de base
 * 
 * @module clients/Robot/robot
 * @requires module:clients/client
 */

const Client = require('../client.class.js');

/**
 * Robot abstrait
 * 
 * @class Robot
 * @memberof module:clients/Robot/robot
 * @extends {clients/client.Client}
 */
class Robot extends Client{
	constructor(){
		
	}
}

module.exports = Robot;