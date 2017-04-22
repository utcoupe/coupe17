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
	var X_MAX_ZONE = 295;
	var X_MIN_ZONE = 0;
	var Y_MAX_ZONE = 195;
	var Y_MIN_ZONE = 0;
	var CLUSTER_DISTANCE = 5;
	var CLUSTER_K = 6;
	// var SILENCE_TIMEOUT = 300;

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
	 			"x": -4, //-6.2
	 			"y": -4,	//-6.2
	 			"w": 0 ,	//0
				"decalage" : [],
				"init" : 3
	 		},
			two: {
	 			"x": 304, //306.2
	 			"y": 100,	//100
	 			"w": 180 ,	//180
				"decalage" : [],
				"init" : 0
	 		}
		}
		this.rocketPositions = {
			one : {
				"x" : 185,
				"y" : 4
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
		}.bind(this), 2*DELTA_T /*SILENCE_TIMEOUT*/);
	};

	Lidar.prototype.changeStatus = function(newStatus) {
		logger.info("New lidar status : " + newStatus);
		this.status = newStatus;
		this.sendStatus(this.status);
	};

	Lidar.prototype.start = function(color) {
		this.color = color;
		this.started = true;
		this.changeStatus("error");		// as far as we do not receive hokuyo data
		logger.info("Started as " + this.color);
	};

	Lidar.prototype.stop = function() {
		this.color = undefined;
		this.started = false;
		this.changeStatus("waiting");
	};

	function Spot(angle, distance){
		this.angle = angle;
		this.distance = distance;
		this.inTheTable = false;
	}
	Spot.prototype.toCartesian = function(lidar, hokName) {
		let ret = [];
		let hokPos = lidar.hokuyoPositions[hokName];

		// For each point, transform it to the table frame
			// Get the polar pt (angle, dist) in the hokuyo cartesian frame (xh, yh)
			// x is the forward axe
			// y is the RIGHT axe looking from the top
			// ie : the hokuyo on the back left hand corner, oriented to 0, has the same frame as the table translated a little
			// thus, hokuyo positive angles are at its left hand
			let cartPt = [
				this.distance * Math.cos(lidar.toRadian(-this.angle)),
				this.distance * Math.sin(lidar.toRadian(-this.angle))
			]
			// Change to table frame
			this.x = hokPos.x + cartPt[0] * Math.cos(lidar.toRadian(hokPos.w)) + cartPt[1] * Math.sin(lidar.toRadian(hokPos.w)),
			this.y = hokPos.y + cartPt[0] * Math.sin(lidar.toRadian(hokPos.w)) + cartPt[1] * Math.cos(lidar.toRadian(hokPos.w))

	}

	function Cluster(){
		this.spots = [];
	}
	Cluster.prototype.calculCenter = function() {
		let x = 0.0, y =0.0;
		let nb = this.spots.length;
		for(let i = 0; i < nb ; i++){
			x = x + this.spots[i].x;
			y = y + this.spots[i].y;
		}
		this.x = x/nb;
		this.y = y/nb;

	}
	Cluster.prototype.diagBox = function() {
		let Xmax = 0, Ymax = 0, Xmin = 10000, Ymin = 10000, x, y;
		for(let i = 0 ; i < this.spots.length; i++){
			x = this.spots[i].x;
			y = this.spots[i].y;
			if (Xmax < x ) Xmax = x;
			if (Xmin > x) Xmin = x;
			if (Ymax < x ) Ymax = y;
			if (Ymin > x) Ymin = y;
		}
		x = Xmax - Xmin;
		y = Ymax - Ymin;
		let d = Math.sqrt(x*x +y*y);
		this.diag = d ;
	}
	Cluster.prototype.toCartesian = function(lidar, hokName) {
		let ret = [];
		let hokPos = lidar.hokuyoPositions[hokName];
			let cartPt = [
				this.distance * Math.cos(lidar.toRadian(-this.angle)),
				this.distance * Math.sin(lidar.toRadian(-this.angle))
			]
			// Change to table frame
			this.x = hokPos.x + cartPt[0] * Math.cos(lidar.toRadian(hokPos.w)) + cartPt[1] * Math.sin(lidar.toRadian(hokPos.w)),
			this.y = hokPos.y + cartPt[0] * Math.sin(lidar.toRadian(hokPos.w)) + cartPt[1] * Math.cos(lidar.toRadian(hokPos.w))

	}
	/**
	 * When Hokuyo data arrives
	 */
	Lidar.prototype.onHokuyoPolar = function (hokuyoName, polarSpots) {
		//logger.warn("nb points :" + polarSpots.length)
		let spots = this.createSpot(polarSpots);
		this.toCartesian(hokuyoName, spots);

		if (this.hokuyoPositions[hokuyoName].init != 0){
			this.calibration(spots, hokuyoName)
		}
		// Save

		this.lastCartSpots[hokuyoName] = {};
		this.lastCartSpots[hokuyoName].isWorking = function() { return Date.now() - this.time <  2 * DELTA_T; }; // we had some data no long ago
		this.lastCartSpots[hokuyoName].time = Date.now();
		this.lastCartSpots[hokuyoName].filteredSpots = spots;


		// If we reached the DELTAT, send newly merged data
		//console.log(Date.now() - this.lastDataSent);
		if (Date.now() - this.lastDataSent > DELTA_T) {

			// Merge spots
			//logger.warn(this.lastCartSpots)
			this.mergedSpots = this.mergeSpots(this.lastCartSpots);
			//logger.warn(this.mergedSpots);
			/* Merge very close clusters provided by two different hokuyo */

			//this.toCartesian(hokuyoName, this.mergedSpots);
			// Filter (bis)
			this.mergedFilterSpots = this.filterCart(this.mergedSpots);
			// Find enemy robots
			this.robotsSpots = this.findRobots(this.mergedFilterSpots);
			this.displaySpots = this.prepareData(this.mergedSpots); //renvoie un tableau de coordonnées prêt à être affiché

			// Prepare data
			let toBeSent = {
				hokuyos: this.hokuyosWorking(),
				cartesianSpots: this.displaySpots,
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
			if (lastData[hokName].isWorking()) {
				hokuyos.push({
					"name": hokName,
					"position": this.hokuyoPositions[hokName]
				});
			}
		}

		return hokuyos;
	};
	Lidar.prototype.createSpot = function(polarSpots){
		let ret = [];
		for(let i = 0; i < polarSpots.length ; i ++){
			var point = new Spot(polarSpots[i][0], polarSpots[i][1]);
			ret.push(point);
		}
		return ret;
	};

	Lidar.prototype.clusterize = function(spotsIn) {
		/*****
        classe les points en cluster en fonction des parametres k et D
            D : distance maximale entre deux points d'un même cluster
            k : la distance est calculée entre le point i et les k points précédents
        *****/
			var clusters = [], k = CLUSTER_K;
			if(spotsIn.length < k){
				return clusters;
			}
            var g = 0, D = CLUSTER_DISTANCE;
            var G = []; //le point Spot[i] appartient au groupe G[i]
			var d=[];

            var jmin, dmin, x, y
			clusters[0] = new Cluster;
			clusters[0].spots = new Array;
			/* A modifier !!
			On met les k premiers points dans un même cluster
			*/

			let nulSpot = new Spot;
			nulSpot.angle = 0; nulSpot.distance = 0;nulSpot.x = 0; nulSpot.y = 0;

            for (i = 0; i < k; i++){
				spotsIn.unshift(nulSpot);
                G.push(0);
				clusters[0].spots.push(spotsIn[i]);
            }
            for (var i = k; i < spotsIn.length; i++){
				G.push(0);
                if (spotsIn[i].distance > 1){
                     jmin = 1;
                     dmin = 0;
                    for (var j = 1; j <= k; j++){
                        x = spotsIn[i].x - spotsIn[i - j].x;
                        y = spotsIn[i].y - spotsIn[i - j].y ;
                        d[j] =Math.sqrt(x*x + y*y);
                        if (d[j] <= d[jmin]){
                            dmin = d[j];
                            jmin = j;
                        }
                    }

                    if (dmin < D) {
                        if (G[i - jmin] == 0){
                            g = g + 1;
                            G[i - jmin] = g;

							clusters[g] = new Cluster;
							clusters[g].spots = new Array;
                        }

                        g = G[i - jmin];
                        G[i] = g;
						clusters[g].spots.push(spotsIn[i]) ;
                    }
				}
            }
			for (i = 0; i < k; i++){
				spotsIn.shift();
            }
			clusters.shift();
			return clusters;
	};

	Lidar.prototype.toCartesian = function(hokName, spots) {
		let hokPos = this.hokuyoPositions[hokName];

		// For each point, transform it to the table frame
		for(let i = 0; i < spots.length ; i++){
			spots[i].toCartesian(this,hokName);
		}

	};

	Lidar.prototype.filterCart = function(cartSpots) {
		let ret = [];
		// Keep only points in the table
		for(let pt of cartSpots){
					ret.push(pt);
		}


		return ret;
	};

	Lidar.prototype.mergeSpots = function(cartSpots) {
		let ret = [];
		let workingHokuyos = this.hokuyosWorking();

		//logger.warn("TODO: take half of the points");
		//logger.warn("TODO: check that cartSpots[workingHokuyos[0].name].spots works");

		if (workingHokuyos.length == 2) {
			for(let spot of cartSpots.one.filteredSpots) {
				if (spot.x > X_MIN_ZONE && spot.x < 300 && spot.y>Y_MIN_ZONE && spot.y<Y_MAX_ZONE) {
					spot.inTheTable = true
				}
						ret.push(spot);

			}

			for(let spot of cartSpots.two.filteredSpots) {
				if (spot.x > X_MIN_ZONE && spot.x < 300 && spot.y>Y_MIN_ZONE&& spot.y<Y_MAX_ZONE) {
					spot.inTheTable = true
				}
						ret.push(spot);
			}
		} else if (workingHokuyos.length == 1) {
			for(let spot of cartSpots[workingHokuyos[0].name].filteredSpots) {
				if (spot.x > X_MIN_ZONE && spot.x < X_MAX_ZONE && spot.y>Y_MIN_ZONE && spot.y<Y_MAX_ZONE) {
					spot.inTheTable = true
				}
						ret.push(spot);
			}
		} else if (workingHokuyos.length == 0) {
			logger.warn("Trying to merge point without active hokuyo");
		}
		return ret;
	};


	Lidar.prototype.findRobots = function(cartSpots) {
		let ret = [];
		let d = 10000, j=0, x, y, diff = 0;
	 	let clusters = this.clusterize(cartSpots);
		for (let i = 0 ; i < clusters.length ; i++){
			clusters[i].calculCenter();
		}
		for (let i = 0 ; i < clusters.length ; i++){
			j = i+1;
			while(j < clusters.length){
				if (j != i){
					x = Math.abs(clusters[i].x - clusters[j].x);
					y = Math.abs(clusters[i].y - clusters[j].y);
					d = Math.sqrt(x*x + y*y)
					if(d < 20){
						clusters[i].spots = clusters[i].spots.concat(clusters[j].spots);
						clusters.splice(j, 1);
						diff ++;
					}
				}
				j = j+1;
			}
		}
		for (let i = 0 ; i < clusters.length ; i++){
			clusters[i].calculCenter();
			if (clusters[i].spots.length >3){
				if(clusters[i].x > X_MIN_ZONE && clusters[i].x < X_MAX_ZONE && clusters[i].y < Y_MAX_ZONE && clusters[i].y > Y_MIN_ZONE){
					clusters[i].diagBox();
					if (clusters[i].diag < 30 && clusters[i].diag > 4 )
					ret.push([clusters[i].x, clusters[i].y]);
				}
			}
		}
		/*ret = [
			[ 150, 100 ],
			[ 100, 135 ]
		]; // TMP */
		//logger.warn(ret);
		return ret;
	};
	Lidar.prototype.prepareData = function(spots){
		let ret = [];
		for(let i = 0; i < spots.length ; i++){
			if (spots[i].inTheTable == true)
				ret.push([spots[i].x, spots[i].y])
		}
		return ret;
	}

	/***
	*Fixes small hokuyo angulation postionning error
	*by using the rockets positions on the play aera
	***/
	Lidar.prototype.calibration = function(spots, hokName){
		let clusters = this.clusterize(spots);
		let hokPos = this.hokuyoPositions[hokName];
		let angle;
		let detected = false;
		function isNear(lidar, cluster, rocketName, d){
			let x = lidar.rocketPositions[rocketName].x;
			let y = lidar.rocketPositions[rocketName].y;

			//logger.warn([cluster.x, lidar.rocketPositions["one"].x]);
			if (cluster.x > x - d
				&& cluster.x < x + d
				&& cluster.y > y - d
				&& cluster.y < y + d){
					logger.warn("fusee detectee")
					return true;
				}
				else return false;
		}
		function angleGap(lidar, cluster, rocketName, hokName){
			var tab1 = lidar.toPolar(cluster, hokName);
			var tab2 = lidar.toPolar(lidar.rocketPositions[rocketName], hokName);
			//logger.warn([tab1[0], tab2[0]])
			return (tab2[0] - tab1 [0])
		}
		for (let i = 0; i < clusters.length ; i++){
			clusters[i].calculCenter();
			if (isNear(this, clusters[i], "one", 35) == true){
				angle = angleGap(this, clusters[i], "one", hokName)
				hokPos.decalage.push(angle)
				detected = true;
			}
		}
		hokPos.init = hokPos.init - 1 ;
		if (hokPos.init == 0 && detected == true){
			let a = 0;
			let nb = hokPos.decalage.length
			for( let i = 0; i < nb; i++){
				a = a + hokPos.decalage[i];
			}
			logger.warn("Recalibrage de l'hokuyo " + hokName + " : " + a/nb);
			hokPos.w = hokPos.w + a/nb
		}

	}

	Lidar.prototype.toPolar = function(object, hokName){
		let ret = [];
		let hokPos = this.hokuyoPositions[hokName];
			let x = object.x - hokPos.x
			let y = object.y - hokPos.y
			let distance = Math.sqrt(x*x + y*y);
			let angle = this.toDegree(Math.atan2(y, x) - this.toRadian(hokPos.w))

			return [angle, distance];
	}

	Lidar.prototype.toRadian = function(angleInDegree) {
		let angleInRadian;

		angleInRadian = angleInDegree * Math.PI / 180;

		return angleInRadian;
	};

	Lidar.prototype.toDegree = function(angleInRadian) {
		let angleInDegree;

		angleInDegree = angleInRadian* 180 / Math.PI;

		return angleInDegree;
	};

	return Lidar;
})();
