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
			this.logger = require('log4js').getLogger(robotName);

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

			this.acts = new (require('../Extension/Actuators/actuator.class.js'))(this.client, this.sendChildren);

			// new (require('./detect.class.js'))(devicesDetected);
			this.detect = null; //See what to do with this one

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

}

module.exports = Robot;
