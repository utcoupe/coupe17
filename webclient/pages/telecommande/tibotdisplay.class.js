"use strict";

class TibotDisplay extends RobotDisplay {
    constructor (name, client) {
        super(name, client);

        // Specific to tibot
        // example : this.PID_P = 0.5
        this.moduleColor = "null";
        this.pushTowards = "dont";
        this.nbModules = 0;
    }

    // Actuators
    openUnitGrabber () {
		this.client.send("unit_grabber", "open");
	}

	closeUnitGrabber () {
        this.client.send("unit_grabber", "close");
	}

	drop () {
		this.client.send("base_constructor", "drop");
	}

    engageModule () {
        this.client.send("base_constructor", "engage");
    }

    rotateModule () {
        this.client.send("base_constructor", "rotate", {color: this.moduleColor});
    }

    pushModule () {
        this.client.send("base_constructor", "push", {push_towards: this.pushTowards});
    }

    prepareModule () {
        this.client.send("base_constructor", "prepare_module", {
            color: this.moduleColor,
            push_towards: this.pushTowards
        });
    }

    dropModule () {
        this.client.send("base_constructor", "drop_module", {
            nb_modules_to_drop: this.nbModules
        });
    }
}