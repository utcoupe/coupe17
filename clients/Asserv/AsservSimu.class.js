/**
 * Module Asservissement en mode simulateur
 * 
 * @module clients/Asserv/AsservSimu
 * @requires module:clients/Asserv/Asserv
 */

"use strict";

const Asserv = require('Asserv.class.js');

/**
 * Classe héritant de l'asservissement, mode simulateur
 * 
 * @memberof module:clients/Asserv/AsservSimu
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservSimu extends Asserv{
	constructor(client, who, fifo){
		super(client, who, fifo);
		this.SIMU_FACTOR_VIT = 1;
		this.SIMU_FACTOR_A = 0.3;
		this.FPS = 30
		this.timeouts = [];
		this.pos = {x:0,y:0,a:0};
		this.vitesse = 800;
		this.getPos();
	}

	SIMU_DIST(dt, vitesse) { return (vitesse*SIMU_FACTOR_VIT)*dt; }
	SIMU_DIST_ROT(a) { return Math.abs(a)*100; } // Rayon aproximatif de 10cm
	SIMU_ROT_TIME(a, vitesse) { return SIMU_DIST_ROT(a)/(vitesse*SIMU_FACTOR_VIT*SIMU_FACTOR_A); }

	/**
	 * New Order
	 * 
	 * @param {Object} callback
	 * @param {int} ms
	 * @param {boolean} no_fifo
	 */
	newOrder(callback, ms, no_fifo, delay_order_finished){
		if(callback === undefined)
			callback = function(){};
		var use_fifo = !no_fifo;
		if(ms === undefined) ms = 0;
		if(delay_order_finished === undefined) delay_order_finished = 0;

		function nextOrder() {
			timeouts.push(setTimeout(function() {
				callback();
				timeouts.push(setTimeout(function() {
					this.fifo.orderFinished();
				}.bind(this), delay_order_finished));
			}.bind(this), ms));
		}

		if(use_fifo) {
			// logger.debug('use_fifo');
			this.fifo.newOrder(nextOrder.bind(this));
		} else {
			// logger.debug('no_fifo');
			timeouts.push(setTimeout(callback, ms));//.call(this));
		}
	}

	/**
	 * Sets Position
	 * 
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	setPos(pos, callback) {
		this.Pos(pos);
		this.sendPos();
		if(callback !== undefined)
			callback();
	}

	/**
	 * Clean
	 */
	clean(){
		logger.debug('cleaning %d timeouts', timeouts.length);
		while(timeouts.length > 0) {
			clearTimeout(timeouts.shift());
		}
	}

	/**
	 * Avancer plot
	 * 
	 * @param {Object} callback
	 */
	avancerPlot(callback) {
		this.newOrder(callback, 1200);
	}

	/**
	 * Set vitesse
	 * 
	 * @param {int} v Speed
	 * @param {int} r rotation
	 * @param {Object} callback
	 */
	setVitesse(v, r, callback) {
		this.vitesse = parseInt(v);
		if(callback !== undefined)
			callback();
	}

	/**
	 * Calage X
	 * 
	 * @param {int} x
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageX(x, a, callback) {
		this.setPos({x: x, y: this.pos.y, a: a}, callback);
	}
	/**
	 * Calage Y
	 * 
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageY(y, a, callback) {
		this.setPos({x: this.pos.x, y: y, a: a}, callback);
	}

	/**
	 * Simu Speed
	 * 
	 * @param {int} vit Speed
	 * @param {int} x
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {int} dt
	 */
	simu_speed(vit, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * vit*dt/1000,
				y: y + Math.sin(a) * vit*dt/1000,
				a: a
			}
			this.sendPos();
		}.bind(this);
	}

	/**
	 * Speed ?
	 * 
	 * @param {int} l
	 * @param {int} a Angle
	 * @param {int} ms
	 * @param {Object} callback
	 */
	speed(l, a, ms,callback) {
		this.newOrder(function() {
			// this.simu.pwm(callback, l/3, l/3, ms);
			for(var t = 0; t < ms; t += 1000/FPS) {
				timeouts.push(setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, t), t));
			}
			timeouts.push(setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, ms), ms));
			timeouts.push(setTimeout(callback, ms));
		}.bind(this), 0, false, ms);
	};

	/**
	 * Simu Pulse Width Modulation
	 * 
	 * @param {int} x
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {int} dt
	 */
	simu_pwm(pwm, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				y: y + Math.sin(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				a: a
			}
			this.sendPos();
		}.bind(this);
	}

	/**
	 * Pulse Width Modulation
	 * 
	 * @param {string} left
	 * @param {string} right
	 * @param {int} ms
	 * @param {Object} callback
	 */
	pwm(left, right, ms, callback) {
		this.newOrder(function() {
			var pwm = (left+right)/2;
			for(var t = 0; t < ms; t += 1000/FPS) {
				timeouts.push(setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, t), t));
			}
			timeouts.push(setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, ms), ms));
			timeouts.push(setTimeout(callback, ms));
		}.bind(this), 0, false, ms);
	}

	/**
	 * Simu Go X Y
	 * 
	 * @param {int} x
	 * @param {int} y
	 */
	simu_goxy(x, y) {
		return function() {
			this.pos.x = x;
			this.pos.y = y;
			this.sendPos();
		}.bind(this);
	}

	/**
	 * Go X Y
	 * 
	 * @param {int} x
	 * @param {int} y
	 * @param {string} sens
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goxy(x, y, sens, callback, no_fifo) {
		
			var dx = x-this.pos.x;
			var dy = y-this.pos.y;
			var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
			var tf = (dist / (this.vitesse*SIMU_FACTOR_VIT))*1000; // *1000 s->ms

			angle_avant = convertA(Math.atan2(dy,dx)-this.pos.a);
			angle_arriere = convertA(angle_avant+Math.PI);

			if(sens == "avant") angle_depart = angle_avant
			else if(sens == "arriere") angle_depart = angle_arriere;
			else if (Math.abs(angle_avant) < Math.abs(angle_arriere)) angle_depart = angle_avant;
			else angle_depart = angle_arriere;

			// logger.debug("dx: ", dx);
			// logger.debug("dy: ", dy);
			// logger.debug("angle: ", this.pos.a);
			// logger.debug("angle avant: ", angle_avant);
			// logger.debug("angle arriere: ", angle_arriere);
			// logger.debug("angle depart: ", angle_depart);

			this.goa(angle_depart+this.pos.a, function() {
				this.newOrder(function() {
					for(var t = 0; t < tf; t += 1000/FPS) {
						timeouts.push(setTimeout(this.simu_goxy(this.pos.x+dx*t/tf, this.pos.y+dy*t/tf), t));
					}
					timeouts.push(setTimeout(this.simu_goxy(x, y), tf));
					timeouts.push(setTimeout(callback, tf));
				}.bind(this), 0, no_fifo, tf);
			}.bind(this), no_fifo);
	}

	/**
	 * Simu Go Angle
	 * 
	 * @param {int} a Angle
	 */
	simu_goa(a) {
		return function() {
			this.setA(a);
			this.sendPos();
		}.bind(this);
	}

	/**
	 * Simu Go Angle
	 * 
	 * @param {int} a Angle
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goa(a, callback, no_fifo){
		a = convertA(a);
		da = convertA(a-this.pos.a);
		// logger.debug("depart:", this.pos.a);
		// logger.debug("arrivee:", a);
		// logger.debug("delta:", da);

		var tf = SIMU_ROT_TIME(da, this.vitesse)*1000; // *1000 s->ms
		this.newOrder(function() {
			for(var t = 0; t < tf; t += 1000/FPS) {
				// logger.debug(this.pos.a+da*t/tf);
				timeouts.push(setTimeout(this.simu_goa(this.pos.a+da*t/tf), t));
			}
			timeouts.push(setTimeout(this.simu_goa(a), tf));
			timeouts.push(setTimeout(callback, tf));
		}.bind(this), 0, no_fifo, tf);
	}

	/**
	 * Set P I D
	 * 
	 * @param {int} p
	 * @param {int} i
	 * @param {int} d
	 * @param {Object} callback
	 */
	setPid(p, i, d, callback){
		this.newOrder(callback);
	}
}

module.exports = AsservSimu;