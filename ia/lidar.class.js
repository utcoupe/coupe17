/**
 * Module de component lidar de l'IA
 *
 * @module ia/lidar
 */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('ia.lidar');
const EventEmitter = require('events');

const SILENCE_TIMEOUT = 500;					// ms

/**
 * Lidar mng de l'IA
 *
 * @class Lidar
 * @memberof module:ia/lidar
 */
class Lidar {

	constructor(ia, params) {
		class Events extends EventEmitter{}
		this.events = new Events();

		/** IA */
		this.ia = ia;
		// /** Our color */
		// this.color = params.color;
		/** We have */
		this.we_have_hats = params.we_have_hats;
		/** Number of hokuyo */
		this.nb_hokuyo = 0;
		/** Status of Lidar */
		this.lidar_status = "";
		/** Dernier timestamp où on a update (changé à la fin de l'update) */
		this.last_lidar_data = 0;
		/** */
		this.status_timer = null;

		this.emergencyStopped_silence = false;
		this.emergencyStopped_mayday = false;

		/** nb d'itération depuis laquelle on a perdu un robot */
		this.nb_lost = 0;

		logger.debug("TODO: hokuyo, adapt to LiDAR data");
		logger.debug("TODO: hokuyo, adapt to new robot inheritance");

		// Status loop
		this.updateStatus();
	}

	updateStatus() {
		clearTimeout(this.status_timer);

		let deltaT = this.ia.timer.get() - this.last_lidar_data;
		if (!this.emergencyStopped_silence && deltaT > SILENCE_TIMEOUT) {
			this.mayday("Haven't heard Lidar since " + deltaT + "ms");
			// Caution, will spam every 200ms !
		}

		if (this.emergencyStopped_silence && deltaT < SILENCE_TIMEOUT) {
			this.resume("Lidar node talks again");
		}

		this.status_timer = setTimeout( function(){
			this.updateStatus();
		}.bind(this), 200);
	}

	/**
	 * Starts the hokuyo
	 */
	start() {
		logger.info("Lidar AI component started, waiting for LiDAR node data...");
		// this.ia.client.send("hokuyo", "start", {color:this.params.color}); // must have been already done

		logger.debug("TODO: hokuyo, keep track of living hokuyos according to data coming from LiDAR");
		// timeout = setTimeout(function() {this.timedOut(); }.bind(this) , LOST_TIMEOUT*1000);
	};

	/**
	 * Stops the Hokuyo
	 */
	stop() {
		this.ia.client.send("hokuyo", "stop", {});
		clearTimeout(timeout);
	};

	mayday(reason){
		this.emergencyStopped_mayday = true;
		logger.warn("TODO Lidar: throw status using events");
		logger.error("Mayday called, the given reason is :");
		logger.error(reason);
		this.emit("emergencyStop", reason);
	}


	resume(reason){
		this.emergencyStopped_mayday = false;
		logger.warn("Reusme called, the given reason is :");
		logger.warn(reason);
		this.emit("endOfEmergencyStop", reason);
	}

	deleteOurRobots(spots){
		logger.debug("TODO: verify deleteOurRobots");
		
		var pr_dist = Infinity;
		var pr_i = -1;
		var gr_dist = Infinity;
		var gr_i = -1;

		// logger.debug("Pos PR");
		// logger.debug(this.ia.pr.pos);
		// logger.debug("Pos GR");
		// logger.debug(gr_pos_with_offset);

		var pr_temp_dist, gr_temp_dist;

		for (let i = 0; i < dots.length; i++) {
			pr_temp_dist = this.getDistance(dots[i], this.ia.pr.pos);
			gr_temp_dist = this.getDistance(dots[i], this.ia.gr.pos);
			// logger.debug("Pr le pt :");
			// logger.debug(dots[i]);
			// logger.debug(pr_temp_dist);
			// logger.debug(gr_temp_dist);

			// Find closest spot to each robot
			if ((pr_dist > pr_temp_dist) && (pr_temp_dist < this.ia.pr.size.d * PR_GR_COEF)){
				pr_dist = pr_temp_dist;
				pr_i = i;
			}

			if ((gr_dist > gr_temp_dist) && (gr_temp_dist < this.ia.gr.size.d * PR_GR_COEF)){
				gr_dist = gr_temp_dist;
				gr_i = i;
			}
		}
		
		if (pr_i != -1) {
			// logger.debug("Deleting PR:");
			// logger.debug(dots[pr_i]);
			// logger.debug(this.ia.pr.pos);

			// Remove PR spot from list of hokuyo spots
			dots.splice(pr_i,1);

			if (pr_i < gr_i) {
				gr_i = gr_i -1;
			}
		} else {
			logger.warn("On a pas trouvé le PR parmis les points de l'Hokuyo");
		}

		if (gr_i != -1) {
			// logger.debug("Deleting GR:");
			// logger.debug(dots[gr_i]);
			// logger.debug(gr_pos_with_offset);
			// logger.debug(this.getDistance(dots[gr_i], gr_pos_with_offset));

			// Remove GR spot from list of hokuyo spots
			dots.splice(gr_i,1);
		} else {
			logger.warn("On a pas trouvé le GR parmis les points de l'Hokuyo");
		}
		// logger.debug(dots);
	}

	onAllSpot(dots){
		var robots = dots.robotsSpots;

		if (this.we_have_hats) {
			robots = this.deleteOurRobots(robots);
		}

		this.ia.pr.detectCollision(robots);
		this.ia.gr.detectCollision(robots);
		
		logger.debug("TODO: check update last_lidar_data");
		this.last_lidar_data = this.ia.timer.get();

		// Status loop
		this.updateStatus();
	}

	onLidarStatus(params){
		/** Number of hokuyo */
		this.nb_hokuyo = params.nb;
		/** Status of Lidar */
		this.lidar_status = params.status;

		if (this.nb_hokuyo == 0
			|| (this.lidar_status != "ok"
				&& this.lidar_status != "everythingIsAwesome"))
		{
			var reason = "LiDAR status " + this.lidar_status + " with " + this.nb_hokuyo + " active hokuyo(s) doesn't allow us to continue";
			mayday(reason);
		}

		if (this.emergencyStopped_mayday
			&& this.nb_hokuyo > 0
			&& (this.lidar_status == "ok"
				|| this.lidar_status == "everythingIsAwesome")) {
			resume("Hokuyo(s) alive");
		}
	}

	/**
	 * Parse Order
	 * 
	 * @param {string} from
	 * @param {string} name
	 * @param {Object} params
	 */
	parseOrder(from, name, params) {
		switch (name){
			case "all":
				this.onAllSpot(params.dots);
				// this.updatePos(params.dots);
				break;
			case "status":
				this.onLidarStatus(params);
				// this.updateNumberOfRobots(params.nb);
				break;
			default:
				logger.warn("Message name " + name + " not understood");
		}
	};
}

module.exports = Lidar;