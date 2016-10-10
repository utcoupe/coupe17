var five = require("johnny-five"), 
    board = new five.Board();

board.on("ready", function() {
  var motor = new five.Motor([3, 12]);
  var motor2 = new five.Motor([11, 13]);
  motor.reverse(255);
  motor2.forward(255);
});