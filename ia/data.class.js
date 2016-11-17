/**
 * Data Module
 * 
 * @module ia/data
 * @see {@link ia/data.Data}
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	/**
	 * Data Constructor
	 * 
	 * @exports ia/data.Data
	 * @constructor
	 * @param {Object} ia
	 * @param {int} nb_erobots Number of robots in a team
	 * @param EGR_d
	 * @param EPR_d 
	 */
	function Data(ia, nb_erobots, EGR_d, EPR_d) {
		/** balle */
		this.balle = [];
		/** chargeur */
		this.chargeur = [];
		/** clap */
		this.clap = [];
		/** plot */
		this.plot = [];
		/** erobot */
		this.erobot = [];
		/** gobelet */
		this.gobelet = [];
		/** pile */
		this.pile = {};
		/** dynamic */
		this.dynamic = []; //used for laid stacks
		/** depot */
		this.depot = [];
		/** nb_erobot */
		this.nb_erobots = nb_erobots;

		/** dots */
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

	/**
	 * Import the Objects
	 */
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

	/**
	 * Return Object Reference
	 * 
	 * @param {string} name
	 */
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

	/**
	 * Returns true if dist1 is smaller than dist2 
	 * 
	 * @param {int} dist1
	 * @param {int} dist2
	 */
	Data.prototype.isCloser = function (dist1, dist2){
		return (dist1 < dist2);
	};

	/**
	 * Return the distance between two positions
	 * 
	 * @param {Object} pos1
	 * @param {int} pos1.x
	 * @param {int} pos1.y
	 * @param {Object} pos2
	 * @param {int} pos2.x
	 * @param {int} pos2.y
	 */
	Data.prototype.getDistance = function (pos1, pos2){
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
	};

	/**
	 * Takes a position and the ennemy robot # to put everything in its surroundings (~ 1.1 * radius) as "lost"
	 * 
	 * @param {Object} pos
	 * @param {int} e_robot_id
	 */
	Data.prototype.theEnnemyWentThere = function (pos, e_robot_id){
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

	/**
	 * Parse Order
	 * 
	 * @param {string} from
	 * @param {string} name
	 * @param {Object} param
	 */
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
