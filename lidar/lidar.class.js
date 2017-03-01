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

	/**
	 * Lidar Constructor
	 * 
	 * @exports ia/Lidar.Lidar
	 * @constructor
	 * @param {Object} ia IA
	 * @param {Object} [params] Parameters
	 */
	function Lidar(send) {
		this.send = send;				// send function
		this.lastDataSent = Date.now();	// ms
		this.lastCartSpots = {};
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
	}

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
				hokuyos: this.hokuyosWorking(this.lastCartSpots),
				cartesianSpots: this.mergedSpots,
				robotsSpots: this.robotsSpots
			};

			// Send it to AI
			this.send("lidar.all", toBeSent);
		}
	};

	Lidar.prototype.hokuyosWorking = function(lastData) {
		var hokuyos = [];

		// For each active hokuyo, add hokuyo information to return value
		for (let hokName in lastData){
			if (Date.now() - lastData[hokName].time < 2 * DELTA_T) {
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

		for(let spot of cartSpots.one.spots) {
			ret.push( spot );
		}

		for(let spot of cartSpots.two.spots) {
			ret.push( spot );
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