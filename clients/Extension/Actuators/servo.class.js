/**
 * Module implémentant l'actuator pour le servo-moteur
 * 
 * @module clients/Extension/Actuators/servo
 * @requires clients/Extension/Actuators/actuator
 */

"use strict";

const Actuator = require('./actuator.class.js');

/**
 * Classe implémentant l'actuator pour le servo-moteur
 * 
 * @memberof clients/Extension/Actuators/servo
 * @extends clients/Extension/Actuators/actuator.Actuator
 */
class Servo extends Actuator {
    constructor () {
        super("servo");
        this.parseParameterFile(process.env.UTCOUPE_WORKSPACE + "/arduino/common/others/protocol.h");
    }

    // Automatically called by the super class
    //todo find a way to reboot arduino if it doesn't send its ID (previously started)
    parseCommand(receivedCommand) {
        if (!this.serialPortConnected) {
            //todo robot+"_others"
            // If not connected, wait the ID of the arduino before doing something else
            if (receivedCommand.toString() == "pr_others\r") {
                //todo find a way to make it proper
                // this.serialPortConnected = true;
                // this.sendOrder(this.actuatorCommands.START, 0, null);
                // Reimplement what this.sendOrder does, because the flag used to send data is set by this function...
                var order = this.actuatorCommands.START + ";\n";
                order = this.addOrderId(order);
                this.ordersCallback.push([this.currentOrderId, function(params) {
                    this.logger.info("Get arduino ack, serial port is now connected");
                    this.serialPortConnected = true;
                }.bind(this)]);
                this.logger.info(order);
                this.serialPort.write(order);
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
    }

    // Orders used by the extension
    moduleArmClose() {
        this.sendOrder(this.actuatorCommands.SERVO_CLOSE, this.actuatorCommands.PR_MODULE_ARM, function(params){
            //todo advertise IA
        });
    }

    moduleArmOpen() {
        this.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_ARM, function(params){
            //todo advertise IA
        });
    }

    //implicit rotate the module
    moduleEngage() {
        this.sendOrder(this.actuatorCommands.SERVO_CLOSE, this.actuatorCommands.PR_MODULE_DROP_R, function(params){
            //todo advertise IA
        });
        this.sendOrder(this.actuatorCommands.SERVO_CLOSE, this.actuatorCommands.PR_MODULE_DROP_L, function(params){
            //todo advertise IA
        });
        //todo send color id
        // this.sendOrder(this.actuatorCommands.MODULE_ROTATE, this.actuatorCommands.PR_MODULE_ROTATE, function(params){
        //     //todo advertise IA
        // });
    }

    moduleDrop() {
        //todo modules--
        this.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_DROP_R, function(params){
            //todo advertise IA
        });
        this.sendOrder(this.actuatorCommands.SERVO_OPEN, this.actuatorCommands.PR_MODULE_DROP_L, function(params){
            //todo advertise IA
        });
    }

    moduleRotate() {
        this.sendOrder(this.actuatorCommands.MODULE_ROTATE, this.actuatorCommands.PR_MODULE_ROTATE, function(params){
            //todo advertise IA
        }, 1);
    }

    // Inherited from actuator
    stop() {
        this.sendOrder(this.actuatorCommands.HALT, 255, function (params) {
            this.superStop();
        }.bind(this));
        //todo call super stop in callback (not possible because callback can't handle super keyword

    }

    superStop() {
        super.stop();
    }

    test() {
        setTimeout(function(){
            console.log(this.actuatorCommands);
        }.bind(this), 200);
    }
}

//differentiate ready and connected
// -> at first, arduino will send ID, waiting from the node send a START

// Export an object, to make it unique in the system
module.exports = new Servo();