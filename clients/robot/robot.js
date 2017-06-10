/**
 * Module du robot de base
 *
 * @module clients/Robot/robot
 * @requires module:clients/shared/client
 * @requires module:clients/fifo
 * @requires module:clients/Asserv/AsservSimu
 * @requires module:clients/Asserv/AsservReal
 */

"use strict";

const Client = require('../shared/client');

/**
 * Robot abstrait
 *
 * @memberof module:clients/Robot/robot
 * @extends module:clients/shared/client.Client
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
		this.logger.info("Launched robot client with pid " + process.pid);
		this.lastStatus = {
			"status": "starting"
		};
		this.sendChildren(this.lastStatus);
		this.queue = [];
		this.started = false;
        // Flag to know that factory has been created and wait it returns
        this.starting = false;
		this.orderInProgress = false;

		this.client.order( function (from, name, params){
			// this.logger.info("Received an order "+name);
			var OrderName = name.split('.');
			var classe = OrderName.shift();
			var OrderSubname = OrderName.join('.');

			if(classe == "asserv"){
				// this.logger.error("order send to asserv : "+OrderSubname);
				if (!!this.asserv) {
					this.asserv.addOrderToFifo(OrderSubname,params);
				} else {
					this.logger.error("Asserv not initialized");
				}
			} else {
				switch (name){
					case "start":
						this.start();
					break;
					case "collision":
						this.queue = [];
						//TODO DO it with new actuators
						//this.acts.clean();
						this.orderInProgress = false;
					break;
					case "do_start_sequence":
						this.asserv.doStartSequence(params);
					break;
                    case "pause":
                        this.logger.fatal("Pause has not been implemented yet");
                        this.asserv.addOrderToFifo(OrderSubname,params);
                    case "resume":
                        this.logger.fatal("Resume has not been implemented yet");
                        this.asserv.addOrderToFifo(OrderSubname,params);
					case "stop":
						//TODO DO it with new actuators
						//this.acts.clean();
						this.logger.fatal("Stop " + this.robotName);
						this.stop();
					break;
					case "kill":
						this.kill();
						break;
					default:
						this.addOrder2Queue(from, name, params);
						// this.logger.fatal("this order can't be assigned : "+name);
				}
			}
		}.bind(this));
	}

	getName() {
        return this.robotName;
    }

	/**
	 * Start the Robot
	 */
	start() {
		if (this.started || this.starting) {
			this.logger.warn(this.robotName + " already started !");
			return;
		}
        this.logger.info("Starting "+ this.robotName +"  :)");
        // Send struct to server
        this.sendChildren({
            status: "starting",
            children:[]
        });
        super.start();
        this.starting = true;
        this.factory = require("../shared/factory.js")(this, function() {
            this.asserv = this.factory.createObject("asserv");
            this.queue = [];
            // Connect to devices
            this.openExtensions();
            // Send struct to server
            this.sendChildren({
                status: "ok", // TODO : make it everything is awesome
                children:[]
            });
            this.started = true;
            this.logger.info(this.robotName + " has started !");
        }.bind(this));
	}

	/**
	 * Stops the robot
	 */
	stop() {
		// Send struct to server
		this.sendChildren({
			status: "waiting",
			children:[]
		});
		if (!!this.asserv) {
			this.asserv.stop();
		}
        this.closeExtensions();
        super.stop();
		this.started = false;
		this.starting = false;
	}

    openExtensions () {
        this.logger.fatal("This function openExtensions must be overriden");
    }

    closeExtensions () {
        this.logger.fatal("This function openExtensions must be overriden");
    }

	/**
	 * Tries to exit
	 *
	 */
	kill () {
		this.logger.info("Please wait while exiting...");
		this.closeExtensions();
		process.exit();
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
			this.executeNextOrder();
		}
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
				this.logger.info("Executing " + this.orderInProgress);
				this.logger.debug(order.params);
				switch (order.name){
					case "sync_git":
						// spawn('/root/sync_git.sh', [], {
						// 	detached: true
						// });
					    break;
                    case "climb_seesaw":
                        this.climbSeesaw(() => {
                        	this.logger.debug("Seesaw climbed !");
                            this.actionFinished();
                        });
                        break;
					default:
						this.logger.warn("Unknown order for "+ this.robotName +" : " + order.name);
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
		if(this.orderInProgress !== false) {
			this.logger.info("Finished " + this.orderInProgress);

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

	posArduinoToIa(x, y, a) {}

	posIaToArduino(pos) {}

	sendDataToIA(destination, params) {
        this.client.send('ia', destination, params);
    }

    climbSeesaw(callback) {}
}

module.exports = Robot;
