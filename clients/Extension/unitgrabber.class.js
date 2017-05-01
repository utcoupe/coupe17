/**
 * Module permettant de ramacer les modules
 * 
 * @module clients/Extension/unitgrabber
 * @requires module:clients/Extension/extension
 */

"use strict";

const Extension = require('./extension.class.js');
var servos = require('./Actuators/servo.class.js');

/**
 * Extension permettant de ramasser les modules lunaires
 * 
 * @class UnitGrabber
 * @memberof module:clients/Extension/unitgrabber
 * @extends {clients/Extension/extension.Extension}
 */
class UnitGrabber extends Extension {
    constructor(){
        super("unit_grabber");
        this.servos = servos;
    }

    takeOrder (from, name, param) {
        this.logger.info("Order received : " + name);
        switch (name) {
            case "open":
                this.servos.moduleArmOpen();

            case "close":
                this.servos.moduleArmClose();
        }
    }
}

module.exports = UnitGrabber;