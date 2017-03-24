/**
 * Lidar module
 * 
 * @module ia/Lidar
 * @see ia/Lidar.Lidar
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	// var gaussian = require('gaussian');
	var logger = log4js.getLogger('lidar.lidar');

	var DELTA_T = 100; 					// ms between two data shipping
	var DELTA_T_CHECK = 200; 			// ms between two data shipping

	/**
	 * Lidar Constructor
	 * 
	 * @exports ia/Lidar.Lidar
	 * @constructor
	 * @param {Object} ia IA
	 * @param {Object} [params] Parameters
	 */
	function Lidar(send, sendStatus) {
		this.send = send;				// send function
		this.lastDataSent = Date.now();	// ms
		this.lastCartSpots = {};
		this.color = undefined;
		this.started = false;			// we have a color, but we may not be connected to the hokuyos
		this.status = "starting";
		this.sendStatus = sendStatus;
		this.statusTimer;

		this.lastSignOfLife = {};		// of each hokuyo

		this.hokuyoPositions = {
			one: {
	 			"x": -6.2,
	 			"y": -6.2,
	 			"w": 0
	 		},
			two: {
	 			"x": 306.2,
	 			"y": 100,
	 			"w": 180
	 		}
		}

		// If other color
		logger.warn("TODO: change Lidar color depending ours");

		this.sendStatus(this.status);


		// Status loop
		this.updateStatus();
	}

	Lidar.prototype.updateStatus = function() {
		clearTimeout(this.statusTimer);

		var newStatus = "";		// by default, change nothing

		// We juste started the module
		if (/* Object.keys(this.lastSignOfLife).length == 0
			&& */ this.status == "starting") {
			newStatus = "waiting";
		} else if (this.status == "waiting") {
			// Do nothing
		} else {
			let hokuyoCount = this.hokuyosWorking().length;
			// console.log("Count = " + hokuyoCount);
			// console.log("Old status = ");
			// console.log(this.status);
			switch (hokuyoCount) {
				case 0:
					newStatus = "error";
				break;
				case 1:
					newStatus = "ok";
				break;
				case 2:
					newStatus = "everythingIsAwesome";
				break;
				default:
					newStatus = "error";
				break;
			}
		}

		if (newStatus != "" && newStatus != this.status) {
			this.changeStatus(newStatus);
		}

		this.statusTimer = setTimeout( function(){
			this.updateStatus();
		}.bind(this), 200);
	};

	Lidar.prototype.changeStatus = function(newStatus) {
		logger.info("New status : " + newStatus);
		this.status = newStatus;
		this.sendStatus(this.status);
	};

	Lidar.prototype.start = function(color) {
		this.color = color;
		this.started = true;
		this.changeStatus("error");		// as far as we do not receive hokuyo data
	};

	Lidar.prototype.stop = function() {
		this.color = undefined;
		this.started = false;
		this.changeStatus("waiting");
	};

	/**
	 * When Hokuyo data arrives
	 */
	Lidar.prototype.onHokuyoPolar = function (hokuyoName, polarSpots) {

		// Filter
		let filteredPolar = this.filterPolar(polarSpots);

		// Polar to cartesian
		let cartesianSpots = this.toCartesian(hokuyoName, filteredPolar);

		// Save
		this.lastCartSpots[hokuyoName] = {};
		this.lastCartSpots[hokuyoName].isWorking = function() { return Date.now() - this.time <  2 * DELTA_T; }; // we had some data no long ago
		this.lastCartSpots[hokuyoName].time = Date.now();
		this.lastCartSpots[hokuyoName].spots = cartesianSpots;

		// If we reached the DELTAT, send newly merged data
		// console.log(Date.now() - this.lastDataSent);
		if (Date.now() - this.lastDataSent > DELTA_T) {
			// Merge spots
			this.mergedSpots = this.mergeSpots(this.lastCartSpots);

			// Filter (bis)
			this.mergedSpots = this.filterCart(this.mergedSpots);

			// Find enemy robots
			this.robotsSpots = this.findRobots(this.mergedSpots);

			// Prepare data
			let toBeSent = {
				hokuyos: this.hokuyosWorking(),
				cartesianSpots: this.mergedSpots,
				robotsSpots: this.robotsSpots
			};

			// Send it to AI
			this.send("lidar.all", toBeSent);
			this.lastDataSent = Date.now();
		}

		this.updateStatus();
	};

	Lidar.prototype.hokuyosWorking = function() {
		let lastData = this.lastCartSpots;
		var hokuyos = [];

		// For each active hokuyo, add hokuyo information to return value
		for (let hokName in lastData){
			// logger.debug(Date.now() - lastData[hokName].time + " -> " + ((Date.now() - lastData[hokName].time < 2 * DELTA_T)?"ok":"not ok"));
			if (lastData[hokName].isWorking) {
				hokuyos.push({
					"name": hokName,
					"position": this.hokuyoPositions[hokName]
				});
			}
		}

		return hokuyos;
	};

	Lidar.prototype.filterPolar = function(polarSpots) {
		let ret;

		logger.warn("TODO: filterPolar");
		ret = polarSpots; // TMP

		return ret;
	};

	Lidar.prototype.toCartesian = function(hokName, polarSpots) {
		let ret = [];
		let hokPos = this.hokuyoPositions[hokName];

		// For each point, transform it to the table frame
		for(let pt of polarSpots){
			// Get the polar pt (angle, dist) in the hokuyo cartesian frame (xh, yh)
			// x is the forward axe
			// y is the RIGHT axe looking from the top
			// ie : the hokuyo on the back left hand corner, oriented to 0, has the same frame as the table translated a little
			// thus, hokuyo positive angles are at its right hand
			let cartPt = [
				pt[1] * Math.cos(this.toRadian(pt[0])),
				pt[1] * Math.sin(this.toRadian(pt[0]))
			]

			// Change to table frame
			ret.push([
				hokPos.x + cartPt[0] * Math.cos(this.toRadian(hokPos.w)) + cartPt[1] * Math.sin(this.toRadian(hokPos.w)),
				hokPos.y + cartPt[0] * Math.sin(this.toRadian(hokPos.w)) + cartPt[1] * Math.cos(this.toRadian(hokPos.w))
			]);
		}

		return ret;
	};

	Lidar.prototype.filterCart = function(cartSpots) {
		let ret = [];

		function isInTable (p) {
			var ret = p[0] > 0
				&& p[0] < 300
				&& p[1] > 0
				&& p[1] < 200;
			return ret;
		}

		// Keep only points in the table
		for(let pt of cartSpots){
			if (isInTable(pt)) {
				ret.push(pt);
			}
		}

		return ret;
	};

	Lidar.prototype.mergeSpots = function(cartSpots) {
		let ret = [];
		let workingHokuyos = this.hokuyosWorking();

		logger.warn("TODO: take half of the points");
		logger.warn("TODO: check that cartSpots[workingHokuyos[0].name].spots works");

		if (workingHokuyos.length == 2) {
			for(let spot of cartSpots.one.spots) {
				ret.push( spot );
			}

			for(let spot of cartSpots.two.spots) {
				ret.push( spot );
			}
		} else if (workingHokuyos.length == 1) {
			for(let spot of cartSpots[workingHokuyos[0].name].spots) {
				ret.push( spot );
			}
		} else if (workingHokuyos.length == 0) {
			logger.warn("Trying to merge point without active hokuyo");
		}

		return ret;
	};

	Lidar.prototype.findRobots = function(cartSpots) {
		let ret;

		logger.warn("TODO: findRobots");
		ret = [
			[ 150, 100 ],
			[ 100, 135 ]
		]; // TMP

		return ret;
	};

	Lidar.prototype.toRadian = function(angleInDegree) {
		let angleInRadian;

		angleInRadian = angleInDegree * Math.PI / 180;

		return angleInRadian;
	};

	Lidar.prototype.toDegree = function(angleInRadian) {
		let angleInDegree;

		angleInDegree = angleInRadian * 180 / Math.PI;

		return angleInDegree;
	};

	return Lidar;
})();