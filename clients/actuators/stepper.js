/**
 * Module implémentant l'actuator pour le capteur pas-à-pas
 * 
 * @module clients/Extension/Actuators/stepper
 * @requires clients/Extension/Actuators/actuator
 */

"use strict";

const Actuator = require('./actuator.class.js');

/**
 * Classe implémentant l'actuator pour le capteur pas-à-pas
 * 
 * @memberof clients/Extension/Actuators/stepper
 * @extends clients/Extension/Actuators/actuator.Actuator
 */
class Stepper extends Actuator {
    constructor () {
        //
    }
}

module.exports = Stepper;