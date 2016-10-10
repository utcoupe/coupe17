module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');
	function Actions(ia) {
		this.ia = ia;
		this.color = ia.color;

		this.done = {};
		this.todo = {};
		this.inprogress = null;
		this.killed = {};

		this.valid_id_do_action = -1;

		this.todo = this.importActions(ia.data);
	}

	var __dist_startpoints_plot = 120;
	var __nb_startpoints_plot = 16;
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

	Actions.prototype.collision = function() {
		if(this.inprogress !== null) {
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// Décommenter la ligne, juste pour tester
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			this.todo[this.inprogress.name] = this.inprogress;
			this.inprogress = null;
		}
	}

	Actions.prototype.importActions = function (data) {
		var req;

		try {
			req = require('./actions.json');
		}
		catch(err) {
		    logger.fatal("Erreur lors de l'importation des actions dans l'IA: "+err);
		}
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
			actions[i].name = i;

			if ((actions[i].object !== null) && (actions[i].type == "plot") && (actions[i].startpoints.length === 0)) {
				actions[i].startpoints.push({
					x: actions[i].object.pos.x,
					y: actions[i].object.pos.y
				});
				// var temp;
				// for(var j = 0; j < __nb_startpoints_plot; j++) {
				// 	temp = j*2*Math.PI/__nb_startpoints_plot;
				// 	actions[i].startpoints.push({
				// 		x: actions[i].object.pos.x + __dist_startpoints_plot * Math.cos(temp),
				// 		y: actions[i].object.pos.y + __dist_startpoints_plot * Math.sin(temp),
				// 		a: convertA(temp+Math.PI)
				// 	});
				// }
			}
			else if((actions[i].object !== null) && (actions[i].type == "clap")) {
				if(this.color != "yellow") {
					var a = actions[i].startpoints[0].a;
					actions[i].startpoints[0].a = (a < 0) ? -Math.PI - a : Math.PI - a;
				}
			}
		}.bind(this));

		return actions;
	};

	Actions.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'actions.action_finished':
			// logger.debug('received action_finished');
				this.actionFinished();
			break;
			case 'actions.path_finished':
			logger.debug('received path_finished');
				this.ia.pr.path = [];
			break;
			default:
				logger.warn('Ordre inconnu dans ia.gr: '+name);
		}
	};


	Actions.prototype.kill = function (action_name){
		// If action doesn't exist
		if (!!action_name && this.exists(action_name)){
			this.done[action_name] = this.todo[action_name];
			delete this.todo[action_name];
		}
	};

	Actions.prototype.exists = function (action_name){
		if (!this.todo[action_name]){
			if (!this.killed[action_name] && !this.done[action_name] && !this.done[action_name])
				logger.warn("Action named '"+"' doesn't exist");
			else
				logger.warn("Action named '"+"' already killed in progress or done !");
			return false;
		} else {
			return true;
		}
	};

	Actions.prototype.isDone = function (action_name){
		return !action_name || this.done.hasOwnProperty(action_name);
	};

	function norm2Points(A, B) {
		return Math.sqrt(Math.pow(A.x-B.x, 2) + Math.pow(A.y-B.y, 2));
	}
	Actions.prototype.getNormAction = function(pos, an) {
		return norm2Points(pos, this.todo[an].object.pos);
	};
	
	Actions.prototype.getPriorityAction = function(an) {
		return this.todo[an].object.status == "lost" ? -1000 : this.todo[an].priority;
	};
	
	Actions.prototype.isDoable = function(action) {
		// Verifies some things about the action

		if (!!action.dependency && !this.isDone(action.dependency)){
			// Depends on an action, but it hasn't already been done
			return false;
		}

		if (action.dependencyRobotContent !== undefined){
			// Depends on the robot content

			if ((action.dependencyRobotContent.gobelet !== undefined) &&
				(this.ia.pr.content.gobelet !== action.dependencyRobotContent.gobelet)){
				// The cup holder position isn't consistent with needed state
				return false;
			}

			// If there's a constraint about the current number of cylinders
			if ((action.dependencyRobotContent.invPlot !== undefined)  &&
				(this.ia.pr.content.nb_plots < action.dependencyRobotContent.invPlot)){
				return false;
			}
			if ((action.dependencyRobotContent.subPlot !== undefined)  &&
				(this.ia.pr.content.nb_plots > action.dependencyRobotContent.subPlot)){
				return false;
			}
		 
		}

		// if (action.object.status == "lost"){
		// 	return false;
		// }

		return true;
	};
	
	Actions.prototype.doNextAction = function(callback) {
		this.valid_id_do_action++;
		var actions_todo = [];

		// Get les actions possibles
		Object.getOwnPropertyNames(this.todo).forEach(function(an) { //an = action name
			if(this.isDoable(this.todo[an])) {
				actions_todo.push(an);
			}
		}, this);

		// Tri par priorité puis par norme
		var pos = this.ia.pr.pos;
		actions_todo.sort(function(a, b) {
			return (this.getPriorityAction(b) - this.getPriorityAction(a)) || (this.getNormAction(pos, a) - this.getNormAction(pos, b));
		}.bind(this));

		for(var i in actions_todo) {
			logger.debug('[%d] %s (%d)', this.todo[actions_todo[i]].priority, actions_todo[i], this.getNormAction(pos, actions_todo[i]));
		}

		// Va choisir l'action la plus proche, demander le path et faire doAction
		this.pathDoAction(callback, actions_todo, this.valid_id_do_action);
	};

	Actions.prototype.getNearestStartpoint = function(pos, startpoints) {
		var min_dist = Infinity;
		var nearest = null;

		for (var i = 0; i < startpoints.length; i++) {
			var dist = norm2Points(pos, startpoints[i]);

			if (dist < min_dist){
				min_dist = dist;
				nearest = startpoints[i];
			}
		}

		return nearest;
	};

	Actions.prototype.pathDoAction = function(callback, actions, id) {
		if(id != this.valid_id_do_action) {
			logger.Debug('id different');
			return;
		}
		// Va choisir l'action la plus proche, demander le path et faire doAction
		if(actions.length > 0) {
			var action = this.todo[actions.shift()];
			var startpoint = this.getNearestStartpoint(this.ia.pr.pos, action.startpoints);
			this.ia.pathfinding.getPath(this.ia.pr.pos, startpoint, function(path) {
				if(path !== null) {
					this.ia.pr.path = path;
					this.doAction(callback, action, startpoint, id);
				} else {
					logger.debug("path not found");
					// Si le pathfinding foire, on fait la deuxième action la plus importante
					this.pathDoAction(callback, actions, id);
				}
			}.bind(this));
		} else {
			logger.debug("all paths not found");
			setTimeout(function() {
				this.doNextAction(callback);
			}.bind(this), 500);
		}
	};

	Actions.prototype.doAction = function (callback, action, startpoint, id) {
		if(id != this.valid_id_do_action)
			return;
		this.callback = callback;
		
		// // Change action to state "in progress"
		this.inprogress = action;
		delete this.todo[action.name];

		logger.debug('Action en cours %s (%d;%d;%d)', action.name, startpoint.x, startpoint.y, startpoint.a);
		this.ia.pr.path.map(function(checkpoint) {
			this.ia.client.send('pr', "goxy", {
				x: checkpoint.x,
				y: checkpoint.y,
				sens: action.sens
			});
		}, this);
		if(!!startpoint.a) {
			this.ia.client.send('pr', "goa", {
				a: startpoint.a
			});
		}

		this.ia.client.send('pr', "send_message", {
			name: "actions.path_finished"
		});
		// 1 order for 1 action
		// action.orders.forEach(function (order, index, array){
		this.ia.client.send('pr', action.orders[0].name, action.orders[0].params);
		// }.bind(this));
		this.ia.client.send('pr', "send_message", {
			name: "actions.action_finished"
		});

		// // Set object to "done" ! XXX

		// // Change action and its "to be killed" actions to state done

		// console.log(this.todo);
		// console.log(this.inprogress);
		// console.log(this.done);
	};

	Actions.prototype.actionFinished = function () {
		if(this.inprogress !== null) {
			this.done[this.inprogress.name] = this.inprogress;
			logger.info('Action %s est finie !', this.inprogress.name);
			this.inprogress = null;
			var temp = this.callback;
			this.callback = function() {logger.warn('callback vide'); };
			temp();
		}
	};
	
	return Actions;
})();
