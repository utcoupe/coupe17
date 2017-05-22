/**
 * Created by michelme on 14/05/17.
 */

"use strict";

const Ax12 = require('./ax12');
const Path = require('path');
const Child_process = require('child_process');
const Byline = require('byline');
const defineParser = require("../shared/defineparser");

const program = Path.normalize("./bin/ax12");

class Ax12Real extends Ax12 {
    /**
     * Creates an instance of Ax12.
     */
    constructor (robot) {
        super(robot);


        this.actuatorCommands = defineParser(process.env.UTCOUPE_WORKSPACE + "/ax12/prgm_ax12/src/define.h");

        // this.logger.debug("Launching ax12 cpp");
        this.ax12 = Child_process.spawn(program);

        this.stdStreamConnected = this.stdStreamConnected;

        this.ax12.on('error', function(err) {
            if(err.code === 'ENOENT'){
                this.logger.fatal("ax12 program executable not found! Is it compiled ? :) Was looking in \""+Path.resolve(program)+"\"");
                process.exit();
            }
            this.logger.error("c++ subprocess terminated with error:", err);
            console.log(err);
        }.bind(this));
        this.ax12.on('exit', function(code) {
            this.stdStreamConnected = this.stdStreamConnected;
            this.logger.fatal("c++ subprocess terminated with code:"+code);
        }.bind(this));



        process.on('exit', function(){ //ensure child process is killed
            // if(this.ax12.connected){ //and was still connected (dont kill another process)
            if(!!this.ax12){ //and was still connected (dont kill another process)
                this.ax12.kill();
            }
        }.bind(this));

        this.stdout = Byline.createStream(this.ax12.stdout);
        this.stdout.setEncoding('utf8')
        this.stdout.on('data', function(data) {
            this.logger.debug("ax12 just gave : "+data);
            this.parseCommand(data);
        }.bind(this));

        this.ax12.stderr.on('data', function(data) {
            this.logger.error("stderr :"+data.toString());
        }.bind(this));
    }

    parseCommand(receivedCommand) {
        if (!this.stdStreamConnected) {
            // If not connected, wait the ID of the arduino before doing something else
            if (receivedCommand.indexOf("ax12") == 0) {
                //todo find a way to make it proper
                var order = [this.actuatorCommands.START,0].join(";")+";\n";
                this.logger.debug(order);
                this.ax12.stdin.write(order);
            } else {
                this.logger.debug(receivedCommand.toString());
                // Trigger on reception of ack from arduino that it has started
                if (receivedCommand.indexOf("0;") == 0) {
                    this.stdStreamConnected = true;
                    this.ordersSerial = require("../shared/orders.process")({
                        in: this.ax12.stdin,
                        out: this.stdout
                    });
                }
                // this.ordersSerial.sendOrder(this.actuatorCommands.PARAMETER, [], callback);
                this.logger.debug("INIT movements")
                this.ordersSerial.sendOrder(this.actuatorCommands.AX12_ONE, [this.actuatorCommands.PR_MODULE_GRABBER], () => {});
                    this.ordersSerial.sendOrder(this.actuatorCommands.AX12_INIT, [this.actuatorCommands.PR_MODULE_GRABBER], () => {});
                
                this.ordersSerial.sendOrder(this.actuatorCommands.AX12_ONE, [this.actuatorCommands.PR_MODULE_DUMMY], () => {
                   this.ordersSerial.sendOrder(this.actuatorCommands.AX12_INIT, [this.actuatorCommands.PR_MODULE_DUMMY], () => {});
                });
            }
        }

        this.logger.debug("TODO: parse command : " + receivedCommand)
    }

    openGrabber(callback) {
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.AX12_INIT, [this.actuatorCommands.PR_MODULE_GRABBER], callback);
        } else {
            this.logger.error("TODO: AX12 real openGrabber()");
            // this.logger.error("Serial port not connected...");
        }
    }

    closeGrabber(callback) {
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.AX12_ONE, [this.actuatorCommands.PR_MODULE_GRABBER], callback);
        } else {
            this.logger.error("TODO: AX12 real closeGrabber()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyLeft(callback) {
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.AX12_ONE, [this.actuatorCommands.PR_MODULE_DUMMY], callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyLeft()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyRight(callback) {
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.AX12_TWO, [this.actuatorCommands.PR_MODULE_DUMMY], callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyRight()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyCenter(callback) {
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.AX12_INIT, [this.actuatorCommands.PR_MODULE_DUMMY], callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyCenter()");
            // this.logger.error("Serial port not connected...");
        }
    }

    stop() {
        this.logger.error("TODO: AX12 real stop()");
        if (this.stdStreamConnected) {
            this.ordersSerial.sendOrder(this.actuatorCommands.HALT, []);
        } else {
            this.logger.error("TODO: AX12 real stop()");
            // this.logger.error("Serial port not connected...");
        }

        this.logger.info("AX12 real stopped");
    }
}

// Exports an object to be sure to have a single instance in the system
module.exports = function() {
    return new Ax12Real();
};
