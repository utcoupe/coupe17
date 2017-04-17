/**
 * IA Module
 * 
 * @module ia/ia
 * @requires module:server/socket_client
 * @requires module:config
 * @requires module:ia/timer
 * @requires module:ia/pathfinding
 * @requires module:ia/data
 * @requires module:ia/actions
 * @requires module:ia/gr
 * @requires module:ia/pr
 * @requires module:ia/export_simulator
 * @requires module:ia/lidar
 * @see {@link ia/ia.Ia}
 */

module.exports = (function () {
	"use strict";
	const log4js = require('log4js');
	const logger = log4js.getLogger('ia.ia'); 
	const EventEmitter = require('events');
	var log_counter = 0;

	/**
	 * Return the distance between two positions
	 * 
	 * @param {int} Ax
	 * @param {int} Ay
	 * @param {int} Bx
	 * @param {int} By
	 */
	function norm(Ax, Ay, Bx, By) {
		return Math.sqrt(Math.pow(Ax-Bx, 2) + Math.pow(Ay-By, 2));
	}

	/**
	 * Constructor of Ia
	 * 
	 * @exports ia/ia.Ia
	 * @constructor
	 * @param {string} color=blue
	 * @param {int} nb_erobots=2 Number of robots in a team
	 * @param EGR_d EGR diameter
	 * @param EGPR_d EPR diameter
	 */
	function Ia(color, we_have_hats/*, nb_erobots, EGR_d, EPR_d*/) {
		if(color === null) {
			logger.error('Please give a color to ia');
		}

		if(we_have_hats === null) {
			logger.error('Please say true if we have something on our robots detectable by the lidars');
		}

		// if(!nb_erobots) {
		// 	logger.error('Please give the number of ennemis robots');
		// }
		// if(!EGR_d) {
		// 	logger.error('Please give the EGR diameter');
		// }
		// if(!EPR_d) {
		// 	logger.error('Please give the EPR diameter');
		// }

		/**
		 * Color of the IA team
		 */
		this.color = color || "blue";


		/**
		 * Do we have something on the robots ?
		 */
		// logger.debug(typeof we_have_hats);
		this.we_have_hats = we_have_hats || false;

		/**
		 * Number of robots controlled by the IA
		 */
		// this.nb_erobots = nb_erobots || 2;
		logger.info("Launching a "+this.color+" AI considering that we " + (this.we_have_hats ? "DO" : "DON'T") + " have something on our robots"/*"" with "+this.nb_erobots+" ennemies."*/);
		
		/** Socket client */
		this.client = new (require('../server/socket_client.class.js'))({type: 'ia', server_ip: require('../config.js').server });
		/** Timer */
		this.timer = new (require('./timer.class.js'))(this);
		/** Pathfinding */
		this.pathfinding = new (require('./pathfinding.class.js'))(this);
		/** Data */
		this.data = new (require('./data.class.js'))(this/*, this.nb_erobots, EGR_d, EPR_d*/);
		// /** Actions */ // now instantiated in robot IA components
		// this.actions = new (require('./actions.class.js'))(this);
		this.actions = require('./actions.class.js');
		/** Grand robot */
		this.gr = new (require('./gr.class.js'))(this, this.color);
		/** Petit robot */
		this.pr = new (require('./pr.class.js'))(this, this.color);

		this.lidar = new (require('./lidar.class.js'))(this, {
			color: this.color,
			/*
			nb_erobots: parseInt(this.nb_erobots),
			*/
			we_have_hats: this.we_have_hats
		});
		this.lidar.events.on("error", (err) => {
			logger.error("Error in Lidar:");
			logger.error(err);
		})
		this.lidar.events.on("emergencyStop", (reason) => {
			logger.error("Emergency Stop by Lidar");
			this.pr.pause();
			this.gr.pause();
		})
		this.lidar.events.on("endOfEmergencyStop", (reason) => {
			logger.warn("End Emergency Stop by Lidar");
			this.pr.resume();
			this.gr.resume();
		})

		/** Export simulator */
		this.export_simulator = new (require('./export_simulator.class.js'))(this);

		this.client.send("server", "server.iaParams", {
			color: this.color,
			we_have_hats: this.we_have_hats
		});

		this.client.order(function(from, name, params) {
			var orderName = name.split('.');
			var classe = orderName.shift();
			var orderSubname = orderName.join('.');

			if(classe == 'ia') {
				switch(name) {
					case 'ia.jack':
						this.jack();
					break;
					case 'ia.stop':
						this.stop();
					break;
					case 'ia.hok':
					logger.debug("TODO ia : change for new lidar interface");
						if ((log_counter++ % 15) == 0) {
							logger.debug(params);
						}
						this.pr.updatePos(params);
					break;
					case 'ia.hokfailed':
						logger.debug("TODO ia : change for new lidar interface");
						logger.fatal("lidar NOT WORKING, UNPLUG AND REPLUG USB");
						this.pr.updatePos(params);
					break;
					default:
						logger.warn("Ordre pour l'ia inconnu : "+name);
				}
			} else if(!!this[classe]) {
				// logger.debug("Order to class: "+classe);
				if(!this[classe].parseOrder) {
					logger.warn("Warning, no parseOrder function in ia."+classe);
				} else {
					this[classe].parseOrder(from, orderSubname, params);
				}
			} else {
				logger.warn("IA component "+classe+" unknown");
			}
		}.bind(this));
	}

	/**
	 * Unjack action
	 * 
	 * Starts the robots
	 */
	Ia.prototype.jack = function() {
		if(!this.timer.match_started) {
			logger.info("Démarrage du match");
			this.timer.start();
			this.pr.start();
			this.gr.start();
			this.lidar.start();
		} else {
			logger.warn("Match déjà lancé");
		}
	};

	/**
	 * Stop the robots and stop the programm
	 */
	Ia.prototype.stop = function() {
		logger.fatal('Stop IA');
		this.gr.funnyAction();
		this.gr.stop();
		this.pr.stop();
		this.lidar.stop();
		setTimeout(process.exit, 1000);
	};

	return Ia;
})();
