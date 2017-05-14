/**
 * Classe implémentant l'asservissement en mode réel.
 *
 * @module clients/Asserv/AsservReal
 * @requires module:clients/Asserv/Asserv
 */

"use strict";

const Asserv = require('./asserv');
const SerialPort = require('serialport');
const defineParser = require('../shared/defineparser');
const fs = require('fs');

/**
 * Classe implémentant l'asservissement en mode réel
 *
 * @memberof module:clients/Asserv/AsservReal
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservReal extends Asserv{

	constructor(client, robotName, fifo){
		super(client, robotName, fifo);
        //todo keep it ?
		this.DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable
		// this.sendStatus = sendStatus;
		this.currentId = 0;
        this.ordersCallback = [];

        this.asservCommands = {};
        this.parseParameterFile(process.env.UTCOUPE_WORKSPACE + "/arduino/common/asserv/protocol.h");

        // Serial port stuff, creation and binding callbacks
        // Ready means that the serial port is open
        this.serialPortReady = false;
        // Connected means that the node has started the device through serial port
        this.serialPortConnected = false;
        //todo todo todo !!!!
        this.serialPort = new SerialPort("/dev/ttyUSB0", {
            baudrate: 57600,
            parser:SerialPort.parsers.readline("\n")
        });
        this.serialPort.on("data", function(data){
            if(this.serialPortReady == false){
                this.serialPortReady = true;
                //todo
                // this.sendStatus();
            }
            this.parseCommand(data.toString());
        }.bind(this));
        this.serialPort.on("error", function(data){
            this.logger.debug("Serial port error : " + data.toString());
        }.bind(this));
        this.serialPort.on("close", function(){
            this.serialPortReady = false;
            this.serialPortConnected = false;
            //todo
            // this.sendStatus();
            this.logger.error("Serial port close");
        }.bind(this));
	}

    //filename is the name + the path of the file
    parseParameterFile(filename) {
        fs.stat(filename, function(err) {
            if(err == null) {
                this.asservCommands = defineParser(filename.toString());
            } else {
                this.logger.error("Try to parse parameter file " + filename + ", but an error ocured : " + err.code);
            }
        }.bind(this));
    }

    //add the id at the second position, orderToSend is the string to send to the actuator
    addOrderId(orderToSend) {
        this.currentId++;
        return (orderToSend.slice(0, 2) + this.currentId + ";" + orderToSend.slice(2))
    }

    //call the callback corresponding to the received order id, stored in ordersCallback
    callOrderCallback(orderId, params) {
        for (var index = 0; index < this.ordersCallback.length; index++) {
            if (this.ordersCallback[index][0] == orderId) {
                // Call the callback
                if (this.ordersCallback[index][1] != null) {
                    this.ordersCallback[index][1](params);
                } else {
                    this.logger.info("Callback for order " + orderId + " is null...");
                }
                // Remove the line from the array
                this.ordersCallback.splice(index, 1);
            }
        }
    }

    parseCommand(receivedCommand){
        if (!this.serialPortConnected) {
            //todo robot+"_others"
            // If not connected, wait the ID of the arduino before doing something else
            if (receivedCommand.toString() == "pr_asserv\r") {
                //todo find a way to make it proper
                // this.serialPortConnected = true;
                // this.sendOrder(this.actuatorCommands.START, 0, null);
                // Reimplement what this.sendOrder does, because the flag used to send data is set by this function...
                var order = this.asservCommands.START + ";\n";
                order = this.addOrderId(order);

                // this.ordersCallback.push([this.currentOrderId, function(params) {
                //     this.logger.info("Get arduino ack, serial port is now connected");
                //     this.serialPortConnected = true;
                // }.bind(this)]);

                // sendCommand(cmd, args, wait_for_id, callback, no_fifo)
                // this.sendCommand(this.asservCommands.START, [], true, function (params) {
                //         this.logger.info("Get arduino ack, serial port is now connected");
                //         this.serialPortConnected = true;
                // }.bind(this), false);

                this.ordersCallback.push([this.currentId, function(params) {
                    this.logger.info("Get arduino ack, serial port is now connected");
                    this.serialPortConnected = true;
                }.bind(this)]);

                // this.logger.info(order);
                // this.serialPort.write(order);
            } else {
                //todo find a way to not duplicate
                this.logger.info(receivedCommand.toString());
                //todo ";" as protocol separator
                if (receivedCommand.indexOf(";") == 1) {
                    // It's an order response
                    //todo ";" as protocol separator
                    var splittedCommand = receivedCommand.split(";");
                    this.callOrderCallback(parseInt(splittedCommand[0]), splittedCommand.slice(0, 2));
                }
            }
        } else {
            // Check if the received command is a debug string or a response from an order
            //todo ";" as protocol separator
            if (receivedCommand.indexOf(";") == 1) {
                // It's an order response
                //todo ";" as protocol separator
                var splittedCommand = receivedCommand.split(";");
                this.callOrderCallback(parseInt(splittedCommand[0]), splittedCommand.slice(0, 2));
            } else {
                // It's a debug string
                this.logger.info(receivedCommand.toString());
            }
        }



        //
        // var datas = data.split(';');
        // var cmd = datas.shift();//, id = datas.shift();
        // if(cmd == this.asservCommands.AUTO_SEND && datas.length >= 4) { // periodic position update
        //     var lastFinishedId = parseInt(datas.shift()); // TODO
        //     this.Pos({
        //         x: parseInt(datas.shift()),
        //         y: parseInt(datas.shift()),
        //         a: this.myParseFloat(datas.shift())
        //     });
        //     this.sendPos();
        //     // this.logger.debug(lastFinishedId);
        //     if(this.currentId != lastFinishedId) {
        //         // this.logger.fatal('finish id', lastFinishedId);
        //         this.currentId = lastFinishedId;
        //         var use_fifo = this.use_fifo;
        //         this.use_fifo = true;
        //         this.callback();
        //         if(use_fifo)
        //             this.fifo.orderFinished();
        //     }
        // }
        //
        //
        // else if(cmd == this.order_sent) {
        //     this.order_sent = '';
        //     // this.logger.debug('finish', datas.shift());
        //     if(!this.wait_for_id) {
        //         var use_fifo = this.use_fifo;
        //         this.use_fifo = true;
        //         this.callback();
        //         if(use_fifo)
        //             this.fifo.orderFinished();
        //     }
        // }
    }

    /**
     * Sends Command
     *
     * @param {string} cmd
     * @param {string} args
     * @param {int} wait_for_id
     * @param {Object} [callback]
     * @param {boolean} no_fifo
     */
    sendCommand(cmd, args, wait_for_id, callback, no_fifo){
        // Send the order on serial port, with correct format
        // function nextOrder() {
        //     if(callback === undefined)
        //         callback = function(){};
        //     this.callback = callback;
        //     args = args || [];
        //     this.order_sent = cmd;
        //     this.wait_for_id = wait_for_id;
        //     this.logger.debug([cmd,this.currentId+1].concat(args).join(";")+"\n");
        //     this.serialPort.write([cmd,this.currentId+1].concat(args).join(";")+"\n");
        // }
        // Handles FIFO management
        // this.use_fifo = !no_fifo;
        // if(this.use_fifo) {
        //     this.fifo.newOrder(nextOrder.bind(this), 'sendCommandAsserv('+cmd+':'+args+')');
        // } else {
        //     nextOrder.call(this);
        // }

        if (this.serialPortConnected) {
            args = args || [];
            // var order = cmd + ";" + servoId + ";" + args + "\n";
            var order = [cmd,this.currentId+1].concat(args).join(";")+"\n";
            this.ordersCallback.push([this.currentId, callback]);
            this.logger.info(order);
            this.serialPort.write(order);
        } else {
            this.logger.error("SerialPort is not connected...");
        }

    }

    /********************************************************************\
     *
     *  ORDERS FUNCTIONS
     *
    /********************************************************************/

    /**
     * Set Vitesse
     *
     * @param {int} v Speed
     * @param {float} r Rotation
     * @param {Object} callback
     */
    setVitesse(v, r, callback) {
        // this.logger.debug(myWriteFloat(r));
        this.sendCommand(this.asservCommands.SPDMAX, [
            parseInt(v),
            this.myWriteFloat(r)
        ], false, callback);
    }

    /**
	 * Sets Position
	 *
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	setPos(pos, callback) {
		this.logger.debug(pos);
		// if(pos.color !== undefined)
		// 	this.color = pos.color;
		this.sendCommand(this.asservCommands.SET_POS, [
			parseInt(pos.x),
			parseInt(pos.y),
			this.myWriteFloat(pos.a)
		], false, callback);
	}

	/**
	 * Set position calage
	 *
	 * @param {Object} pos
	 * @param {Object} callback
	 */
	setPosCalage(pos, callback) {
		this.sendCommand(this.asservCommands.SET_POS, [
            parseInt(pos.x),
            parseInt(pos.y),
            this.myWriteFloat(pos.a)
		], false, function() {
			callback();
			this.fifo.orderFinished();
		}.bind(this), true);
	}

		/**
	 * Calage X
	 *
	 * @param {int} x
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageX(x, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: x, y: this.pos.y, a: a}, callback);
		}.bind(this), 'calageX');
	}
	/**
	 * Calage Y
	 *
	 * @param {int} y
	 * @param {int} a Angle
	 * @param {Object} callback
	 */
	calageY(y, a, callback) {
		if(callback === undefined)
			callback = function(){};
		this.fifo.newOrder(function() {
			this.setPosCalage({x: this.pos.x, y: y, a: a}, callback, true);
		}.bind(this), 'calageY');
	}

	// For float
	/**
	 * My write float
	 *
	 * @param {float} f
	 */
	myWriteFloat(f){ return Math.round(f*this.asservCommands.FLOAT_PRECISION); }

	/**
	 * My Parse float
	 *
	 * @param {float} f
	 */
	myParseFloat(f){ return parseInt(f)/this.asservCommands.FLOAT_PRECISION;  }

	/**
	 * Speed ?
	 *
	 * @param {int} l
	 * @param {int} a Angle
	 * @param {int} ms
	 * @param {Object} callback
	 */
	speed(l, a, ms, callback) {
		// this.logger.debug(myWriteFloat(r));
		this.sendCommand(this.asservCommands.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	}

	/**
	 * Set Acceleration
	 *
	 * @param {int} acc
	 * @param {Object} callback
	 */
	setAcc(acc,callback) {
		// this.logger.debug(myWriteFloat(r));
		this.sendCommand(this.asservCommands.ACCMAX, [
			parseInt(acc)
		], false, callback);
	}

	/**
	 * Clean
	 *
	 * @param {Object} callback
	 */
	clean(callback){
		this.sendCommand(this.asservCommands.CLEANG, false, callback);
	}

	/**
	 * Pulse Width Modulation
	 *
	 * @param {int} left
	 * @param {int} right
	 * @param {int} ms
	 * @param {Object} callback
	 */
	pwm(left, right, ms, callback) {
		this.sendCommand(this.asservCommands.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true, callback);
	}

	/**
	 * Go X Y
	 *
	 * @param {int} x
	 * @param {int} y
	 * @param {string} sens
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goxy(x, y, sens, callback, no_fifo){
        //todo sens in english
		if(sens == "avant") sens = 1;
		else if(sens == "arriere") sens = -1;
		else sens = 0;

		this.sendCommand(this.asservCommands.GOTO, [
			parseInt(this.convertColorX(x)),
			parseInt(this.convertColorY(y)),
			sens
		], true, callback, no_fifo);
	}

	/**
	 * Go Angle
	 *
	 * @param {int} a
	 * @param {Object} callback
	 * @param {boolean} no_fifo
	 */
	goa(a, callback, no_fifo){
		// this.clean();
		this.sendCommand(this.asservCommands.ROT, [
			myWriteFloat(this.convertColorA(a))
		], true, callback, no_fifo);
	}

    /**
	 * Set P I D
	 * @param {float} p
	 * @param {float} i
	 * @param {float} d
	 * @param {Object} callback
	 */
	setPid(p, i, d, callback){
		// this.clean();
		this.sendCommand(this.asservCommands.PIDALL, [
			this.myWriteFloat(p),
            this.myWriteFloat(i),
            this.myWriteFloat(d)
		],false, callback);
	}
}

module.exports = AsservReal;
