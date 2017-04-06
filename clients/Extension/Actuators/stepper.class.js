/**
 * Module implémentant l'actuator pour le capteur pas-à-pas
 * 
 * @module clients/Extension/Actuators/stepper
 * @requires clients/Extension/Actuators/actuator
 */

const Actuator = require('actuator.class.js');

/**
 * Classe implémentant l'actuator pour le capteur pas-à-pas
 * 
 * @class Stepper
 * @memberof clients/Extension/Actuators/stepper
 * @extends {clients/Extension/Actuators/actuator.Actuator}
 */
class Stepper extends Actuator {
    constructor () {
        //
    }
}

module.exports = Stepper;