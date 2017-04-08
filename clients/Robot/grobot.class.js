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
    if (Robotname)
      super(Robotname);
    else
      super();
  }


	 devicesDetected(struct){
    // Verify content
		if (!struct.servos)
			logger.warn("Missing servos Nano");
		if (!struct.asserv)
			logger.warn("Missing asserv Nano");

		// Connect to what's detected
		this.acts.connectTo(struct);

		// Send struct to server
		this.sendChildren(acts.getStatus());
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
			// logger.info("Order added to queue ! : ");
			// logger.info(queue);
			executeNextOrder();
		}
	}

	/**
	 * Execute order
	 */
	 executeNextOrder(){
		if ((queue.length > 0) && (!orderInProgress)){
			var order = queue.shift();
			this.orderInProgress = order.name;

			this.logger.info("Going to do '" + orderInProgress + "' "+order.params.toString());
			this.acts.orderHandler(order.from, order.name, order.params, actionFinished);

			executeNextOrder();
		}
	}

	/**
	 * Launch the next order
	 */
	actionFinished(){
		this.logger.info(orderInProgress + " just finished !");

		this.orderInProgress = false;
		executeNextOrder();
	}


	/**
	 * Tries to exit
	 *
	 * @todo do something when app is closing
	 */
	 quit () {
		logger.info("Please wait while exiting...");
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
