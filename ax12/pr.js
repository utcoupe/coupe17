var log4js = require('log4js');
var logger = log4js.getLogger('clientpr.acts');

var five = require("johnny-five");
var board = new five.Board();//{repl: false});

stepper = new five.Stepper({
	type: five.Stepper.TYPE.FOUR_WIRE,
	stepsPerRev: 200,
	pins: [ 8, 9, 10, 11 ]
});