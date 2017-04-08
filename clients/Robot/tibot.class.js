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

/**
 * Petit Robot
 *
 * @class Grobot
 * @memberof module:clients/Robot/tibot
 * @extends {clients/Robot/robot.Robot}
 */


class Tibot extends Robot{

	constructor(Robotname){
		if (Robotname)
			super(Robotname);
		else
			super();
	}

	devicesDetected(struct){
		// Verify content

		if (!struct.others)
			this.logger.warn("Missing others Mega");

		// if (!struct.servos)
		// 	logger.warn("Missing servos Nano");

		if (!struct.asserv)
			this.logger.warn("Missing asserv Nano");

		if (!struct.ax12)
			this.logger.warn("Missing USB2AX");

		// Connect to what's detected
		//this.acts.connectTo(struct);

		// Send struct to server
		//TODO DO AFTER acts done this.sendChildren(acts.getStatus());
		this.sendChildren("ok"); //TODO Check it

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
		if(this.queue.length < 100){
			// Adds the order to the queue
			this.queue.push({
				from: f,
				name: n,
				params: p
			});
			// logger.info("Order added to queue ! : ");
			// logger.info(queue);

			this.executeNextOrder();
		}
	}

	/**
	 * Execute order
	 */
	executeNextOrder(){
		if ((this.queue.length > 0) && (!this.orderInProgress)) {
			var order = this.queue.shift();
			if(order.name == "send_message") {
				// logger.debug("Send message %s", order.params.name);
				this.client.send('ia', order.params.name, order.params || {});
				this.executeNextOrder();
			} else {
				this.orderInProgress = order.name;

				this.logger.info(this.orderInProgress+" : Begin");
				//logger.debug(order.params);

				//TODO DECOMMENT IT AFTER acts done
				//this.acts.orderHandler(order.from, order.name, order.params, this.actionFinished);

				this.executeNextOrder();
			}
		}
	}

	/**
	 * Launch the next order
	 */
	actionFinished(){
		if(this.orderInProgress !== false) {
			this.logger.info(orderInProgress + " : End");

			this.orderInProgress = false;
			this.executeNextOrder();
		}
	}

	quit () {
		this.logger.info("Please wait while exiting...");
		this.acts.quit();
		process.exit();
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
