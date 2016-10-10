module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	function Data(ia, nb_erobots, EGR_d, EPR_d) {
		this.balle = [];
		this.chargeur = [];
		this.clap = [];
		this.plot = [];
		this.erobot = [];
		this.gobelet = [];
		this.pile = {};
		this.dynamic = []; //used for laid stacks
		this.depot = [];
		this.nb_erobots = nb_erobots;

		this.dots = [];

		this.importObjects();
		
		this.erobot = [{ // big robot on position 0
				name: "gr",
				pos:{
					x:3200,
					y:1000
				},
				speed:{ // in mm/sec
					x:0,
					y:0,
				},
				lastUpdate: 0, // time in ms from the beining of the match
				d: EGR_d || 320,
				status: "lost"
			},{ // small robot on position 1
				name: "pr",
				pos:{
					x:3500,
					y:1000
				},
				speed:{
					x:0,
					y:0
				},
				lastUpdate: 0,
				d: EPR_d || 200,
				status: "lost"
			}];
	}

	Data.prototype.importObjects = function () {
		var ret = require('./objects.json');

		this.balle = ret.balle;
		this.chargeur = ret.chargeur;
		this.clap = ret.clap;
		this.plot = ret.plot;
		this.gobelet = ret.gobelet;
		this.pile = ret.pile;
		this.depot = ret.depot;
		return ret;
	};

	Data.prototype.getObjectRef = function(name) {
		// Retourne une référence vers l'objet name
		// 		name étant de la forme <type>__<nom>
		// Permet d'avoir une référence vers l'objet dans une action

		var actName = name.split("__");
		if (actName.length != 2){
			logger.warn("Le nom '"+name+"' n'est pas un nom d'objet correct.");
			return null;
		}

		if (!this[actName[0]][actName[1]]){
			logger.warn("L'objet "+actName[0]+" de type "+actName[1]+" est inconnu.");
			return null;
		}

		return this[actName[0]][actName[1]];
	};

	Data.prototype.isCloser = function (dist1, dist2){ // il y a la meme dans actions.class.js
		// Returns true if dist1 is smaller than dist2
		// i.e. object 1 is closer than object 2

		if(dist1 < dist2){
			return true;
		} else {
			return false;
		}
	};

	Data.prototype.getDistance = function (pos1, pos2){
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
	};

	Data.prototype.theEnnemyWentThere = function (pos, e_robot_id){
		// takes a position and the ennemy robot # to put everything in its surroundings (~ 1.1 * radius) as "lost" 

		Object.keys(this.plot).forEach(function(c) {
			if ((this.getDistance(pos, this.plot[c].pos) < 0.55*this.erobot[e_robot_id].d) && (this.plot[c].status != "lost")) {
				logger.info("Le plot " + c + " est marqué lost");
				this.plot[c].status = "lost";
			}
		}.bind(this));
		var min_dist = Infinity;
		Object.keys(this.gobelet).forEach(function(g) {
			if ((this.getDistance(pos, this.gobelet[g].pos) < 0.55*this.erobot[e_robot_id].d) && (this.gobelet[g].status != "lost")) {
				logger.info("Le gobelet" + g + " est marqué lost");
				this.gobelet[g].status = "lost";
			}
		}.bind(this));
	};

	Data.prototype.parseOrder = function(from, name, param){
		switch(name){
			case "data.add_dynamic" :
				if(!!param.pos && !!param.pos.x && !!param.pos.y && !!param.d){
					this.dynamic.push(param);
					logger.info("added dynamic from :"+from+" params:"+JSON.stringify(param));
				}else{
					logger.error("invalid dynamic from :"+from+" params:"+JSON.stringify(param));
				}				
			break;
			default: logger.error("Unknown order name:"+name+" from:"+from);
		}
	};

	var data = new Data();
	
	return Data;
})();
