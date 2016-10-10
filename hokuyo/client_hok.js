// TODO :
// 		  message/objet erreur ou pas ?

(function (){
	"use strict";

	/* JS which will connect to the server, and then
	*  will execute the C program to control the Hokuyos.
	*  It will transfer datas from the C Hokuyo controller to AI
	*/

	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');
	var spawn = require('child_process').spawn;
	var fs = require('fs');
	var match_name  = "";
	var child_process = require('child_process');
	var child;
	var SocketClient = require('../server/socket_client.class.js');
	var config = require('../config.js');
	var lastT = Date.now();
	var startingT = lastT;

	var FREQ_ENVOI_INFO = 50; // tous les 10 infos (genre 1 seconde)
	var nth = 0;

	var server = process.argv[2] || config.server;
	var command = process.argv[3] || config.hokuyo_command;

	var client = new SocketClient({
		server_ip: server,
		type: "hokuyo",
	});

	var started = false;
	var nb_active_hokuyos = -1;
	var lastStatus = {
		"status": "waiting"
	};
	sendChildren(lastStatus);

	logger.info("Starting with pid " + process.pid);

	client.order(function(from, name, params){
		var now = Date.now();
		logger.info("Time since last order : "+(now - lastT));
		if (now - lastT > 500) { // half a second between two orders
			logger.info("Just received an order `" + name + "` from " + from + " with params :");
			logger.info(params);

			lastT = now;
			switch (name){
				case "start":
					if(!!params.color && !started) {
						started = true;
						start(params.color);
					} else
						logger.error("ALready started or Missing parameters !");
					break;
				case "shutdown":
					quitC("stop");
					spawn('sudo', ['halt']);
					break;
				case "stop":
					started = false;
					quitC("stop");
					break;
				case "sync_git":
					spawn('/root/sync_git.sh', [], {
						detached: true
					});
					break;
				default:
					logger.warn("Name not understood : " + data);
			}
		} else {
			logger.warn("Received two orders too closely !");
		}
	});

	function matchLogger(name, line){
		fs.appendFile('/var/log/utcoupe/'+name+'.log', line+'\n', function (err) {
			if (err) logger.error('Ecriture dans le fichier de log de match "/var/log/utcoupe/'+name+'.log" impossible');
			// logger.debug('The "data to append" was appended to file!');
		});
	}

	function quitC(code){
		if(!!child){
			logger.info("Closing child "+child.pid+" at "+code);
			child.kill('SIGINT');
			child = null;
		} else {
			logger.info("Can't close child at "+code+" : never born :P");
			logger.info("Father's pid : " + process.pid);
			// process.kill(process.pid, 'SIGINT');
		}
	}

	function uException(code){
		logger.error("uException sent with code "+code);
	}

	function start(color){
		// We just an order to start, with the flavour :P (color, number of robots)

		sendChildren({"status": "starting"});

		// Generates the match name (for the log file)
		var tmp = new Date();
		match_name = tmp.toJSON().replace(/T/, ' ').replace(/\..+/, '');
		var now = Date.now() - lastT;
		matchLogger(match_name, now+"; color:"+color);
		now = lastT;

		// If there's a child, kill it
		quitC("start");

		// Exit handlers
		//do something when app is closing
		process.on('exit', quitC);
		// catches ctrl+c event
		// process.on('SIGINT', quitC);
		//catches uncaught exceptions
		//process.on('uncaughtException', uException);

		// Functions
		function parseRobots(string) {
			var dots = [];
			now = Date.now() - lastT;

			if(!!string){
				var temp = string.split("#");
				for (var i = 0; i <= temp.length - 1; i++) {
					temp[i] = temp[i].split(",");
					dots.push({x: 0, y: 0});
					dots[i].x = parseInt(temp[i][0]);
					dots[i].y = parseInt(temp[i][1]);

					// Log them :
					matchLogger(match_name, now+"; dotx:"+dots[i].x+"; doty:"+dots[i].y);
				}
				logger.info('[J-HOK] Robots');
				logger.info(dots);
			} else {
				logger.info('[J-HOK] No robot detected !');
			}

			now = lastT;

			// Send all robots
			client.send("ia", "hokuyo.position_tous_robots", {dots: dots});
		}

		function parseInfo(string) {
			logger.info("Read info...");
			// logger.info(string);

			var prev_n_a_h = nb_active_hokuyos;

			now = Date.now() - lastT;

			switch (string.substring(0,1)){
				case "0":
					// Send error : no Hokuyo working
					// client.send("ia", "nb_hokuyo", {nb: 0});
					nb_active_hokuyos = 0;
					break;
				case "1":
					// Send warning : one Hokuyo is missing
					// client.send("ia", "nb_hokuyo", {nb: 1});
					nb_active_hokuyos = 1;
					break;
				case "2":
					// Send message : Hokuyos are ok
					// client.send("ia", "nb_hokuyo", {nb: 2});
					nb_active_hokuyos = 2;
					break;
				default:
					logger.info("Error not understood : " + string);
					return;
			}

			if ((prev_n_a_h != nb_active_hokuyos) || (nth == FREQ_ENVOI_INFO)){
				logger.info("Info sent to server");
				sendChildren(getStatus());
				nth = 0;
			}

			matchLogger(match_name, now+"; nb_hokuyo:"+nb_active_hokuyos);
			now = lastT;
			nth += 1;
		}

		function dataFromCHandler(input) {
			// input format (XXXX type and xxxx values) : "[XXXX]xxxxxxxxx" maybe many times, seperated with \n

			var inputAr = input.toString().split('\n');
			
			for (var i = 0; i <= inputAr.length - 1; i++) {
				if (!!inputAr[i]){
					switch (inputAr[i].substring(1,5)){
						case "HI:)":
							// send "C started" to server
							logger.info('C Hokuyo software says "Hi !" :)');
							sendChildren({"status": "starting"});
							break;
						case "DATA":
							logger.info('C Hokuyo software sends datas');
							parseRobots(inputAr[i].substring(6));
							break;
						case "INFO":
							logger.info('C Hokuyo software sends information :'+inputAr[i].substring(6));
							parseInfo(inputAr[i].substring(6));
							break;
						case "WARN":
							logger.warn('C Hokuyo software sends a warning :'+inputAr[i].substring(6));
							parseInfo(inputAr[i].substring(6));
							break;
						default:
							logger.info("Data "+ inputAr[i].substring(1,5) + " not understood at line " + i + " : " + inputAr[i]);
					}
				}
			}
		}


		// Execute C program
		// var command = "/home/pi/coupe15/hokuyo/bin/hokuyo";
		var args = [color];
		// var options = // default : { cwd: undefined, env: process.env};
		logger.info('Launching : ' + command + ' ' + args);
		child = child_process.spawn(command, args);

		// Events
		child.stdout.on('data', function(data) {
			logger.debug(data.toString());
			dataFromCHandler(data);
		});

		child.on('error', function(data) {
			logger.fatal('Erreur avec le process C : ' + data.toString());
			sendChildren({"status": "error", "children":[]});
			setTimeout(function(){
				sendChildren({"status": "waiting", "children":[]});
			}, 5000);
		});

		child.stderr.on('error', function(data) {
			logger.fatal(data.toString());
			sendChildren({"status": "error", "children":[]});
			setTimeout(function(){
				sendChildren({"status": "waiting", "children":[]});
			}, 5000);
		});

		child.stderr.on('data', function(data) {
			logger.error(data.toString());
		});
		
		
		child.on('close', function(code) {
			started = false;
			if (code == 0)
				logger.info('Child closed correctly');
			else
				logger.error('Child closed with code: ' + code);

			// Send message
			if (code != -1)
				sendChildren({"status": "waiting", "children":[]});
		});
	}

	function getStatus(){
		var data = {
			"status": "",
			"children": []
		};
		
		switch (nb_active_hokuyos){
			case 0:
				data.status = "error";
				break;
			case 1:
				data.status = "ok";
				data.children =  ["Lonesome hokuyo"];
				break;
			case 2:
				data.status = "everythingIsAwesome";
				data.children =  ["Hokuyo 1", "Hokuyo 2"];
				break;
		}

		return data;
	}


	// Sends status to server
	function sendChildren(status){
		lastStatus = status;

		client.send("server", "server.childrenUpdate", lastStatus);
		client.send("ia", "hokuyo.nb_hokuyo", { nb: nb_active_hokuyos });
	}

	function isOk(){
		if(lastStatus.status != "waiting")
			lastStatus = getStatus();
		
		client.send("ia", "isOkAnswer", lastStatus);
		client.send("server", "server.childrenUpdate", lastStatus);
		client.send("ia", "hokuyo.nb_hokuyo", { nb: nb_active_hokuyos });
	}
})();
