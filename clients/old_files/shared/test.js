


var defineParser = require("./defineParser.js");
console.log(defineParser);

var commands = defineParser("./arduino/asserv/protocol.h");


setTimeout(function(){
	console.log(commands);
}, 200);