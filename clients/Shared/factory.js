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

        // Last step, detects devices
        this.detectArduino();

        setTimeout(this.closeAllPorts.bind(this), 3000);
    }

    //force to return a simulated object
    //type is the same as createObject
    //todo
    forceSimulation(type) {
        // this.logger.info("Force simulation of " + type + " (not active yet)");
        // console.log(this.openedSerialPort);
    }

    //type can be asserv, servo, ax12 or hokuyo
    createObject(type) {
        var returnedObject;
        switch (type) {
            case "asserv" : {
                break;
            }
            case "servo" : {
                break;
            }
            case "ax12" : {
                break;
            }
            case "hokuyo" : {
                break;
            }
            default:
                this.logger.error("Type " + type + " can not be build by the factory, it does not exists");
        }
    }

    //open all serial devices and set a callback, waiting to receive data in order to set the devicePortMap
    detectArduino() {
        SerialPort.list(function (err, ports) {
            for(var currentPort in ports) {
                this.openedSerialPort[currentPort] = new SerialPort(ports[currentPort].comName, { baudrate: 57600, parser: SerialPort.parsers.readline('\n') });

                // this.openedSerialPort[currentPort].on('open', function (currentPort) {
                // }.bind(this, currentPort));

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

    closeAllPorts() {
        for (var port in this.openedSerialPort) {
            this.openedSerialPort[port].close();
        }
        if (this.factoryReadyCallback !== undefined) {
            this.factoryReadyCallback();
        }
    }
}

// Export an object, to make it unique in the system
// module.exports = new Factory();
module.exports = function(robotName, callback) {
    return new Factory(robotName, callback);
};