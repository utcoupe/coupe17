"use strict";
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
	socket.emit('type', 'web_client');
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
	console.log('[Order to '+data.to+'] '+ data.text);
});

setTimeout(function() {
	if(socket.disconnected)
		error_serverNotFound();
}, 500);