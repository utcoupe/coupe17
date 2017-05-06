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
			"status": "waiting"
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

	}

	/**
	 * Start the Robot
	 */
	start(){
		this.logger.info("Starting  :)");
		this.sendChildren({
			status: "starting",
			children:[]
		});
			//Hack, NOT LIKE THIS normally
			var struct = {
				others: false,
				asserv: false,
				ax12: false,
				servos: false
			};

			//MUST ADD IT
			this.devicesDetected(struct); //TODO Replace it by the following
			//this.detect = new (require('./detect.class.js'))(this.devicesDetected);

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

	devicesDetected(struct){
	// Verify content

	if (!struct.others)
		this.logger.warn("Missing others Mega");

	if (!struct.servos)
		this.logger.warn("Missing servos Nano");

	if (!struct.asserv)
		this.logger.warn("Missing asserv Nano");

	if (!struct.ax12)
		this.logger.warn("Missing USB2AX");

	// Connect to what's detected
	//TODO IMPLEMENT IT WITH ACTUATORS
	//this.acts.connectTo(struct);
					//HACK, do in acts normaly. See how integrate it
					if (!struct.asserv) {
								this.logger.fatal("Lancement de l'asserv pr en mode simu !");
								this.asserv = new AsservSimu(this.client, 'pr', this.fifo);
							} else {
								this.asserv = new AsservReal(
									new SerialPort(struct.asserv, {
										baudrate: 57600,
										parser:SerialPort.parsers.readline('\n')
									}), this.client, 'pr', this.sendStatus, this.fifo
								);
							}

	// Send struct to server
	//TODO DO AFTER actuators done
	//this.sendChildren(acts.getStatus());
	//This une replace the acts.getStatus()
			var data = {
				"status": "",
				"children": []
			};

			data.status = "everythingIsAwesome";
			//Code of actuators.getStatus()
					/*if(others && !!others.ready)
						data.children.push("Arduino others");
					else
						data.status = "ok";

					if(ax12 && !!ax12.ready)
						data.children.push("USB2AX");
					else
						data.status = "ok";

					if(asserv && !!asserv.ready)
						data.children.push("Arduino asserv");
					else
						data.status = "error";
				*/
					//data.children.push("Arduino others");
					//data.children.push("USB2AX");
			data.status = "ok";
			data.children.push("Arduino asserv");

			this.sendChildren(data);

	}
	
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
					case "pwm":
						this.asserv.pwm(order.params.left, order.params.right, order.params.ms, this.actionFinished());
					break;
					case "setvit":
						this.asserv.setVitesse(order.params.v, order.params.r, this.actionFinished());
					break;
					case "clean":
						this.asserv.clean(this.actionFinished());
					break;
					case "goa":
						this.asserv.goa(order.params.a, this.actionFinished(), true);
					break;
					case "goxy":
						this.asserv.goxy(order.params.x, order.params.y, order.params.sens, this.actionFinished(), true);
					break;
					case "setpos":
						this.asserv.setPos(order.params, this.actionFinished());
					break;
					case "setacc":
						this.asserv.setAcc(order.params.acc, this.actionFinished());
					break;
					case "setpid":
						this.asserv.setPid(order.params.p, order.params.i, order.params.d, this.actionFinished());
					break;
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
