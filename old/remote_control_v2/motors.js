// /!\ CODE A LARRACHE /!\

var five = require("johnny-five"), 
	board = new five.Board();
var motor;
var motor2;
board.on("ready", function() {
  motor = new five.Motor([3, 12]);
  motor2 = new five.Motor([11, 13]);
  motor.forward(0);
  motor2.reverse(0);
});

var server_ip = '127.0.0.1:3128';

// Creating the connexion with the server
var socket = require('socket.io-client')('http://'+server_ip);

function error(msg) {
	// Writing error message
	console.log('Error: '+msg);
}

function error_serverNotFound() {
	error('server not found at '+server_ip+'.\nPlease make sure the server is running.');
}
function error_serverTimeout() {
	error('server timed out.\nPlease make sure the server is running.');
}

socket.on('connect', function(){
	socket.emit('type', 'motors');
	socket.emit('order', {to:'web_client',text:'Hello!'});
	//console.log(socket);

	// Lunching the web client
	console.log('Hello, you\'re actually connected to the server!'); // Temp
});
socket.on('log', function(data){
	console.log('[Server log] '+data);
});
socket.on('disconnect', function(){
	error_serverTimeout();
});
socket.on('order', function(data){
	var pwm1 = data.pwm1;
	if(pwm1 >= 0) motor.reverse(pwm1);
	if(pwm1 < 0) motor.forward(-pwm1);
	var pwm2 = data.pwm2;
	if(pwm2 >= 0) motor2.forward(pwm2);
	if(pwm2 < 0) motor2.reverse(-pwm2);
});

setTimeout(function() {
	if(socket.disconnected)
		error_serverNotFound();
}, 500);