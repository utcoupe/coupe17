/**
 * Module du grand robot
 *
 * @module clients/Robot/grobot
 * @requires module:clients/Robot/robot
 */

"use strict";

const Robot = require('./robot');
const Canon = require('../extension/canon');
const Sweeper = require('../extension/sweeper');

/**
 * Grand Robot
 *
 * @class Grobot
 * @memberof module:clients/Robot/grobot
 * @extends {clients/Robot/robot.Robot}
 */
class Grobot extends Robot{

	constructor(robotName){
	    super(robotName);

		this.canon = new Canon();
		this.sweeper = new Sweeper();
  	}

	
	// called by start
	openExtensions () {
		this.sweeper.start();
		this.canon.start();
	}
	
	// called by stop and exit
	closeExtensions () {
		this.sweeper.stop();
		this.canon.stop();
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
