#include <stdio.h>
#include <unistd.h>
#include <math.h>
#include <termio.h>

#include <dynamixel.h>

#define P_GOAL_POSITION_L	30
#define P_SPEED				0x26
#define P_COUPLE			34

// Default setting
#define DEFAULT_PORTNUM		0 // COM3
#define DEFAULT_BAUDNUM		1 // 1Mbps
#define DEFAULT_ID		3// ID AX12

#if defined(WIN32) || defined(_WIN32)
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

#define MARGE_POS 20
#define MARGE_POS_MVT 5
#define true 1
#define false 0

int pos_AX12_3 = 150*1024/300;
int pos_AX12_2 = 150*1024/300;
int arrive = false;
int arrive2 = false;

void loopAX12_3(){
	static int pos = 0;
	int speed = dxl_read_word(3, P_SPEED);

	// Si il est pas à la bonne position
	if(pos < pos_AX12_3 - MARGE_POS || pos > pos_AX12_3 + MARGE_POS) {
		arrive = false;
		// Si il bouge pas, on renvoie l'ordre
		if(speed == 0) {
			dxl_write_word(3, P_GOAL_POSITION_L, pos_AX12_3);
		}
		else {
			pos = dxl_read_word(3, 36);

		}
	}
	else {
		if(!arrive) {
			arrive = true;
			printf("[3] arrivé !\n");
		}
	}
}
void loopAX12_2(){
	static int pos = 0;
	int speed = dxl_read_word(2, P_SPEED);

	// Si il est pas à la bonne position
	if(pos < pos_AX12_2 - MARGE_POS || pos > pos_AX12_2 + MARGE_POS) {
		arrive2 = false;
		// Si il bouge pas, on renvoie l'ordre
		if(speed == 0) {
			dxl_write_word(2, P_GOAL_POSITION_L, pos_AX12_2);
		}
		else {
			pos = dxl_read_word(2, 36);

		}
	}
	else {
		if(!arrive2) {
			arrive2 = true;
			printf("[2] arrivé !\n");
		}
	}
}

// EXPORT int init(int port_num, int baudrate) {
// 	return dxl_initialize(port_num, baudrate) <= 0;
// }

// EXPORT void 

int main()
{
	dxl_write_word(3, P_COUPLE, 800);
	dxl_write_word(2, P_COUPLE, 800);

	while (++i)
	{
		//movesync(id1, id2, pos_id1, pos_id2)  ==> permet de renvoyer le nombre d'envoie d'ordre pour atteindre une position donnée (détection des bugs)
		// movePos(3, 150*1024/300);
		// dxl_write_word(3, P_GOAL_POSITION_L, (150*1024/300));
		// usleep(300000);
		// movePos(3, 220*1024/300);
		// dxl_write_word(3, P_GOAL_POSITION_L, (220*1024/300));
		// usleep(300000);
		// printf("loop\n");
		loopAX12_2();
		usleep(1000);
		loopAX12_3();
		usleep(50000);
		if(i > 20) {
			if(pos_AX12_3 == (int) 240*1024/300) {
				pos_AX12_3 = 150*1024/300;
				pos_AX12_2 = 150*1024/300;
			}
			else {
				pos_AX12_3 = 240*1024/300;
				pos_AX12_2 = 60*1024/300;
			}
			i = 0;
			// printf("change pos_AX12_3 = %d\n", pos_AX12_3);
		}
	}
	
	return 0;
}

