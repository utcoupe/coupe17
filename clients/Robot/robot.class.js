/**
 * Module du robot de base
 *
 * @module clients/Robot/robot
 * @requires module:clients/client
 * @requires module:clients/fifo
 * @requires module:clients/Asserv/AsservSimu
 * @requires module:clients/Asserv/AsservReal
 */

"use strict";

const SerialPort = require("serialport");
const Client = require('../client.class.js');
const Fifo = require('../fifo.class.js');
const AsservSimu = require('../Asserv/AsservSimu.class.js');
const AsservReal = require('../Asserv/AsservReal.class.js');


//TODO Look if use other.class and other_simu
//And define_parser
//Par défault objet simulé, toujours simulé. Voir pour detect

/**
 * Robot abstrait
 *
 * @memberof module:clients/Robot/robot
 * @extends module:clients/client.Client
 */
class Robot extends Client{
/*	constructor(){
		super();
	}*/

	/**
	 * Creates an instance of Robot.
	 * 
	 * @param {String} robotName Identifiant réseau du robot
	 */
	constructor(robotName){
		// Requires
		super(robotName);

		this.robotName = robotName;

		this.logger.info("Started NodeJS client with pid " + process.pid);

		this.lastStatus = {
			"status": "starting"
		};
		this.sendChildren(this.lastStatus);

		var fifo = new Fifo();

		// ??? classe abstraite !
		// this.acts = new (require('../Extension/Actuators/actuator.class.js'))(this.client, this.sendChildren);

		//TODO replace devicedetected
		//this.detect = null; this.detect = new (require('./detect.class.js'))(devicesDetected);
					//ADD it tmp, to replace the previos one
					// var struct = {
					// 	others: false,
					// 	asserv: false,
					// 	ax12: false,
					// 	servos: false
					// };

					// this.devicesDetected(struct); //TODO Replace it


		this.queue = [];
		this.orderInProgress = false;

		this.client.order( function (from, name, params){
			this.logger.info("Received an order "+name);
			var OrderName = name.split('.');
			var classe = OrderName.shift();
			var OrderSubname = OrderName.join('.');

			if(classe == "asserv"){
				this.logger.info("order send to asserv : "+OrderSubname);
				this.asserv.addOrder2Queue(from,OrderSubname,params);
			}

			else if(classe == this.robotName){
				switch (name){
					case "collision":
						this.queue = [];
						//TODO DO it with new actuators
						//this.acts.clean();
						this.orderInProgress = false;
					break;
					case "stop":
						//TODO DO it with new actuators
						//this.acts.clean();
						this.logger.fatal("Stop " + this.robotName);
						process.exit();
					break;
					case "start":
						this.queue = [];
						this.start();
					break;
					default:
						this.addOrder2Queue(from, name, params);
				}
			}

			else {
				this.logger.fatal("this order can't be assigned : "+name)
			}
		}.bind(this));
	}


	/**
	 * Start the Robot
	 */
	start(){
		super.start();
		this.logger.info("Starting  :)");
		// add all starts

		// Tests devices and connect
		let testAsserv = new SerialPort("/dev/ttyACM0", {
			baudrate: 57600,
			parser:SerialPort.parsers.readline('\n')
		});
		testAsserv.on("error", function(data){ /* Do nothing */ });
		let asservReal = testAsserv.isOpen();
		testAsserv.close();

		if (asservReal) {
			// There's a match with the asserv Arduino ! Let's open a connection ;)
			this.asserv = new AsservReal( this.client, 'pr', this.fifo, this.sendStatus, 
				new SerialPort("/dev/ttyACM0", {
					baudrate: 57600,
					parser:SerialPort.parsers.readline('\n')
				})
			);
		} else {
			this.logger.fatal("Lancement de l'asserv pr en mode simu !");
			this.asserv = new AsservSimu(this.client, 'pr', this.fifo);
		}
	}

	/**
	 * Stops the robot
	 */
	stop(){
		// this.acts.quit();

		// Send struct to server
		this.sendChildren({
			status: "waiting",
			children:[]
		});

        super.stop();
	}

	/**
	 * Sends status to server
	 *
	 * @param {Object} status
	 */
	sendChildren(status){
		this.lastStatus = status;
		this.client.send("server", "server.childrenUpdate", this.lastStatus);
	}

	/**
	 * Looks if everything is Ok
	 */
	isOk(){
		if(lastStatus.status != "waiting")
			this.lastStatus = this.acts.getStatus();

		this.client.send("ia", "isOkAnswer", this.lastStatus);
		this.client.send("server", "server.childrenUpdate", this.lastStatus);
	}

	/**
	 * Push the order (enfiler)
	 *
	 * @param {string} f from
	 * @param {string} n name
	 * @param {Object} p parameters
	 */
	addOrder2Queue(f, n, p){
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

	// devicesDetected(struct){
	// // Verify content

	// if (!struct.others)
	// 	this.logger.warn("Missing others Mega");

	// if (!struct.servos)
	// 	this.logger.warn("Missing servos Nano");

	// if (!struct.asserv)
	// 	this.logger.warn("Missing asserv Nano");

	// if (!struct.ax12)
	// 	this.logger.warn("Missing USB2AX");

	// // Connect to what's detected
	// //TODO IMPLEMENT IT WITH ACTUATORS
	// //this.acts.connectTo(struct);
	// 				//HACK, do in acts normaly. See how integrate it
	// 				// if (!struct.asserv) {
	// 				// 			this.logger.fatal("Lancement de l'asserv pr en mode simu !");
	// 				// 			this.asserv = new AsservSimu(this.client, 'pr', this.fifo);
	// 				// 		} else {
	// 				// 			this.asserv = new AsservReal( this.client, 'pr', this.fifo, this.sendStatus, 
	// 				// 				new SerialPort("/dev/ttyACM0", {
	// 				// 					baudrate: 57600,
	// 				// 					parser:SerialPort.parsers.readline('\n')
	// 				// 				})
	// 				// 			);
	// 				// 		}

	// // Send struct to server
	// //TODO DO AFTER actuators done
	// //this.sendChildren(acts.getStatus());
	// //This une replace the acts.getStatus()
	// 		var data = {
	// 			"status": "",
	// 			"children": []
	// 		};

	// 		data.status = "everythingIsAwesome";
	// 		//Code of actuators.getStatus()
	// 				/*if(others && !!others.ready)
	// 					data.children.push("Arduino others");
	// 				else
	// 					data.status = "ok";

	// 				if(ax12 && !!ax12.ready)
	// 					data.children.push("USB2AX");
	// 				else
	// 					data.status = "ok";

	// 				if(asserv && !!asserv.ready)
	// 					data.children.push("Arduino asserv");
	// 				else
	// 					data.status = "error";
	// 			*/
	// 				//data.children.push("Arduino others");
	// 				//data.children.push("USB2AX");
	// 		data.status = "ok";
	// 		data.children.push("Arduino asserv");

	// 		this.sendChildren(data);

	// }
	
	executeNextOrder(){
		if ((this.queue.length > 0) && (!this.orderInProgress)) {
			var order = this.queue.shift();
			if(order.name == "send_message") {
				// logger.debug("Send message %s", order.params.name);
				this.client.send('ia', order.params.name, order.params || {});
				this.executeNextOrder();
			} else {
				this.orderInProgress = order.name;

				this.logger.info(this.orderInProgress+" : Begin , 	executeNextOrder");
				this.logger.debug(order.params);

				//TODO DECOMMENT IT AFTER acts done
				//this.acts.orderHandler(order.from, order.name, order.params, this.actionFinished);


			// Asserv HACK
			//var callback = this.actionFinished
				switch (order.name){
					case "sync_git":
						spawn('/root/sync_git.sh', [], {
							detached: true
						});
					break;
					default:
						this.actionFinished();
						this.executeNextOrder();
				}
			}
		}
	}

	/**
	 * Launch the next order
	 */
	actionFinished(){
		this.logger.info("actionFinished : " + this.orderInProgress);
		if(this.orderInProgress !== false) {
			this.logger.info(this.orderInProgress + " : End");

			this.orderInProgress = false;
			this.executeNextOrder();
		}
	}

	/**
	 * Sends Position
	 */
	sendPos() {
		this.client.send('ia', this.who+'.pos', this.asserv.sendPos());
	}
}

module.exports = Robot;
