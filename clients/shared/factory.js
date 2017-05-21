//tfuhrman on 13/05/2017

"use strict";

const Log4js = require('log4js');

// For Arduinos
const SerialPort = require('serialport');

// For AX12
const Path = require('path');
const Child_process = require('child_process');
const Byline = require('byline');
const program = Path.normalize("./bin/ax12");


class Factory {
    constructor(robot, callback) {
        this.logger = Log4js.getLogger("factory");
        this.robot = robot;
        this.robotName = this.robot.getName();
        //when factory is ready, call this callback, this is mandatory because of node async way to work
        this.factoryReadyCallback = callback;
        //map of all devices found ("device_name","port")
        this.devicesPortMap = [];
        //list of opened serial port, waiting data to be received to determine if device detected
        this.openedSerialPort = [];
        //flag to know if the factory is ready, if not, can't build any object
        this.factoryReady = false;

        //todo do not launch both at the same time to avoid /dev/ttyX conflicts
        this.detectAx12(function(){
            // Last step, detects devices
            this.detectArduino();
        }.bind(this));

        setTimeout(this.closeAllPorts.bind(this), 5000);
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
                    if (this.devicesPortMap[this.robotName + "_asserv"] !== undefined) {
                        this.logger.info("Asserv is real, arduino detected on port : " + this.devicesPortMap[this.robotName + "_asserv"]);
                        returnedObject = require('../asserv/asserv.real')(this.robot, this.devicesPortMap[this.robotName + "_asserv"]);
                    } else {
                        this.logger.fatal("Asserv is simu");
                        returnedObject = require('../asserv/asserv.simu')(this.robot);
                    }
                    break;
                }
                case "servo" :
                {
                    if (this.devicesPortMap[this.robotName + "_others"] !== undefined) {
                        this.logger.info("Servo is real, arduino detected on " + this.devicesPortMap[this.robotName + "_others"]);
                        returnedObject = require('../actuators/servo.real')(this.robot, this.devicesPortMap[this.robotName + "_others"]);
                    } else {
                        this.logger.fatal("Servo is simu");
                        returnedObject = require('../actuators/servo.simu')(this.robot);
                    }
                    break;
                }
                case "ax12" :
                {
                    this.logger.debug("Ax12 not tested yet !");
                    if (this.devicesPortMap["ax12"] !== undefined) {
                        this.logger.info("AX12 is real, usb2ax detected");
                        returnedObject = require('../actuators/ax12.real')(this.robot, this.devicesPortMap["ax12"]);
                    } else {
                        this.logger.fatal("AX12 is simu");
                        returnedObject = require('../actuators/ax12.simu')(this.robot);
                    }
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
        this.logger.info("Detecting Arduinos...");
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
    detectAx12(callback) {
        this.logger.info("Detecting AX12...");

        var detectionTimeout = setTimeout(() => {
            this.logger.info("AX12 detection timeout");
            callback();
        }, 1000);

        var ax12 = Child_process.spawn(program);

        ax12.on('error', function(err) {
            if(err.code === 'ENOENT'){
                this.logger.fatal("ax12 program executable not found! Is it compiled ? :) Was looking in \""+Path.resolve(program)+"\"");
                process.exit();
            }
            this.logger.error("c++ subprocess terminated with error:", err);
            console.log(err);
        }.bind(this));
        ax12.on('exit', function(code, signal) {
            // this.logger.fatal("c++ subprocess terminated with code : "+code + " or signal " + signal);
        }.bind(this));

        ax12.on('error', (code) => {
            this.logger.fatal("c++ subprocess error with code:"+code);
        });

        process.on('exit', function(){ //ensure child process is killed
            if(ax12.connected){ //and was still connected (dont kill another process)
                ax12.kill();
            }
        });

        var stdout = Byline.createStream(ax12.stdout);
        stdout.setEncoding('utf8')
        stdout.on('data', function(data) {
            // this.logger.debug("ax12 just gave : "+data);
            // If not connected, wait the ID of the arduino before doing something else

            if (data.indexOf("ax12") == 0) {
                this.devicesPortMap["ax12"] = "I don't know";
                clearTimeout(detectionTimeout)
                ax12.kill();
                this.logger.info("AX12 detection end");
                callback();
            }
        }.bind(this));

        ax12.stderr.on('data', function(data) {
            // this.logger.error("stderr :"+data.toString());
        }.bind(this));
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
