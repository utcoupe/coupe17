"use strict";

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
}