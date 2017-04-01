/**
 * Module du petit robot
 * 
 * @module clients/Robot/tibot
 * @requires module:clients/Robot/robot
 */

const Robot = require('robot.class.js');

/**
 * Petit Robot
 * 
 * @class Grobot
 * @memberof module:clients/Robot/tibot
 * @extends {clients/Robot/robot.Robot}
 */
class Tibot extends Robot{
	constructor(){
		
	}
}

module.exports = Tibot;