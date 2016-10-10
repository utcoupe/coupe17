
function App() {
	this.div = $('#web_client');
	this.w;
	this.h;

	// Initializing the window
	this.div.css({
		position: 'absolute',
		top: 0,
		left: 0
	});
	this.computeSize();
};

App.prototype.computeSize = function() {
	this.w = $(window).width();
	this.h = $(window).height();
	this.div.css({
		width: this.w,
		height: this.h
	})
}

var app = new App();
var w = app.w;
var h = app.h;

var myElement = document.getElementById('web_client');
var mc = new Hammer(myElement);
mc.on("panleft panright tap press", function(ev) {
    var x = ev.center.x;
    var y = ev.center.y;
    var decalage = 255*(x-w/2)/(w/2);
    var pwm = (h/2-y)/(h/2);
    var data = {
    	to: 'motors',
    	pwm1: 255 - decalage,
    	pwm2: 255 + decalage
    };
    if(data.pwm1 > 255) data.pwm1 = 255;
    if(data.pwm2 > 255) data.pwm2 = 255;
    data.pwm1 *= pwm;
    data.pwm2 *= pwm;
    socket.emit('order', data);
});