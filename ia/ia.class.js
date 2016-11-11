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
 * @see {@link ia/ia.Ia}
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia'); 
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
	 * @param {string} color=yellow
	 * @param {int} nb_erobots=2 Number of robots in a team
	 * @param EGR_d EGR diameter
	 * @param EGPR_d EPR diameter
	 */
	function Ia(color, nb_erobots, EGR_d, EPR_d) {
		var we_have_hats = true;
		if(!color) {
			logger.error('Please give a color to ia');
		}
		if(!nb_erobots) {
			logger.error('Please give the number of ennemis robots');
		}
		if(!we_have_hats) {
			logger.error('Please say true if we have something on our robots detectable by the Hokuyos');
		}
		if(!EGR_d) {
			logger.error('Please give the EGR diameter');
		}
		if(!EPR_d) {
			logger.error('Please give the EPR diameter');
		}
		/**
		 * Color of the IA team
		 */
		this.color = color || "yellow";
		/**
		 * Number of robots controlled by the IA
		 */
		this.nb_erobots = nb_erobots || 2;
		logger.info("Launching a "+this.color+" AI with "+this.nb_erobots+" ennemies.");
		
		/** Socket client */
		this.client = new (require('../server/socket_client.class.js'))({type: 'ia', server_ip: require('../config.js').server });
		/** Timer */
		this.timer = new (require('./timer.class.js'))(this);
		/** Pathfinding */
		this.pathfinding = new (require('./pathfinding.class.js'))(this);
		/** Data */
		this.data = new (require('./data.class.js'))(this, this.nb_erobots, EGR_d, EPR_d);
		/** Actions */
		this.actions = new (require('./actions.class.js'))(this);
		/** Grand robot */
		this.gr = new (require('./gr.class.js'))(this, this.color);
		/** Petit robot */
		this.pr = new (require('./pr.class.js'))(this, this.color);
		// this.hokuyo = new (require('./hokuyo.class.js'))(this, {
		// 	color: this.color,
		// 	nb_erobots: parseInt(this.nb_erobots),
		// 	we_have_hats: (we_have_hats === "true")
		// });
		/** Export simulator */
		this.export_simulator = new (require('./export_simulator.class.js'))(this);

		this.client.send("server", "server.iaColor", {color: this.color});

		this.client.order(function(from, name, params) {
			var classe = name.split('.')[0];
				// logger.debug(this[classe]);
			if(classe == 'ia') {
				switch(name) {
					case 'ia.jack':
						this.jack();
					break;
					case 'ia.stop':
						this.stop();
					break;
					case 'ia.hok':
						if ((log_counter++ % 15) == 0) {
							logger.debug(params);
						}
						this.pr.updatePos(params);
					break;
					case 'ia.hokfailed':
						 logger.fatal("HOKUYO NOT WORKING, UNPLUG AND REPLUG USB");
						this.pr.updatePos(params);
					break;
					default:
						logger.warn("Ordre pour l'ia inconnu : "+name);
				}
			} else if(!!this[classe]) {
				// logger.debug("Order to class: "+classe);
				if(!this[classe].parseOrder) {
					logger.warn("Attention, pas de fonction parseOrder dans ia."+classe);
				} else {
					this[classe].parseOrder(from, name, params);
				}
			} else {
				logger.warn("Sous client inconnu: "+classe);
			}
		}.bind(this));

		// temp //
		// this.gr.start();
		// this.jack();
		//////////
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
			setTimeout(function() {
				this.gr.start();
			}.bind(this), 10000);
			this.pr.start();
			// this.hokuyo.start();
		} else {
			logger.warn("Match déjà lancé");
		}
	};

	/**
	 * Stop the robots and stop the programm
	 */
	Ia.prototype.stop = function() {
		logger.fatal('Stop IA');
		this.gr.stop();
		this.pr.stop();
		// this.hokuyo.stop();
		setTimeout(process.exit, 1000);
	};

	return Ia;
})();
