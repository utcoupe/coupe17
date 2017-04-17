#include <stdio.h>
#include "protocol.h"
#include "compat.h"
#include "serial_switch.h"
#include "robotstate.h"
#include "control.h"

int sendResponse(char order, char *buf, int size, int ID){
	char message[MAX_COMMAND_LEN];
	int wsize = 0;
	message[wsize++] = order;
	message[wsize++] = ';';
	wsize += sprintf(&message[wsize], "%d", ID);
	memcpy(message+wsize, buf, size*sizeof(char));
	wsize += size;
	message[wsize++] = '\n';
	message[wsize++] = '\0';
	serial_print(message);
	return wsize;
}

void clean_current_command(char *buffer, int* end_of_cmd) {
	memcpy(buffer, buffer+*end_of_cmd, MAX_COMMAND_LEN-*end_of_cmd);
	*end_of_cmd = 0;
}

void autoSendStatus(void) {
	char message[MAX_COMMAND_LEN];
	int index = 0;
	index += sprintf(message, "%c;%i;%i;%i;%i", 
			AUTO_SEND,
			control.last_finished_id,
			(int)current_pos.x,
			(int)current_pos.y,
			(int)(current_pos.angle*FLOAT_PRECISION));
#if DEBUG_TARGET_SPEED
	index += sprintf(message+index, ";%i;%i;%i;%i",
			(int)wheels_spd.left,
			(int)wheels_spd.right,
			(int)(control.speeds.linear_speed - control.speeds.angular_speed),
			(int)(control.speeds.linear_speed + control.speeds.angular_speed));
#endif
	message[index] = '\n';
	message[index+1] = '\0';
	serial_print(message);
}

void ProtocolAutoSendStatus(int bytes_left) {
#if AUTO_STATUS_HZ
	static int i=0;
	if (++i % (HZ / AUTO_STATUS_HZ) == 0) {
		if (bytes_left >= MAX_AUTOSEND_SIZE) {
			autoSendStatus();
			i = 0;
		} else {
			i--;
		}
	}
#endif
}

int ProtocolExecuteCmd(char data) {
	static char current_command[MAX_COMMAND_LEN];
	static int index = 0;
	if (data == '\r') data = '\n';
	current_command[index++] = data;
	if (index >= MAX_COMMAND_LEN) {
		// epic fail, this MUST NEVER happen
		// if ever this happens, the order will be corrupted
		// decrease index so the arduino keep going on
		// that means we overwrite the last received char
		index = MAX_COMMAND_LEN-1;
	}
	if (data == '\n') {
		// end of current command
		char order = current_command[0];
		char response[MAX_RESPONSE_LEN];
		int id, end_of_id, response_size, sent_size;
		current_command[index] = '\0';
		end_of_id = ID_START_INDEX; // start after first ';'
		while (current_command[end_of_id] != ';') {
			end_of_id++;
			if (end_of_id >= MAX_ID_LEN+ID_START_INDEX) {
				char message[MAX_COMMAND_LEN];
				int msg_index = 0;
				clean_current_command(current_command, &index);
				if (order != '\n') {
					message[0] = order;
					message[1] = ';';
					msg_index = 2;
				}
				sent_size = sprintf(message+msg_index, "%s\n", FAILED_MSG);
				serial_print(message);
				return sent_size;
			}
		}
		current_command[end_of_id] = '\0';
		sscanf(&current_command[ID_START_INDEX], "%i", &id);

		switchOrdre(order, id, &current_command[end_of_id+1], response, &response_size);
		sent_size = sendResponse(order, response, response_size, id);
		clean_current_command(current_command, &index);
		return sent_size;
	}
	return 0;
}
