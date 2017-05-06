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

	constructor(Robotname){
		super(Robotname);
		
		this.unitGrabber = new UnitGrabber();
		this.baseConstructor = new BaseConstructor();
	}

	/**
	 * Push the order (enfiler)
	 *
	 * @param {string} f from
	 * @param {string} n name
	 * @param {Object} p parameters
	 */
	addOrder2Queue(f, n, p){
		// if(n == 'clean') {
		// 	logger.info(n+" : Begin");
		// 	acts.orderHandler(f, n, p, actionFinished);
		// } else
		this.logger.info("addOrder2Queue f : " + f + " n : " + n + " p : " + p);
		if(this.queue.length < 100){
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

	quit () {
		this.logger.info("Please wait while exiting...");
		this.acts.quit();
		process.exit();
	}

	stop() {
        this.unitGrabber.stop();
        this.baseConstructor.stop();
        super.stop();
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
