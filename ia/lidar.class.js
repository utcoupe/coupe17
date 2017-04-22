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
		this.emergencyStopped_status = false;

		/** nb d'itération depuis laquelle on a perdu un robot */
		this.nb_lost = 0;

		logger.debug("TODO: hokuyo, adapt to LiDAR data");
	}

	updateStatus() {
		clearTimeout(this.status_timer);

		let deltaT = this.ia.timer.get() - this.last_lidar_data;
		if (!this.emergencyStopped_silence
			&& !this.emergencyStopped_status
			&& deltaT > SILENCE_TIMEOUT) {
			this.mayday("Haven't heard Lidar since " + deltaT + "ms");
			this.emergencyStopped_silence = true;
			// Caution, will spam every 200ms !
		}

		if (this.emergencyStopped_silence && deltaT < SILENCE_TIMEOUT) {
			this.resume("Lidar node talks again");
			this.emergencyStopped_silence = false;
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

		// Status loop
		this.updateStatus();
	};

	/**
	 * Stops the Hokuyo
	 */
	stop() {
		this.ia.client.send("hokuyo", "stop", {});
		clearTimeout(this.status_timer);
	};

	mayday(reason){
		this.emergencyStopped_status = true;
		logger.error("Mayday called, the given reason is :");
		logger.error(reason);
		this.events.emit("emergencyStop", reason);
	}


	resume(reason){
		logger.warn("Reusme called, the given reason is :");
		logger.warn(reason);
		this.events.emit("endOfEmergencyStop", reason);
	}

	getDistance (spot1, spot2) {
		return Math.sqrt(Math.pow(spot1.x - spot2.x, 2) + Math.pow(spot1.y - spot2.y, 2));
	};

	deleteOurRobots(spots){
		for(var i in spots) {
			if(this.getDistance( { x: spots[i][0], y:spots[i][1] }, this.ia.pr.pos) < this.ia.pr.size.d/2 ||
				this.getDistance( { x: spots[i][0], y:spots[i][1] }, this.ia.gr.pos) < this.ia.gr.size.d/2) {
				// logger.debug("Found one of our robots at [" + spots[i][0] + ", " + spots[i][1] + "]");
				spots.splice(i, 1);
			}
		}
		return spots;
	}

	/**
	* on data coming from Lidar node (old name : pr.updatePos())
	*/
	onAllSpot(robots){
		if (!this.ia.timer.match_started) {
			// logger.warn("We are receiving data but match hasn't started yet");
			return;
		}

		if (this.we_have_hats) {
			robots = this.deleteOurRobots(robots);
		}

		// Tell the robots about the ennemy pos, and let them react accordingly
		this.ia.pr.detectCollision(robots);
		this.ia.gr.detectCollision(robots);

		// Tell the robots about the ennemy pos, and let them react accordingly
		this.ia.pr.actions.killObjects(robots);
		this.ia.gr.actions.killObjects(robots);

		// Update data
		this.ia.data.dots = robots.map(function(val) {
			return {
				pos: {
					x: val[0],
					y: val[1],
				},
				d: 320
			}
		});
		if (robots.length > 0) {
			this.ia.data.erobot[0].pos= {
				x: robots[0][0],
				y: robots[0][1]
			};

			if (robots.length > 1) {
				this.ia.data.erobot[1].pos= {
					x: robots[1][0],
					y: robots[1][1]
				};
			};
		};
		
		// logger.debug("TODO: check update last_lidar_data");
		this.last_lidar_data = this.ia.timer.get();

		// Status loop
		this.updateStatus();
	}

	onLidarStatus(params){
		/** Number of hokuyo */
		this.nb_hokuyo = params.nb;
		/** Status of Lidar */
		this.lidar_status = params.status;

		if (this.ia.timer.match_started) {		
			if (!this.emergencyStopped_silence
				&&
					(this.nb_hokuyo <= 0
					|| (this.lidar_status != "ok"
						&& this.lidar_status != "everythingIsAwesome"))
				)
			{
				var reason = "LiDAR status " + this.lidar_status + " with " + this.nb_hokuyo + " active hokuyo(s) doesn't allow us to continue";
				this.mayday(reason);
				this.emergencyStopped_status = true;
			}

			if (this.emergencyStopped_status
				&& this.nb_hokuyo > 0
				&& (this.lidar_status == "ok"
					|| this.lidar_status == "everythingIsAwesome")) {
				this.resume("Hokuyo(s) alive");
				this.emergencyStopped_status = false;
			}
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
				this.onAllSpot(params.robotsSpots);
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