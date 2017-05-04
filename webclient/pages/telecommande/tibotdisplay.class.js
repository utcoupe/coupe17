"use strict";

class TibotDisplay extends RobotDisplay {
    constructor (name, client) {
        super(name, client);

        // Specific to tibot
        // example : this.PID_P = 0.5
    }

    // Actuators
    openUnitGrabber () {
		this.client.send("unit_grabber", "open");
	}

	closeUnitGrabber () {
        this.client.send("unit_grabber", "close");
	}

	dropModule () {
		this.client.send("base_constructor", "drop");
	}

    engageModule () {
        this.client.send("base_constructor", "engage");
    }

    take_1 () {
        this.client.send("unit_grabber", "take_1");
    }

    take_4 () {
        this.client.send("unit_grabber", "take_4");
    }

    drop_border () {
        this.client.send("base_constructor", "drop_border");
    }

    drop_middle_1 () {
        this.client.send("base_constructor", "drop_middle_1");
    }

    drop_middle_2 () {
        this.client.send("base_constructor", "drop_middle_2");
    }
}