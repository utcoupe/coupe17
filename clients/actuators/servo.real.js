/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const Servo = require('./servo');
const defineParser = require("../shared/defineparser");
const SerialPort = require('serialport');

//serialPort is defined as /dev/ttyXx
class ServoReal extends Servo {
    constructor(robot, serialPort) {
        super(robot);

        //todo robot name
        this.actuatorCommands = defineParser(process.env.UTCOUPE_WORKSPACE + "/arduino/" + this.robotName + "/others/protocol.h");
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
            if (receivedCommand.indexOf(this.robotName + "_others") == 0) {
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


                    this.logger.debug("INIT movements");
                    if (this.robotName == "pr") {
                        this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_ARM_ROTATE], () => {
                            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_ARM_ROTATE], () => {});
                        });
                        this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_ARM], () => {
                            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_ARM], () => {});
                        });

                        this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_DROP_R], () => {
                            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_DROP_R], () => {});
                        });
                        this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_DROP_L], () => {
                            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_DROP_L], () => {});
                            
                        });
                    }




                }
            }
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

    ////////////////////////////////
    //          PR ORDERS         //
    ////////////////////////////////
    moduleArmStartRotate(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_ARM_ROTATE], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }
    moduleArmStopRotate(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_ARM_ROTATE], callback);
        } else {
            this.logger.error("Serial port not connected...");
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
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_ARM], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleArmInit(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_INIT, [this.actuatorCommands.PR_MODULE_ARM], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }
    
    moduleEngage(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_DROP_R], callback);
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.PR_MODULE_DROP_L], () => {});
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleDrop(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_DROP_R], callback);
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.PR_MODULE_DROP_L], () => {});
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    moduleRotate(callback, params) {
        if (this.serialPortConnected) {
            var color_number = 0;
            if (params.color == "yellow") {
                color_number = 2;
            } else if (params.color == "blue") {
                color_number = 1;
            } else if (params.color == "null") {
                color_number = 0;
            } else {
                this.logger.error("Rotate color " + params + " does not exists");
            }
            this.ordersSerial.sendOrder(this.actuatorCommands.MODULE_ROTATE, [color_number], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    ////////////////////////////////
    //          GR ORDERS         //
    ////////////////////////////////

    turnOnCanon(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.GR_CANON], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    turnOffCanon(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.GR_CANON], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    turnOnSweeper(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.GR_SWEEPER], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    turnOffSweeper(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.GR_SWEEPER], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    launchRocket(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.GR_ROCKET], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    openTrunk(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_OPEN, [this.actuatorCommands.GR_LOADER], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

    closeTrunk(callback) {
        if (this.serialPortConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.SERVO_CLOSE, [this.actuatorCommands.GR_LOADER], callback);
        } else {
            this.logger.error("Serial port not connected...");
        }
    }

}

// Exports an object to be sure to have a single instance in the system
module.exports = function(robot, serialPort) {
    return new ServoReal(robot, serialPort);
};
