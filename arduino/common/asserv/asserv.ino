/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
  
#include <Arduino.h>
#include "block.h"
#include "compat.h"
#include "parameters.h"
#include "protocol.h"
#include "control.h"
#include "pins.h"
#include "emergency.h"
#include "sender.h"
#include <os48.h>
//include to match with SConstruct
#include <QueueList.h>

// Store kind of a timeout
//unsigned long nextTime = 0;
// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;

os48::Scheduler* scheduler = os48::Scheduler::get();
os48::TaskTimer* main_task = NULL;
os48::Task* serial_send_task = NULL;
os48::Task* serial_read_task = NULL;

//todo adapt with asynchronous serial
#ifdef PIN_JACK
int JackCheck(void) {
	static int last_jack_status = 1;
	int i, jack_status, sent_bytes = 0;
	jack_status = digitalRead(PIN_JACK);
	digitalWrite(LED_JACK, !jack_status);
	if (last_jack_status == 0 && jack_status == 1) {
		for (i=0; i<JACK_SEND_NR; i++) {
			Serial.write(JACK);
			Serial.write('\n');
			sent_bytes += 2;
		}
	}
	last_jack_status = jack_status;
	return sent_bytes;
}
#endif

/*
 * Main task, compute all the control actions.
 * This task is periodically called.
 */
bool mainTask() {
    //TODO read the serial and check if a go has been send to escape the loop and startup
    //TODO sync instead of while
    //TODO flag activated by executeCmd ?
    while (!flagConnected) {
        SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
        delay(1000);
    }
//    while (1) {
        SerialSender::SerialSend(SERIAL_INFO, "Started up !");
        delay(1000);
//    }



//    digitalWrite(LED_MAINLOOP, HIGH);
//
//#ifdef PIN_JACK
//    //todo check the jack and send its status
////    JackCheck();
//#endif
//
//    //Action asserv
//    ComputeEmergency();
//    ComputeIsBlocked();
//    ControlCompute();
//
//    digitalWrite(LED_MAINLOOP, LOW);

    return true;
}

/*
 * This task read the serial port (orders) and execute them.
 */
void serialReadTask() {
    static char receivedCommand[20];
    String receivedString;
    while (true) {
        // Each order sent is null terminated
        receivedString = SERIAL_MAIN.readStringUntil('\0');
        if (receivedString != "") {
            //todo verify that this way is working fine
            receivedString.toCharArray(receivedCommand, receivedString.length());
            protocolExecuteCmd(receivedCommand);
        }


//        receivedString.replace("\n", "");
        if (receivedString == "START")
        {
            flagConnected = 1;
        }

    }
}

void setup() {

#ifdef __AVR_ATmega2560__
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#else
#ifdef __AVR_ATmega328P__
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();

//    nextTime = micros();
    ControlInit();

    SerialSender sender;
    serial_send_task = scheduler->createTask(&SerialSender::SerialSendTask, 150);
    main_task = scheduler->createTaskTimer(&mainTask, 250, (uint32_t)(DT*1000));
    serial_read_task = scheduler->createTask(&serialReadTask, 100);

    scheduler->start();
}

//todo remove, not used anymore
void loop(){
//	int available, sent_bytes;
//#if DEBUG_MAINLOOP
//	static unsigned long start_overtime = micros();
//	unsigned long now;
//#endif
//
//	nextTime = nextTime + DT*1000000;
//	sent_bytes = 0;
//	digitalWrite(LED_MAINLOOP, HIGH);
//
//#ifdef PIN_JACK
//	sent_bytes += JackCheck();
//#endif
//
//	//Action asserv
//	ComputeEmergency();
//	ComputeIsBlocked();
//	ControlCompute();
//
//	// Flush serial every time to stay in time
//	Serial.flush();
//	// zone programmation libre
//	available = SERIAL_MAIN.available();
//	for(int i = 0; i < available; i++) {
//		// recuperer l'octet courant
//		sent_bytes += ProtocolExecuteCmd(generic_serial_read());
//	}
//	// Auto send status if necessary
//	ProtocolAutoSfendStatus(MAX_BYTES_PER_IT - sent_bytes);
//
//	digitalWrite(LED_MAINLOOP, LOW);
//
//#if DEBUG_MAINLOOP
//	now = micros();
//	if (now - start_overtime > 10000000) {
//		digitalWrite(LED_DEBUG, LOW);
//	}
//	if (now >= nextTime) {
//		start_overtime = micros();
//		digitalWrite(LED_DEBUG, HIGH);
//	}
//#endif
//	while (micros() < nextTime);
}
