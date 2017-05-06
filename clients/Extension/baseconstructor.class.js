/**
 * Module permettant de construire la base lunaire
 * 
 * @module clients/Extension/baseconstructor
 * @requires module:clients/Extension/extension
 */

"use strict";

const Extension = require('./extension.class.js');
var servos = require('./Actuators/servo.class.js');

/**
 * Extension permettant de construire la base lunaire
 * 
 * @class BaseConstructor
 * @memberof module:clients/Extension/baseconstructor
 * @extends clients/Extension/extension.Extension
 */
class BaseConstructor extends Extension {
    constructor(){
        super("base_constructor");
        this.servos = servos;
    }

    processFifoOrder (name, param) {
        this.logger.info("Order received : " + name);
        switch (name) {
            case "drop":
                this.servos.moduleDrop();
                this.fifo.orderFinished();
                break;
            case "engage":
                this.servos.moduleEngage();
                this.fifo.orderFinished();
                break;
            case "rotate":
                this.servos.moduleRotate();
                this.fifo.orderFinished();
                break;
            
            case "drop_border":
                // open
                // rotate
                // close
                break;
            
            case "drop_middle_1":
                // same thing
                break;
            
            case "drop_middle_2":
                // same thing
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist !");
        }
    }

    // Inherited from client
    stop() {
        this.servos.stop();
        super.stop();
    }
}

module.exports = BaseConstructor;