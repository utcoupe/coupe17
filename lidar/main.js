(function (){
	"use strict";

	var log4js = require('log4js');
	var logger = log4js.getLogger('lidar');
	var SocketClient = require('../server/socket_client.class.js');
	var Lidar = require('./lidar.class.js');

	var server = process.argv[2] || config.server;

	var client = new SocketClient({
		server_ip: server,
		type: "lidar",
	});

	var started = false;
	// var nb_active_hokuyos = -1;
	var lastStatus = {
		"status": "waiting"
	};
	// sendChildren(lastStatus);

	logger.info("Starting with pid " + process.pid);

	var hokMng = new Lidar(function (name, params){
		client.send("ia", name, params);
	});

	client.connect(function(){

		client.send("lidar", "hokuyo.polar_raw_data", {
			hokuyo: "one",
			polarSpots: [
				[ -40, 200 ],
				[ -35, 200 ],
				[ -30, 200 ],
				[ -25, 230 ],
				[ -20, 100 ],
				[ -15, 105 ],
				[ -5, 120 ],
				[ 0, 100 ],
				[ 5, 90 ],
				[ 10, 95 ],
				[ 15, 100 ],
				[ 20, 100 ],
				[ 25, 130 ],
				[ 30, 135 ]
			]
		}); // TMP

		setTimeout(function() {
			client.send("lidar", "hokuyo.polar_raw_data", {
				hokuyo: "two",
				polarSpots: [
					[ -40, 155 ],
					[ -30, 155 ],
					[ -35, 150 ],
					[ -25, 150 ],
					[ -20, 100 ],
					[ -15, 105 ],
					[ -5, 120 ],
					[ 0, 100 ],
					[ 5, 90 ],
					[ 10, 95 ],
					[ 15, 100 ],
					[ 20, 100 ],
					[ 25, 230 ],
					[ 30, 235 ]
				]
			}); // TMP
		}, 100);


		client.order(function(from, name, params){
			if (name == 'hokuyo.polar_raw_data') {
				hokMng.onHokuyoPolar(params.hokuyo, params.polarSpots);
			}
			// var now = Date.now();
			// logger.info("Time since last order : "+(now - lastT));
			// if (now - lastT > 500) { // half a second between two orders
			//	logger.info("Just received an order `" + name + "` from " + from + " with params :");
			//	logger.info(params);

			//	lastT = now;
			//	switch (name){
			//		case "start":
			//			if(!!params.color && !started) {
			//				started = true;
			//				logger.info("Receive order to start");
			//				start(params.color);
			//			} else
			//				logger.error("ALready started or Missing parameters !");
			//			break;
			//		case "shutdown":
			//			quitC("stop");
			//			spawn('sudo', ['halt']);
			//			break;
			//		case "stop":
			//			started = false;
			//			quitC("stop");
			//			break;
			//		case "sync_git":
			//			spawn('/root/sync_git.sh', [], {
			//				detached: true
			//			});
			//			break;
			//		default:
			//			logger.warn("Name not understood : " + data);
			//	}
			// } else {
			//	logger.warn("Received two orders too closely !");
			// }
		});
	});

	// function matchLogger(name, line){
	//	fs.appendFile('/var/log/utcoupe/'+name+'.log', line+'\n', function (err) {
	//		if (err) logger.error('Ecriture dans le fichier de log de match "/var/log/utcoupe/'+name+'.log" impossible');
	//		// logger.debug('The "data to append" was appended to file!');
	//	});
	// }

	function start(color){

		// sendChildren({"status": "starting"});
	}

	// function getStatus(){
	//	var data = {
	//		"status": "",
	//		"children": []
	//	};

	//	switch (nb_active_hokuyos){
	//		case 0:
	//			data.status = "error";
	//			break;
	//		case 1:
	//			data.status = "ok";
	//			data.children =  ["Lonesome hokuyo"];
	//			break;
	//		case 2:
	//			data.status = "everythingIsAwesome";
	//			data.children =  ["Hokuyo 1", "Hokuyo 2"];
	//			break;
	//	}

	//	return data;
	// }


	// // Sends status to server
	// function sendChildren(status){
	//	lastStatus = status;

	//	client.send("server", "server.childrenUpdate", lastStatus);
	//	client.send("ia", "hokuyo.nb_hokuyo", { nb: nb_active_hokuyos });
	// }

	// function isOk(){
	//	if(lastStatus.status != "waiting")
	//		lastStatus = getStatus();

	//	client.send("ia", "isOkAnswer", lastStatus);
	//	client.send("server", "server.childrenUpdate", lastStatus);
	//	client.send("ia", "hokuyo.nb_hokuyo", { nb: nb_active_hokuyos });
	// }
})();
