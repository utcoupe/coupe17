"use strict";

class HokuyoDisplay {
	constructor(parentId, mode) {
		this.MAIN = "main";
		this.ONE = "one";
		this.TWO = "two";

		this.dotRadius = 1; 	// cm

		this.parentId = parentId;
		this.mode = mode;
		this.div = $('#' + this.parentId);


		this.onResize();// Math.max($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(), 200);

		// On window resize (doesn't seem to work)
		// window.addEventListener('resize', this.onResize());
		// this.div.resize(this.onResize());
		// setInterval(this.onResize(), 1000);

		this.initChart();
	}

	onResize() {
		if (this.mode == this.MAIN) {
			var maxWidth = 1200; // px

			// if (this.W != this.div.width()) {
			this.W = 1000; //this.div.width();
			if (this.W > maxWidth) {
				this.W = maxWidth;
			}
			this.H = ( 200 / 300 ) * this.W;
			// }
		} else {
			this.W = 490;
			this.H = this.W;

			this.center = this.W/2 + "," + this.H/2;
		}

		this.div.width(this.W);
		this.div.height(this.H);

		// console.log(this.mode);
		// console.log(this.W);
		// console.log(this.H);
	}

	initChart() {
		this.r = Raphael(this.parentId, this.div.width(), this.div.height());
		if (this.mode != this.MAIN) {

        	var grey = Raphael.color("#333");
        	this.dotColor = Raphael.getColor(1);
        	this.viewportScale = (this.W/2) / 400;

        	// Outmost circle
        	// Unit: cm
        	this.r.circle(0, 0, 400).attr({stroke: this.dotColor, fill: grey, transform: "t " + this.center + "s" + this.viewportScale, "fill-opacity": .1});

        	// Inner circles
        	// Unit: cm
        	for (var radius = 100; radius < 400; radius+=100) {
        		this.r.circle(0, 0, radius).attr({stroke: grey, fill: null, transform: "t " + this.center + "s" + this.viewportScale, "stroke-opacity": .4});
        	}

			// Arraw
        	// Unit: pixel
        	this.r.path("M-7 10L0 -10L7 10L-7 10").attr({stroke: this.dotColor, fill: this.dotColor, transform: "t " + this.center, "fill-opacity": .4});

        	this.dots = new Map();
		}
	}

	updatePolarSpots(spots) {
		if (this.mode == this.MAIN) {
			console.error("Main display can't handle polar spot");
			return;
		}

		// For each spots
		spots.forEach(function(newSpot) {
			var existingPlot = this.dots.get(newSpot[0]);

			if (!!existingPlot) {
				// Dot already exist at this angle, let's update it
				existingPlot.attr({cy: newSpot[1] * this.viewportScale });
			} else {
				// This dot doesn't already exist, let's create it
        		var dot = this.r.circle(0, newSpot[1] * this.viewportScale, this.dotRadius).attr({
        			stroke: this.dotColor,
        			fill: this.dotColor,
        			transform:  "t," + this.center + "r180,0,0" + "r" + newSpot[0] + ",0,0"});
        		//  + " 0 0" +   + 
        		this.dots.set(newSpot[0], dot);
			}
		}.bind(this));

	}

	updateRobots(robots) {
		if (this.mode != this.MAIN) {
			console.error("Single LiDAR displays can't handle global robot spot");
			return;
		}

	}
}