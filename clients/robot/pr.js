/**
 * Module du petit robot
 *
 * @module clients/Robot/tibot
 * @requires module:clients/Robot/robot
 */

"use strict";


//Préciser ce qu'attends le robot avant de commencer par un log

//TODO Find a way to replace detect

const Robot = require('./robot');
const UnitGrabber = require('../extension/unitgrabber');
const BaseConstructor = require('../extension/baseconstructor');

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

	
	// called by start
	openExtensions () {
        this.servo = this.factory.createObject("servo");

        let actuators = {
        	servos: this.servo
        }

        this.unitGrabber.start(actuators);
        this.baseConstructor.start(actuators);
	}
	
	// called by stop and exit
	closeExtensions () {
        this.unitGrabber.stop();
        this.baseConstructor.stop();
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
