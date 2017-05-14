//tfuhrman on 13/05/2017

"use strict";

const Log4js = require('log4js');
const SerialPort = require('serialport');

class Factory {
    constructor(robotName, callback) {
        this.logger = Log4js.getLogger("factory");
        this.robotName = robotName;
        //when factory is ready, call this callback, this is mandatory because of node async way to work
        this.factoryReadyCallback = callback;
        //map of all devices found ("device_name","port")
        this.devicesPortMap = [];
        //list of opened serial port, waiting data to be received to determine if device detected
        this.openedSerialPort = [];
        //flag to know if the factory is ready, if not, can't build any object
        this.factoryReady = false;

        // Last step, detects devices
        this.detectArduino();
        //todo do not launch both at the same time to avoid /dev/ttyX conflicts
        this.detectAx12();

        setTimeout(this.closeAllPorts.bind(this), 3000);
    }

    //force to return a simulated object
    //type is the same as createObject
    //todo
    forceSimulation(type) {
        this.logger.info("Force simulation of " + type + " (not active yet)");
        // console.log(this.openedSerialPort);
    }

    //type can be asserv, servo, ax12 or hokuyo
    createObject(type) {
        var returnedObject;
        if (this.factoryReady) {
            switch (type) {
                case "asserv" :
                {
                    if (this.devicesPortMap[this.robotName + "_" + type] !== undefined) {
                        this.logger.info("Asserv is real, arduino detected");
                        //todo parameters
                        returnedObject = require('../asserv/asserv.real')();
                    } else {
                        this.logger.fatal("Servo is simu");
                        //todo parameters
                        returnedObject = require('../asserv/asserv.simu')();
                    }
                    break;
                }
                case "servo" :
                {
                    if (this.devicesPortMap[this.robotName + "_others"] !== undefined) {
                        this.logger.info("Servo is real, arduino detected");
                        returnedObject = require('../actuators/servo.real')(this.devicesPortMap[this.robotName + "_others"]);
                    } else {
                        this.logger.fatal("Servo is simu");
                        returnedObject = require('../actuators/servo.simu')();
                    }
                    break;
                }
                case "ax12" :
                {
                    this.logger.info("Ax12 not implemented yet");
                    break;
                }
                default:
                    this.logger.error("Type " + type + " can not be build by the factory, it does not exists");
            }
        } else {
            this.logger.error("Factory is not ready to build " + type);
        }
        return returnedObject;
    }

    //open all serial devices and set a callback, waiting to receive data in order to set the devicePortMap
    detectArduino() {
        SerialPort.list(function (err, ports) {
            // Open each listed serial port and add a callback to detect if it is an arduino
            for(var currentPort in ports) {
                this.openedSerialPort[currentPort] = new SerialPort(ports[currentPort].comName, { baudrate: 57600, parser: SerialPort.parsers.readline('\n') });
                this.openedSerialPort[currentPort].on("data", function (currentPort, data) {
                    if (data.toString().indexOf(this.robotName + "_asserv") != -1) {
                        this.logger.info("Real asserv detected");
                        this.devicesPortMap[this.robotName + "_asserv"] =  ports[currentPort].comName;
                    }
                    else if (data.toString().indexOf(this.robotName + "_others") != -1) {
                        this.logger.info("Real others detected");
                        this.devicesPortMap[this.robotName + "_others"] =  ports[currentPort].comName;
                    } else {
                        this.logger.info("Unknown reception : " + data.toString());
                    }
                }.bind(this, currentPort));
            }
        }.bind(this));
    }

    //todo
    detectAx12() {
        this.logger.info("Detect ax12 is not implemented yet");
    }

    closeAllPorts() {
        for (var port in this.openedSerialPort) {
            this.openedSerialPort[port].close();
        }
        if (this.factoryReadyCallback !== undefined) {
            this.factoryReady = true;
            this.factoryReadyCallback();
        }
    }
}

// Export an object, to make it unique in the system
// module.exports = new Factory();
module.exports = function(robotName, callback) {
    return new Factory(robotName, callback);
};