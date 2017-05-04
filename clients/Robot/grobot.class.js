/**
 * Module du grand robot
 *
 * @module clients/Robot/grobot
 * @requires module:clients/Robot/robot
 */

"use strict";

const Robot = require('./robot.class.js');

/**
 * Grand Robot
 *
 * @class Grobot
 * @memberof module:clients/Robot/grobot
 * @extends {clients/Robot/robot.Robot}
 */
class Grobot extends Robot{

	constructor(Robotname){
	    super(Robotname);
  	}

	/**
	* Push the order (enfiler)
	*
	* @param {string} f from
	* @param {string} n name
	* @param {Object} p parameters
	*/
	addOrder2Queue(f, n, p){
		if(this.queue.length < 50) {
			// Adds the order to the queue
			this.queue.push({
				from: f,
				name: n,
				params: p
			});
			this.logger.info("Order added to queue ! : ");
			this.logger.info(this.queue);
			this.executeNextOrder();
		}
	}

	/**
	 * Tries to exit
	 *
	 * @todo do something when app is closing
	 */
	quit () {
		this.logger.info("Please wait while exiting...");
		// acts.quit();
		process.exit(0);
	}

	// Exiting :
	//do something when app is closing
	//process.on('exit', quit);
	// catches ctrl+c event
	//process.on('SIGINT', quit);
	// //catches uncaught exceptions
	// process.on('uncaughtException', quit);
}

module.exports = Grobot;
