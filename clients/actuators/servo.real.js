/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const Servo = require('./servo');
const defineParser = require("../shared/defineparser");
const SerialPort = require('serialport');

//serialPort is defined as /dev/ttyXx
class ServoReal extends Servo {
    constructor(serialPort) {
        super();

        //todo robot name
        this.actuatorCommands = defineParser(process.env.UTCOUPE_WORKSPACE + "/arduino/common/others/protocol.h");
        this.ordersSerial = undefined;
        // Connected means that the node has started the device through serial port
        this.serialPortConnected = false;
        this.serialPort = new SerialPort(serialPort, {
            baudrate: 57600,
            parser : SerialPort.parsers.readline("\n")
        });
        this.serialPort.on("data", function(data){
            this.parseCommand(data.toString());
        }.bind(this));
        this.serialPort.on("error", function(data){
            this.logger.error("Serial port error : " + data.toString());
        }.bind(this));
        this.serialPort.on("close", function(){
            this.serialPortConnected = false;
            //todo
            // this.sendStatus();
            this.logger.debug("Serial port close");
        }.bind(this));
    }

    parseCommand(receivedCommand) {
        if (!this.serialPortConnected) {
            //todo robot+"_others"
            // If not connected, wait the ID of the arduino before doing something else
            if (receivedCommand.indexOf("pr_others") == 0) {
                //todo find a way to make it proper
                var order = [this.actuatorCommands.START,0].join(";")+";\n";
                this.logger.debug(order);
                this.serialPort.write(order);
            } else {
                this.logger.debug(receivedCommand.toString());
                // Trigger on reception of ack from arduino that it has started
                if (receivedCommand.indexOf("0;") == 0) {
                    this.serialPortConnected = true;
                    this.ordersSerial = require("../shared/orders.serial")(this.serialPort);
                }
            }
        }
    }

    moduleArmClose(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_ARM], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleArmOpen(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_ARM, callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }
    
    moduleEngage(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, this.actuatorCommands.PR_MODULE_DROP_R, callback);
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, this.actuatorCommands.PR_MODULE_DROP_L, callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleDrop(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_DROP_R, callback);
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_DROP_L, callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleRotate(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.MODULE_ROTATE, [this.actuatorCommands.PR_MODULE_ROTATE, 1], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    turnOn(callback) {
        if (serialPortConnected) {
            // TODO
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    turnOff(callback) {
        if (serialPortConnected) {
            // TODO something
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    openTrunk(callback) {
        if (serialPortConnected) {
            // TODO something
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    stop() {
        if (this.serialPort.isOpen()) {
            this.ordersSerial.sendOrder(this.actuatorCommands.HALT, function() {
                this.serialPort.close();
                this.logger.info("Asserv real has stopped");
            }.bind(this));
        }
        this.serialPortConnected = false;
    }

}

// Exports an object to be sure to have a single instance in the system
module.exports = function(serialPort) {
    return new ServoReal(serialPort);
};
