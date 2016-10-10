module.exports = (function () {
	"use strict";
	var logger = require('log4js').getLogger('ia.pr');
	var GR_OFFSET = 110;
	var PR_GR_COEF = 1;

	function Pr(ia, color) {
		this.ia = ia;
		this.pos = { // if we are yellow, default, left side of the table
			x: 0,
			y: 0,
			a: 0
		};
		this.size = {
			l: 170,
			L: 220,
			d: 280
		};
		this.current_action = null;
		//this.path = null;
		this.path = [];
		this.content = {
			nb_plots: 0,
			gobelet:false
		};
		this.we_have_hats = false;
		this.color = color;
	}

	Pr.prototype.loop = function () {
		logger.debug('loop');
		this.ia.actions.doNextAction(function() {
			this.loop();
		}.bind(this));
	};

	Pr.prototype.collision = function() {
		if(this.path.length === 0) { // Utile quand on clique nous même sur le bouton dans le simu
			logger.warn("Normalement impossible, collision sur un path vide ?");
			//return;
		}

		logger.info('collision');
		this.path = [];
		this.ia.client.send('pr', "collision");
		this.ia.actions.collision();
		this.loop();
	}
	Pr.prototype.stop = function() {
		this.ia.client.send('pr', 'stop');
	}

	Pr.prototype.place = function () {
		// logger.debug('place');
		this.sendInitialPos();
		this.ia.client.send('pr', 'placer');
	};

	Pr.prototype.start = function () {
		this.ia.client.send("pr", "ouvrir_ax12");
		this.loop();
	};

	Pr.prototype.sendInitialPos = function () {
		this.ia.client.send("pr", "setpos", {
			x: 142,
			y: 1000,
			a: 0,
			color: this.color
		});
	};

	function borne(x, min, max) {
		return x > max ? max : x < min ? min : x;
	}

	Pr.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'pr.collision':
				this.collision();
			break;
			// Asserv
			case 'pr.pos':
				params.x = borne(params.x, 0, 3000);
				params.y = borne(params.y, 0, 2000);
				this.pos = params;
			break;
			case 'pr.getpos':
				this.sendInitialPos();
			break;
			case 'pr.placer':
				this.place();
			break;
			case 'pr.plot++':
				this.content.nb_plots += 1;
			break;
			case 'pr.plot0':
				this.content.nb_plots = 0;
			break;
			case 'pr.gobelet1':
				this.content.gobelet = true;
			break;
			case 'pr.gobelet0':
				this.content.gobelet = false;
			break;
			case 'pr.hok':
				this.updatePos(params);
			break;
			default:
				logger.warn('Ordre inconnu dans ia.pr: '+name);
		}
	};

	var SEGMENT_DELTA_D = 30; // (mm) between 2 iterations on a segment to detect colision

	Pr.prototype.getDistance = function (spot1, spot2) {
		return Math.sqrt(Math.pow(spot1.x - spot2.x, 2) + Math.pow(spot1.y - spot2.y, 2));
	};

	Pr.prototype.detectCollision = function(dots) {
		var collision = false;
		var pf = this.path;
		var minDist;
		// for each path segment
		var complete_path = [this.pos].concat(this.path);
		for (var i = 0; i < complete_path.length-1 && !collision; (i++) ) {
			var segment = [complete_path[i], complete_path[i+1]]; // so segment[0][0] is the x value of the beginning of the segment
			var segLength = this.getDistance({x:segment[0].x , y:segment[0].y }, {x:segment[1].x , y:segment[1].y });
			var nthX = (segment[1].x-segment[0].x)*SEGMENT_DELTA_D/segLength; // segment X axis length nth 
			var nthY = (segment[1].y-segment[0].y)*SEGMENT_DELTA_D/segLength;

			// for each X cm of the segment
			for (var j = 0; (j*SEGMENT_DELTA_D) < segLength && !collision; (j++)) {

				var segPoint = {
					x: segment[0].x + nthX*j,
					y: segment[0].y + nthY*j
				};

				// distance to each estimated position of the ennemi robots
				minDist = 10000;//this.getDistance(dots[0], segPoint);

				for(var k = 0; k < dots.length; k++) {
					var tmp = this.getDistance(dots[k], segPoint);
					if (tmp < minDist) {
						minDist = tmp;
					}
				}
				// if (ebots.length == 2) {
				// 	var tmp = this.getDistance(ebots[1], segPoint);
				// 	if (tmp < minDist) {
				// 		minDist = tmp;
				// 	}
				// }

				// if one of the dist < security diameter, there will be a collision
				if (minDist < 450) {
					collision = true;
				}
				
			}
		}

		if (collision) {
			this.collision();
		}
	}

	Pr.prototype.updatePos = function(dots) {
		if(this.ia.timer.match_started) {

			// Invert if green
			if(this.color == "green") {
				dots = dots.map(function(val) {
					return [val[0], 2000-val[1]];
				});
			}

			// Delete our robots
			for(var i in dots) {
				if(this.norm(dots[i][0], dots[i][1], this.pos.x, this.pos.y) < 150 ||
					this.norm(dots[i][0], dots[i][1], this.ia.gr.pos.x, this.ia.gr.pos.y) < 150)
				dots.splice(i, 1);
			}

			// Check path
			this.detectCollision(dots);

			// Update data
			this.ia.data.dots = dots.map(function(val) {
				return {
					pos: {
						x: val[0],
						y: val[1],
					},
					d: 320
				}
			});
			if (dots.length > 0) {
				this.ia.data.erobot[0].pos= {
					x: dots[0][0],
					y: dots[0][1]
				};

				if (dots.length > 1) {
					this.ia.data.erobot[1].pos= {
						x: dots[1][0],
						y: dots[1][1]
					};
				};
			};

			// logger.fatal(dots);
			// logger.fatal(this.pos);
			// logger.fatal(this.ia.data.erobot);
		}
	};

	Pr.prototype.norm = function(Ax, Ay, Bx, By) {
		return Math.sqrt(Math.pow(Ax-Bx, 2) + Math.pow(Ay-By, 2));
	}
	
	return Pr;
})();
