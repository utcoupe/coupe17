	var socket;
	var server_host = 'http://'+(!!window.location.host?window.location.host:'localhost')+':3128';
	var reload_timeout;

	function error(msg, reload) {
		// Reload the page if needed
		if(!!reload) {
			reload_timeout = setTimeout(function(){ location.reload(true); }, 5000);
			msg += '<br /><br />This page will reload automatically every five seconds.';
		}

		// Writing error message
		$('#web_client').html('<p class="error" ><strong>Error</strong>: '+msg+'</p>');
	}

	function error_serverNotFound() {
		error('server not found at '+server_host+'.<br />Please make sure the server is running.', false);
	}
	function error_serverTimeout() {
		error('server timed out.<br />Please make sure the server is running.', false);
	}
	function error_socketIoNotFound() {
		error('socket.io.js not found.<br />Please make sure you are in server/web_client folder.', false);
	}

	if(io == undefined) {
		error_socketIoNotFound();
	} else {
		socket = io(server_host);
		if(socket.disconnected)
			error_serverNotFound();

		socket.on('connect', function(){
			clearTimeout(reload_timeout);
			socket.emit('type', 'web_client');
			socket.emit('order', {to:'motors',pwm1:255,pwm2:255});

			// Lunching the web client
			$('#web_client').html('Hello, you\'re actually connected to the server!'); // Temp
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
	}
