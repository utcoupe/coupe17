/**
 * Module du petit robot
 *
 * @module clients/Robot/tibot
 * @requires module:clients/Robot/robot
 */

"use strict";


//Préciser ce qu'attends le robot avant de commencer par un log

//TODO Find a way to replace detect

const Robot = require('./robot.class.js');
const UnitGrabber = require('../Extension/unitgrabber.class.js');
const BaseConstructor = require('../Extension/baseconstructor.class.js');

/**
 * Petit Robot
 *
 * @memberof module:clients/Robot/tibot
 * @extends clients/Robot/robot.Robot
 */
class Tibot extends Robot{

	constructor(robotName){
		super(robotName);

		this.unitGrabber = new UnitGrabber();
		this.baseConstructor = new BaseConstructor();
	}
	
	kill () {
		this.logger.info("Please wait while exiting...");
		// to be replaced
        this.unitGrabber.stop();
        this.baseConstructor.stop();
		// ****
		process.exit();
	}

	stop() {
        this.unitGrabber.stop();
        this.baseConstructor.stop();
        super.stop();
    }

	start() {
        super.start();
        this.unitGrabber.start();
        this.baseConstructor.start();
    }

	// Exiting :
	//do something when app is closing
	// process.on('exit', quit);
	// catches ctrl+c event
	// process.on('SIGINT', quit);
	// //catches uncaught exceptions
	// process.on('uncaughtException', quit);
}

module.exports = Tibot;
