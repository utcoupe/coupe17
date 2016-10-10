module.exports = (function () {
	var logger = require('log4js').getLogger('asserv');

	// For simu
	var SIMU_FACTOR_VIT = 1;
	var SIMU_FACTOR_A = 0.3; 	// Facteur
	// var SIMU_PWM_REF = 255; 	// à une PWM de 80
	function SIMU_DIST(pwm, dt, vitesse) { return (vitesse*SIMU_FACTOR_VIT)*dt; }
	function SIMU_DIST_ROT(a) { return Math.abs(a)*100; } // Rayon aproximatif de 10cm
	function SIMU_ROT_TIME(a, vitesse) { return SIMU_DIST_ROT(a)/(vitesse*SIMU_FACTOR_VIT*SIMU_FACTOR_A); }
	var FPS = 30;

	var timeouts = [];

	function Asserv(client, who, fifo) {
		this.client = client;
		this.who = who;
		this.pos = {
			x:0,y:0,a:0
		};
		this.fifo = fifo;
		this.vitesse = 800;
		this.getPos();
	}

	Asserv.prototype.newOrder = function(callback, ms, no_fifo, delay_order_finished){
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

	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		this.pos.a = convertA(a);
	}
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
	Asserv.prototype.setPos = function(pos, callback) {
		this.Pos(pos);
		this.sendPos();
		if(callback !== undefined)
			callback();
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

	Asserv.prototype.clean = function(){
		logger.debug('cleaning %d timeouts', timeouts.length);
		while(timeouts.length > 0) {
			clearTimeout(timeouts.shift());
		}
	};
	Asserv.prototype.avancerPlot = function(callback) {
		this.newOrder(callback, 1200);
	}

	Asserv.prototype.setVitesse = function(v, r, callback) {
		this.vitesse = parseInt(v);
		if(callback !== undefined)
			callback();
	};
	Asserv.prototype.calageX = function(x, a, callback) {
		this.setPos({x: x, y: this.pos.y, a: a}, callback);
	}
	Asserv.prototype.calageY = function(y, a, callback) {
		this.setPos({x: this.pos.x, y: y, a: a}, callback);
	}

	Asserv.prototype.simu_speed = function(vit, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * vit*dt/1000,
				y: y + Math.sin(a) * vit*dt/1000,
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.speed = function(l, a, ms,callback) {
		this.newOrder(function() {
			// this.simu.pwm(callback, l/3, l/3, ms);
			for(var t = 0; t < ms; t += 1000/FPS) {
				timeouts.push(setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, t), t));
			}
			timeouts.push(setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, ms), ms));
			timeouts.push(setTimeout(callback, ms));
		}.bind(this), 0, false, ms);
	};

	Asserv.prototype.simu_pwm = function(pwm, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				y: y + Math.sin(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.pwm = function(left, right, ms, callback) {
		this.newOrder(function() {
			var pwm = (left+right)/2;
			for(var t = 0; t < ms; t += 1000/FPS) {
				timeouts.push(setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, t), t));
			}
			timeouts.push(setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, ms), ms));
			timeouts.push(setTimeout(callback, ms));
		}.bind(this), 0, false, ms);
	};

	Asserv.prototype.simu_goxy = function(x, y) {
		return function() {
			this.pos.x = x;
			this.pos.y = y;
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goxy = function(x, y, sens, callback, no_fifo) {
		
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
	};
	Asserv.prototype.simu_goa = function(a) {
		return function() {
			this.setA(a);
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goa = function(a, callback, no_fifo){
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
	};

	Asserv.prototype.setPid = function(p, i, d, callback){
		this.newOrder(callback);
	};

	return Asserv;
})();
