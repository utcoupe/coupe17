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

	/**
	 * Execute order
	 */
	// executeNextOrder(){
	// 	if ((this.queue.length > 0) && (!this.orderInProgress)) {
	// 		var order = this.queue.shift();
	// 		if(order.name == "send_message") {
	// 			// logger.debug("Send message %s", order.params.name);
	// 			this.client.send('ia', order.params.name, order.params || {});
	// 			this.executeNextOrder();
	// 		} else {
	// 			this.orderInProgress = order.name;

	// 			this.logger.info(this.orderInProgress+" : Begin , 	executeNextOrder");
	// 			this.logger.debug(order.params);

	// 			//TODO DECOMMENT IT AFTER acts done
	// 			//this.acts.orderHandler(order.from, order.name, order.params, this.actionFinished);


	// 		// Asserv HACK
	// 		//var callback = this.actionFinished
	// 			switch (order.name){
	// 				case "pwm":
	// 					this.asserv.pwm(order.params.left, order.params.right, order.params.ms, this.actionFinished());
	// 				break;
	// 				case "setvit":
	// 					this.asserv.setVitesse(order.params.v, order.params.r, this.actionFinished());
	// 				break;
	// 				case "clean":
	// 					this.asserv.clean(this.actionFinished());
	// 				break;
	// 				case "goa":
	// 					this.asserv.goa(order.params.a, this.actionFinished(), true);
	// 				break;
	// 				case "goxy":
	// 					this.asserv.goxy(order.params.x, order.params.y, order.params.sens, this.actionFinished(), true);
	// 				break;
	// 				case "setpos":
	// 					this.asserv.setPos(order.params, this.actionFinished());
	// 				break;
	// 				case "setacc":
	// 					this.asserv.setAcc(order.params.acc, this.actionFinished());
	// 				break;
	// 				case "setpid":
	// 					this.asserv.setPid(order.params.p, order.params.i, order.params.d, this.actionFinished());
	// 				break;
	// 				case "sync_git":
	// 					spawn('/root/sync_git.sh', [], {
	// 						detached: true
	// 					});
	// 				break;
	// 				default:
	// 					this.actionFinished();
	// 					this.executeNextOrder();
	// 			}
	// 		}
	// 	}
	// }

	// /**
	//  * Launch the next order
	//  */
	// actionFinished(){
	// 	this.logger.info("actionFinished : " + this.orderInProgress);
	// 	if(this.orderInProgress !== false) {
	// 		this.logger.info(this.orderInProgress + " : End");

	// 		this.orderInProgress = false;
	// 		this.executeNextOrder();
	// 	}
	// }

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
