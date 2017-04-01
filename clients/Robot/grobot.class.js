/**
 * Module du grand robot
 * 
 * @module clients/Robot/grobot
 * @requires module:clients/Robot/robot
 */

const Robot = require('robot.class.js');

/**
 * Grand Robot
 * 
 * @class Grobot
 * @memberof module:clients/Robot/grobot
 * @extends {clients/Robot/robot.Robot}
 */
class Grobot extends Robot{
	constructor(){
		
	}
}

module.exports = Grobot;