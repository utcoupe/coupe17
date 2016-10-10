
var spawn = require('child_process').spawn;
var StreamSplitter = require("stream-splitter");

var SocketClient = require('../../../server/socket_client.class.js');
var config = require('../../../config.js');

var client = new SocketClient({
	server_ip: config.server,
	type: "hokuyo",
});

var progC = spawn('./calculate_xy');

progC.on('error', function(data) {
	client.send('ia', 'ia.hokfailed');
	progC = spawn('./calculate_xy');
});
var splitter = progC.stdout.pipe(StreamSplitter('\n'));

var i = 0;
splitter.on("token", function(token) {
    console.log(token.toString().split(';'));
    var dots = token.toString().split(';');
    dots = dots.map(function(val) {
    	return val.split(',').map(function(val){ return parseInt(val); });
    });

   	client.send('ia', 'ia.hok', dots);
});
