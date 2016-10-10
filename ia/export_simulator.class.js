module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.export_simulator');

	var __timeout = null;
	var FPS = 30;
	var color;

	function ExportSimulator(ia) {
		this.ia = ia;
		this.start();
		color = this.ia.color;
	}

	function convertX(x) {
		if(color == "yellow") {
			return (x-1500)/1000;
		} else {
			return (1500-x)/1000;
		}
	}
	function convertY(y) {
		return (1000-y)/1000;
	}
	function convertA(a) {
		if(color == "yellow") {
			return a;
		} else {
			return (a < 0) ? -Math.PI - a : Math.PI - a;
		}
	}

	ExportSimulator.prototype.start = function() {
		this.orderToSimu();
	}
	ExportSimulator.prototype.stop = function() {
		clearTimeout(__timeout);
	}

	ExportSimulator.prototype.orderToSimu = function() {
		var data = {};
		
		data.robots = {
			gr: {
				x: convertX(this.ia.gr.pos.x),
				y: convertY(this.ia.gr.pos.y),
				a: convertA(this.ia.gr.pos.a)
			},
			pr: {
				x: convertX(this.ia.pr.pos.x),
				y: convertY(this.ia.pr.pos.y),
				a: convertA(this.ia.pr.pos.a),
				path: [this.ia.pr.pos].concat(this.ia.pr.path).map(function(pos){
					return [convertX(pos.x), convertY(pos.y)];
				})
			},
			egr: {
				x: convertX(this.ia.data.erobot[0].pos.x),
				y: convertY(this.ia.data.erobot[0].pos.y),
			},
			epr: {
				x: convertX(this.ia.data.erobot[1].pos.x),
				y: convertY(this.ia.data.erobot[1].pos.y)
			}
		};
		data.dynamic = this.ia.data.dynamic.map(function(o){
			return [convertX(o.pos.x), convertY(o.pos.y)];
		});
		// logger.debug(data.robots.egr);
		this.ia.client.send("webclient", "simulateur", data);

		__timeout = setTimeout(function(){this.orderToSimu()}.bind(this), 1000/FPS);
	}

	return ExportSimulator;
})();