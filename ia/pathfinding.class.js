module.exports = (function () {
	"use strict";

	var Path = require('path');

	var programm = Path.normalize("./pathfinding/bin/pathfinding");
	var image = Path.normalize("./pathfinding/img/map-20mm-yellow.bmp");
	var RATIO = 20;
	var SEPARATOR = ";";

	var logger = require('log4js').getLogger('ia.pathfinding');
	var Child_process = require('child_process');
	var Byline = require('byline');

	function Pathfinding(ia) {
		this.ia = ia;
		var fifo = [];

		/*var instance_pkill = Child_process.spawn("pkill", ["pathfinding"]);
		instance_pkill.on('error', function(err){
			logger.error("error pkilling pathfinding code:"+err.code);
		});
		instance_pkill.on('exit', function(code){
			logger.info("successfully pkilled all old instances of pathfinding");
		});


		var instance = Child_process.spawn(programm, [ image ]);*/
		var instance = Child_process.spawn("bash", ["-c", "pkill pathfinding;"+programm+" "+image]);

		instance.on('error', function(err) {
			if(err.code === 'ENOENT'){
				logger.fatal("pathfinding programm executable not found! Is it compiled ? :) Was looking in \""+Path.resolve(programm)+"\"");
				process.exit();
			}
			logger.error("c++ subprocess terminated with error:", err);
			console.log(err);
		});
		instance.on('exit', function(code) {
			logger.fatal("c++ subprocess terminated with code:"+code);
		});



		process.on('exit', function(){ //ensure child process is killed
			if(instance.connected){ //and was still connected (dont kill another process)
				instance.kill();
			}
		});

		var stdout = Byline.createStream(instance.stdout);
		stdout.setEncoding('utf8')
		stdout.on('data', function(data) {
			logger.debug("Received: "+data);
			parse(data);
		});

		instance.stderr.on('data', function(data) {
			logger.error("stderr :"+data.toString());
		});


		function vecMultiply(arr, ratio){
			return arr.map(function(val){
				return Math.round(val*ratio);
			});
		}

		this.sendQuery = function(start, end, cb){
			fifo.push(cb || true);


			var str = ["C"].concat( vecMultiply(start, 1/RATIO) ).concat( vecMultiply(end, 1/RATIO) ).join(SEPARATOR) + "\n";
			instance.stdin.write( str );
			logger.info("Sending:"+str);
		};

		this.sendDynamic = function(objects){
			//X0, Y0, R0, ...
			var str = ["D"].concat(objects.reduce(function(acc, obj){
				return acc.concat( vecMultiply(obj, 1/RATIO) );
			}, [])).join(SEPARATOR) + "\n";
			// logger.debug(str);
			instance.stdin.write(str);
		}

		function parse (data) {
			// X0; Y0; ... Xn; Yn
			var ret = null;
			if(data != "FAIL") {
				var path = [];
				var splitted = data.split(SEPARATOR);
				while(splitted.length > 1){
					path.push( vecMultiply([splitted.shift(), splitted.shift()], RATIO) );
				}

				
				if(path.length > 0) ret = path;
			}

			var callback = fifo.shift();
			callback(ret); // if(typeof callback === "function") 
		}

	}

	Pathfinding.prototype.getPath = function (start, end, callback) {
		this.ia.pathfinding.updateMap();
		this.timeout_getpath = setTimeout(function() {
			callback(null);
			callback = function() {};
		}, 1000);
		this.sendQuery([start.x, start.y], [end.x, end.y], function(path){
			clearTimeout(this.timeout_getpath);
			if(path !== null) {
				path.shift();
				path = path.map(function(val) {
					return {
						x: val[0],
						y: val[1]
					};
				});
			}
			callback(path);
		}.bind(this));
	};

	function borne(x, min, max) {
		return x > max ? max : x < min ? min : x;
	}
	
	//[ [x, y, r], ... ]
	Pathfinding.prototype.updateMap = function () {
		// var objects = [];
		// objects.push();
		var objects = [{
			pos: this.ia.gr.pos,
			d: this.ia.gr.size.d
		}].concat(this.ia.data.dots).concat(this.ia.data.dynamic);


		// logger.debug(objects);

		this.sendDynamic( objects.map(function(val){
			// logger.debug(val);
			return [borne(val.pos.x, 0, 2980), borne(val.pos.y, 0, 1980), 1*((val.d/2)+(this.ia.pr.size.d/2))];
		}.bind(this)) );
	};

	return Pathfinding;
})();

/*
(function(){
	var pathfinding = new module.exports();
	function log(result){
		console.log("RESULT", result);
		process.exit();
	}

	setTimeout(function(){
		pathfinding.getPath([500,1000], [1500, 200], log);
	}, 10);
})();
//*/
