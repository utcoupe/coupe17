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
        super();
        super.parseParameterFile(process.env.UTCOUPE_WORKSPACE + "arduino/common/others/protocol.h");
    }

    // Automatically called by the super class
    parseCommand(receivedCommand) {
        if (!super.serialPortConnected) {
            //todo robot+"_others"
            // If not connected, wait the ID of the arduino before doing something else
            if (receivedCommand == "pr_others") {
                super.sendOrder(super.actuatorCommands.START, 0, undefined);
                super.serialPortConnected = true;
            }
        } else {
            // Check if the received command is a debug string or a response from an order
            //todo ";" as protocol separator
            if (receivedCommand.indexOf(";") == 1) {
                // It's an order response
                //todo ";" as protocol separator
                var splittedCommand = receivedCommand.split(";");
                super.callOrderCallback(splittedCommand[0], splittedCommand.slice(0, 1));
            } else {
                // It's a debug string
                super.logger("SERVO : " + receivedCommand);
            }
        }
    }

    // Orders used by the extension
    moduleArmClose() {
        super.sendOrder(super.actuatorCommands.SERVO_CLOSE, super.actuatorCommands.PR_MODULE_ARM, function(params){
            //todo advertise IA
        });
    }

    moduleArmOpen() {
        super.sendOrder(super.actuatorCommands.SERVO_OPEN, super.actuatorCommands.PR_MODULE_ARM, function(params){
            //todo advertise IA
        });
    }

    //implicit rotate the module
    moduleEngage() {
        super.sendOrder(super.actuatorCommands.SERVO_CLOSE, super.actuatorCommands.PR_MODULE_DROP_R, function(params){
            //todo advertise IA
        });
        super.sendOrder(super.actuatorCommands.SERVO_CLOSE, super.actuatorCommands.PR_MODULE_DROP_L, function(params){
            //todo advertise IA
        });
        super.sendOrder(super.actuatorCommands.MODULE_ROTATE, super.actuatorCommands.PR_MODULE_ROTATE, function(params){
            //todo advertise IA
        });
    }

    moduleDrop() {
        //todo modules--
        super.sendOrder(super.actuatorCommands.SERVO_OPEN, super.actuatorCommands.PR_MODULE_DROP_R, function(params){
            //todo advertise IA
        });
        super.sendOrder(super.actuatorCommands.SERVO_OPEN, super.actuatorCommands.PR_MODULE_DROP_L, function(params){
            //todo advertise IA
        });
    }
}

//differentiate ready and connected
// -> at first, arduino will send ID, waiting from the node send a START

// Export an object, to make it unique in the system
module.exports = Servo();