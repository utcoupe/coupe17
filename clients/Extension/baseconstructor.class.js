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

    takeOrder (from, name, param) {
        this.logger.info("Order received : " + name);
        switch (name) {
            case "deposit":
                //
        }
    }
}

module.exports = BaseConstructor;