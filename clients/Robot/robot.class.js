/**
 * Module du robot de base
 *
 * @module clients/Robot/robot
 * @requires module:clients/client
 */

"use strict";

const Client = require('../client.class.js');

/**
 * Robot abstrait
 *
 * @class Robot
 * @memberof module:clients/Robot/robot
 * @extends {clients/client.Client}
 */


//TODO Look if use other.class and other_simu
//And define_parser
//Par défault objet simulé, toujours simulé. Voir pour detect

class Robot extends Client{
/*	constructor(){
		super();
	}*/

	constructor(robotName){
		// Requires
		super();

		if (robotName )
		{
			this.logger = this.Log4js.getLogger(robotName);

			this.logger.info("Started NodeJS client with pid " + process.pid);

			var SocketClient = require('../../server/socket_client.class.js');
			var server = require('../../config.js').server;

			this.client = new SocketClient({
				server_ip: server,
				type: robotName
			});

			this.robotName = robotName;

			this.lastStatus = {
				"status": "waiting"
			};
			this.sendChildren(this.lastStatus);

			var fifo = new (require('../fifo.class.js'))();

			this.acts = new (require('../Extension/Actuators/actuator.class.js'))(this.client, this.sendChildren);

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
		this.acts.quit();

		// Send struct to server
		this.sendChildren({
			status: "waiting",
			children:[]
		});
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
								this.asserv = new (require('../Asserv/AsservSimu.class.js'))(this.client, 'pr', this.fifo);
							} else {
								this.asserv = new (require('../Asserv/AsservReal.class.js'))(
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

	/**
	 * Sends Position
	 */
	sendPos() {
		this.client.send('ia', this.who+'.pos', this.asserv.sendPos());
	}
}

module.exports = Robot;
