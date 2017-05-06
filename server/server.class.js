/**
 * Server module
 * @module server/server
 * @requires module:ia/main
 * @requires log4js
 * @requires child_process
 * @requires ansi-to-html
 * @requires os
 * @requires socket.io
 * @see {@link server/server.Server}
 */
module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');
	var spawn = require('child_process').spawn;
	var Convert = require('ansi-to-html');
	var convert = new Convert({newLine: true});

	/**
	 * Starts a server on the port specified. Default port: 3128
	 *
	 * @exports server/server.Server
	 * @constructor
	 * @param {int} [server_port=3128] Server port
	 */
	function Server(server_port) {
		/**
		 * @type {int}
		 */
		this.server_port = server_port || 3128;

		// Get server IP address
		var os = require('os');
		var networkInterfaces = os.networkInterfaces();
		try {
			/** @type {string} */
			this.ip = networkInterfaces["eth0"][0].address || networkInterfaces["Wi-Fi"][0].address || "127.0.0.1";
		}
		catch(e) {
			this.ip = "127.0.0.1";
		}
		/** @type {string} */
		this.ip_port = this.ip+':'+this.server_port;

		/**
		 * Create the server
		 * @type {Object}
		 */
		this.server = require('socket.io')();

		/**
		 * Create the network default object
		 * @type {Object}
		 * */
		this.network = {
			server: {
				name: "Server",
				ip: this.ip_port
			},
			webclient: {},
			ia: {},
			lidar: {},
			hokuyo: {},
			pr: {},
			gr: {},
			unit_grabber: {},
			base_constructor: {}
		};
		/** @type {Object} */
		this.utcoupe = {
			'ia': false,
			'pr': false,
			'gr': false,
			'hokuyo': false
		};
		 /** @type {Object} */
		this.progs = {
			'ia': null,
			'pr': null,
			'gr': null,
			'lidar': null,
			'hokuyo': false
		}

		// When the client is connected
		this.server.on('connection', function (client) {
			// When the client is disconnected
			client.on('disconnect', function() {
				logger.info(client.type+" is disconnected!");
				try {
					delete this.network[client.type][client.id];
				}
				catch(e) { }
				this.sendNetwork();
			}.bind(this));

			// When the client send his type
			client.on('type', function(data) {
				if(typeof data.type !== 'string') {
					logger.error("The client type sent isn't a string");
					return;
				}
				if(!(data.type in this.network)) {
					logger.error("The client type `"+data.type+"` isn't valid");
					return;
				}
				// The type is valid
				client.type = data.type;
				logger.info(client.type+" is connected!");
				data.options.ip = client.handshake.address;
				this.network[client.type][client.id] = data.options;
				// console.log(this.network);
				client.join(client.type);
				client.emit('log', "Connected to the server successfully at " + client.handshake.headers.host);
				this.sendNetwork();
				this.sendUTCoupe();
			}.bind(this));

			// When the client send an order
			client.on('order', function(data) {
				// console.log(data);
				if(typeof data !== 'object') {
					logger.error("The client order sent isn't a object");
					return;
				}
				if(data.to === undefined) {
					logger.error("The order hasn't 'to' argument (recipient)");
					return;
				}
				// if(!(data.to in client.adapter.rooms)) {
				// 	logger.warn("The order recipient `"+data.to+"` doesn't exist.");
				// }
				if(data.name == 'server.spawn') {
					this.spawn(data.params);
				} else if(data.name == 'server.kill') {
					this.kill(data.params);
				} else if(data.name == 'server.childrenUpdate') {
					// console.log(this.network);
					this.network[client.type][client.id].status = data.params.status || "";
					this.network[client.type][client.id].children = data.params.children || "";
					// console.log(this.network);
					this.sendNetwork();
				} else if (data.name == 'server.iaColor') {
					this.network[client.type][client.id].color = data.params.color || "";
					this.sendNetwork();
				} else if (data.name == 'server.sync_all_git') {
					logger.info("Starting to sync all git repositories");
					spawn('/root/sync_all_git.sh', [], {
						detached: true
					});
				} else if (data.name == 'server.flash_arduinos') {
					logger.info("Starting to flash all arduinos");
					spawn('/root/flash_all_arduinos.sh', [], {
						detached: true
					});
				} else {
					// The order is valid
					// logger.info("Data " +data.name+ " from " +data.from+ " to " +data.to);
					this.server.to('webclient').to(data.to).emit('order', data);
				}
			}.bind(this));
		}.bind(this));

		this.server.listen(this.server_port);
		logger.info("Server started at "+this.ip_port);
	}

	/**
	 * Send Network
	 */
	Server.prototype.sendNetwork = function(){
		// logger.info("Message sent to webclient !");
		// logger.info(this.network);
		this.server.to('webclient').emit('order', {
			to: 'webclient',
			name: 'reseau',
			params: {
				network: this.network
			},
			from: 'server'
			});
	}

	/**
	 * Launch the robot
	 */
	Server.prototype.spawn = function(params) {
		var prog = params.prog;
		if(!this.utcoupe[prog]) {
			switch(prog) {
				case 'ia':
					this.progs[prog] = spawn('node', ['./ia/main.js', params.color, params.nb_erobots, params.EGR_d, params.EPR_d]);
				break;
				case 'pr':
					//this.progs[prog] = spawn('ssh', ['igep', '/root/main.sh']);
                    //todo launch remote client
					this.progs[prog] = spawn('node', ['./clients/Robot/main_tibot.js']);
				break;
				case 'gr':
					this.progs[prog] = spawn('node', ['./clients/Robot/main_grobot.js']);
				break;
				case 'hokuyo':
					this.progs[prog] = spawn('node', ['./hokuyo/client_hok.js']);
				break;
				case 'lidar':
					this.progs[prog] = spawn('node', ['./lidar/main.js'/*, params.color, params.nb_erobots, params.EGR_d, params.EPR_d*/]);
				break;
			}

			logger.info("[Launch]"+prog);


			this.progs[prog].on('error', function (prog, err) {
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: {
						head: '[ERROR]['+prog+'](code:'+err.code+')',
						text: convert.toHtml(JSON.stringify(err))
					},
					from: 'server'
				});
			}.bind(this, prog));
			this.progs[prog].on('close', function (prog, code) {
				logger.error("[CLOSE]"+prog);
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					// params: '[CLOSE]['+prog+'] '+data.toString(),
					params: {
						head: '[CLOSE]['+prog+'](code:'+code+')',
						text: " "
					},
					from: 'server'
				});
				this.kill(prog);
			}.bind(this, prog));

			this.progs[prog].stdout.on('data', function (prog, data) {
				// logger.debug(data);
				// for(var i in data) {
				// 	if(data[i] == 5)
				// 		logger.debug('LOL');
				// }
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: {
						head: '['+prog+'][stdout]',
						text: convert.toHtml(data.toString())
					},
					from: 'server'
				});
			}.bind(this, prog));
			this.progs[prog].stderr.on('data', function (prog, data) {
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: {
						source: '['+prog+'][stderr]',
						text: convert.toHtml(data.toString())
					},
					from: 'server'
				});
			}.bind(this, prog));

				// logger.debug(prog);
				// logger.fatal(prog, '|stdout|', data.toString());
			this.utcoupe[prog] = true;
		}
		this.sendUTCoupe();
	}

	/**
	 * Stops all
	 *
	 * @param {string} prog
	 */
	/* replaced by kill
	Server.prototype.stop = function(prog) {
		if (prog == "pr" || prog == "gr") {
            logger.info("Stopping pr client properly");
            this.server.to(prog).emit('order', {
                to: prog,
                name: 'stop',
                params: "",
                from: 'server'
            });
		} else if (prog == "hokuyo") {
			this.progs[prog] = spawn('ssh', ['raspi', 'pkill', 'node']);
		}
		if(this.utcoupe[prog]) {
			// this.progs[prog].kill();
			// logger.info("stopped "+prog);
			this.utcoupe[prog] = false;
		}
		this.sendUTCoupe();
	}*/

	/**
	 * Kill the programm
	 * 
	 * @param {String} prog programm to kill
	 */
	 Server.prototype.kill = function (prog) {
		console.warn("server:kill not coded!");
		if(this.utcoupe[prog]) {
			// this.progs[prog].kill();
			// logger.info("stopped "+prog);
			this.server.to(prog).emit('order', {
                to: prog,
                name: 'kill',
                params: "",
                from: 'server'
            });
			this.utcoupe[prog] = false;
		}
		this.sendUTCoupe();
	 }

	/**
	 * sendUTCoupe
	 *
	 * @param {string} prog
	 */
	Server.prototype.sendUTCoupe = function(prog) {
		this.server.to('webclient').emit('order', {
			to: 'webclient',
			name: 'utcoupe',
			params: this.utcoupe,
			from: 'server'
		});
	}

	return Server;
})();
