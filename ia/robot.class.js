/**
 * Module de component robot générique de l'IA
 *
 * @module ia/robot
 */

"use strict";

/**
 * Robot générique de l'IA
 *
 * @class Robot
 * @memberof module:ia/robot
 */
class Robot{
	constructor(ia, color){
		/** IA */
		this.ia = ia;

		/** Robot name (pr or gr) */
		this.name = "";

		/** Position */
		this.pos = { // if we are yellow, default, left side of the table
			x: 0,
			y: 0,
			a: 0
		};

		/** Initial position */
		this.initialPos = {
			x: 0,
			y: 0,
			a: 0,
		}

		/** Size of the robot, to be initialized */
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};

		/** Current action */
		this.current_action = null;

		/** Path */
		this.path = [];

		/** Content, to be initialized */
		this.content = {};

		/** We have hats on the top */
		this.we_have_hats = false;
		
		/** Team color */
		this.color = color;
	}

	detectCollision(){
		let collision = false;
		
		logger.debug("TODO: detect collision");
		// var pf = this.path;
		// var minDist;
		// // for each path segment
		// var complete_path = [this.pos].concat(this.path);
		// for (var i = 0; i < complete_path.length-1 && !collision; (i++) ) {
		// 	var segment = [complete_path[i], complete_path[i+1]]; // so segment[0][0] is the x value of the beginning of the segment
		// 	var segLength = this.getDistance({x:segment[0].x , y:segment[0].y }, {x:segment[1].x , y:segment[1].y });
		// 	var nthX = (segment[1].x-segment[0].x)*SEGMENT_DELTA_D/segLength; // segment X axis length nth 
		// 	var nthY = (segment[1].y-segment[0].y)*SEGMENT_DELTA_D/segLength;

		// 	// for each X cm of the segment
		// 	for (var j = 0; (j*SEGMENT_DELTA_D) < segLength && !collision; (j++)) {

		// 		var segPoint = {
		// 			x: segment[0].x + nthX*j,
		// 			y: segment[0].y + nthY*j
		// 		};

		// 		// distance to each estimated position of the ennemi robots
		// 		minDist = 10000;//this.getDistance(dots[0], segPoint);

		// 		for(var k = 0; k < dots.length; k++) {
		// 			var tmp = this.getDistance(dots[k], segPoint);
		// 			if (tmp < minDist) {
		// 				minDist = tmp;
		// 			}
		// 		}

		// 		// if one of the dist < security diameter, there will be a collision
		// 		if (minDist < 450) {
		// 			collision = true;
		// 		}
				
		// 	}
		// }

		if (collision) {
			this.onCollision();
		}
	}

	onCollision() {
		logger.debug("TODO: collision handler");

		logger.info('Collision');
		this.path = [];
		this.ia.client.send(this.name, "collision");

		logger.debug("TODO : Dafuk ?");
		this.ia.actions.collision();
		this.loop();
	}


	/**
	 * Send initial position
	 */
	sendInitialPos () {
		this.ia.client.send(this.name, "setpos", {
			x: this.initialPos.x,
			y: this.initialPos.y,
			a: this.initialPos.a,
			color: this.color
		});
	};

	parseOrder (from, name, params) {
		logger.error("Make sure to override robot.parseOrder function !");
	};
}

module.exports = Robot;