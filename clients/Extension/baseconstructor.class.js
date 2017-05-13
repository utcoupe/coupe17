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
        this.hasAPreparedModule = false;
        this.pushTowards = "don't";
        this.color = "null";
        this.nbModulesToDrop = 0;
    }

    takeOrder (from, name, param) {
        this.logger.info("Order received : " + name);
        switch (name) {
            
            case "prepare_module":
                this.prepareModule(param);
                break;
            
            case "drop_module":
                this.drop_module(param);
                break;
            
            case "clean":
                this.logger.debug("Cleaning FiFo");
                this.fifo.clean();
                break;
            
            case "stop":
                this.stop();
                break;
            
            // ************ tests only ! ************
            case "drop":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("drop");
                }, "drop");
                break;
            case "engage":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("engage");
                }, "engage");
                break;
            case "push":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("push", {towards: param.push_towards});
                }, "push");
                break;
            case "rotate":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("rotate", {color: param.color});
                }, "rotate");
                break;
            
            default :
                this.logger.error("Order " + name + " does not exist !");
        }
    }

    processFifoOrder (name, param) {
        this.logger.info("Order executing : " + name);
        switch (name) {
            case "drop":
                this.servos.moduleDrop( () => {
                    this.fifo.orderFinished();
                });
                if (this.nbModulesToDrop > 0)
                    this.nbModulesToDrop--;
                else
                    this.logger.error("Aucun module à déposer !");
                if (this.nbModulesToDrop = 0)
                    ;// TODO wait push & send message to IA
                break;
            case "engage":
                this.servos.moduleEngage( () => {
                    this.fifo.orderFinished();
                });
                break;
            case "rotate":
                this.servos.moduleRotate( () => {
                    this.fifo.orderFinished();
                });
                break;
            case "push":
                /// TODO AX12 action with param.towards
                this.fifo.orderFinished();
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist !");
                this.fifo.orderFinished();
        }
    }

    // Inherited from client
    stop() {
        this.servos.stop();
        super.stop();
    }

    /**
     * Engage a module in drop servos and rotate it
     * 
     * @param {Object} [param]
     * @param {String} param.color
     * @param {String} param.push_towards
     */
    prepareModule (param) {
        if (params.push_towards)
            this.pushTowards = params.push_towards;
        // push_towards -> oposite direction
        var opositPush = "don't";
        if (push_towards == "left")
            opositPush = "right";
        else if (push_towards == "right")
            opositPush = "left";
        this.fifo.newOrder(() => {
            this.processFifoOrder("push", {towards: opositPush});
        }, "push");
        // open
        this.fifo.newOrder(() => {
            this.processFifoOrder("engage");
        }, "engage");
        // rotate
        if (params.color)
            this.color = "null";
        if (color != "null")
            this.fifo.newOrder(() => {
                this.processFifoOrder("rotate", {color: params.color})
            });
        this.hasAPreparedModule = true;
    }

    /**
     * Drop a module after preparing it (according to prepare_module)
     * 
     * @param {Object} params 
     * @param {Number} params.nb_modules_to_drop number of iterations
     */
    dropModule (params) {
        for (var idModule = 0; idModule < params.nb_modules_to_drop; idModule++) {
            this.nbModulesToDrop++;
            // Preparation
            if (!this.hasAPreparedModule)
                this.prepare_module();
            // close
            this.fifo.newOrder(() => {
                this.processFifoOrder("drop");
            }, "drop");
            this.fifo.newOrder(() => {
                this.processFifoOrder("push", {towards: this.push_towards});
            }, "push");
            this.hasAPreparedModule = false;
        }
    }
}

module.exports = BaseConstructor;