//
// Created by tfuhrman on 21/04/17.
//

#include <iostream>
#include <string>


#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include "protocol.h"
using namespace std;

std::string GetLineFromCin() {
	cout << "Waiting for order" <<endl;
    std::string line;
    std::getline(std::cin, line);
    return line;
}

ax12::ax12():started(false), baudnum(1),deviceIndex(0), future(std::async(std::launch::async, GetLineFromCin)) {
   //file.open("input.txt", ios::in);
	int CommStatus;
	string command ;


	cout << "\n\nSyncWrite example for Linux\n\n";
    for(int i = 0; i<5; i++){
		deviceIndex = detection();
		if (deviceIndex != -1 ) break;
		cout << "Failed to find USB2Dynamixel" << endl;
		cout << "Trying " << 5-i << " times"<<endl;
	}

    if( dxl_initialize(deviceIndex, baudnum) == 0 )
    {
        cout <<"Failed to open USB2Dynamixel!\n" ;
        cout <<"Press Enter key to terminate...\n" ;
        getchar();
    }
    else{
        cout << "Succeed to open USB2Dynamixel!\n";
        waitStart();
    }
	vector<int> positions = {500, 200, 1000};
	ax ax1(2, positions);
	servos[2] = &ax1;
    dxl_write_word(2, 34, 1000);

    /*dxl_write_word(2, 32, 0);
    usleep(5000);
	int pos, pos1;
	while(1){
		dxl_write_word(2, 30, 100);
		sleep(4);
		dxl_write_word(2, 30, 1000 );
		sleep(3);
		dxl_read_word(2, 40);
		pos = dxl_get_rxpacket_parameter(0);
		pos1 = dxl_get_rxpacket_parameter(1);
		cout << "charge : " << pos << " ; "<< pos1 <<endl;
		usleep(5000);


	}*/
    while(1)
    {
        // Write goal position
		while (cin.good() && started == true) {

			//cout << "ok";
			command = checkOrder();
			parseAndExecuteOrder(command);
			usleep(100);
		}
    }

    dxl_terminate();
    cout <<"Press Enter key to terminate...\n" ;
    getchar();
}

string ax12::checkOrder(){
	string command;
	if (future.wait_for(std::chrono::seconds(0)) == std::future_status::ready) {
		command = future.get();
		future = std::async(std::launch::async, GetLineFromCin);

	}
	return command;
}

void ax12::waitStart(){
	string command ;
	clock_t t, diff;

	while(started == false){
		cout << "ax12"<<endl;
		t = clock();
		 diff = 0;

		while ( (float)diff*10/CLOCKS_PER_SEC < 0.3 && started == false) {

			/*
           if (future.wait_for(std::chrono::seconds(0)) == std::future_status::ready) {
               command = future.get();

               // Set a new line. Subtle race condition between the previous line
               // and this. Some lines could be missed. To aleviate, you need an
               // io-only thread. I'll give an example of that as well.
               //future = std::async(std::launch::async, GetLineFromCin);
           }*/
		   command = checkOrder();
		   //cin >> command;
			if (command != "")
				parseAndExecuteOrder(command, true);
			usleep(100);
			diff = clock() - t;
			//cout << (double)diff*10/CLOCKS_PER_SEC << endl;
		}
	}
}

int ax12::detection(){
	int CommStatus;
	int baudnum = 1;
	for(int j = 0; j<9; j++){
		cout << "Recherche sur ACM" << j << endl;
		if(dxl_initialize(j, baudnum) == 1){
			dxl_ping(ID_DETECTION);
			CommStatus = dxl_get_result();
			if( CommStatus == COMM_RXSUCCESS )
			{
				cout << "USB2AX detecte sur ACM" << j << endl ;
				return j;
			}

		}
	}
	return -1;

}



bool ax12::changeParameter(int id, int parameter, int value ){
	servos[id]->setPositions(parameter, value);
	return true;
}
 std::regex pattern { "abc" };
 bool ax12::checkMessage(const string& mes){
	 std::regex pattern { "[A-Za-z];[0-9]+(;[0-9]+(;[0-9]+)?)?" };
	 return std::regex_match(mes, pattern);
 }
//order is order;id_order;id_servo;params

void ax12::parseAndExecuteOrder(const std::string& order, bool startOnly) {
	if (checkMessage(order) ==  false) return;
	int receivedOrder, id_order, id_ax, numberDigits, j=0, i = 0;
	char c = '0';
	int s = order.size();
    int orderChar = order[0];
	if(s > 1 && order[1] == ';'){
		i = 2;
		j = i;
		while(c != ';' && j< s){
			c = order[++j];
		};
	    id_order = std::stoi(order.substr(i,j-1));
	    numberDigits = getLog10(id_order);
		i = j+1;
		if (orderChar != 'S' && orderChar!='h') {
			while(c != ';' && j < s){
				c = order[++j];
			};
			id_ax = std::stoi(order.substr(i,j-1));
		    receivedOrder = j+1;
			cout << "id : " << id_ax <<endl;
		}
	}
	if(startOnly){
		if(orderChar == START){
			cout << "Receive start order" <<endl;
			started = true;
		}
	}
	else{

	    switch (orderChar) {
	        case START:
	        {
	            // Ack that arduino has started
	            started = true;
	            break;
	        }
	        case HALT:
	        {
	            // Ack that arduino has stopped
				cout << "Receive halt order" <<endl;
				started = false;
				waitStart();
	            break;
	        }
	        case PARAMETER:
	        {
	            //todo try to be able to use uint8_t
				cout << "Receive parameter value, order " << id_order << endl;
				int value = std::stoi(order.substr(receivedOrder, s));
				bool ok = changeParameter(id_ax, order[receivedOrder], value);
	            break;
	        }
	        case AX12_INIT:
	        {
				cout << "Going to init position, order " << id_order<<endl;
	            servos[id_ax]->goTo(INIT);
				break;
	        }
	        case AX12_ONE:
	        {
				cout << "Going to position one, order " << id_order<<endl;
	            servos[id_ax]->goTo(ONE);
	            break;
	        }
	        case AX12_TWO:
	        {
				cout << "Going to position two, order " << id_order<<endl;
	            servos[id_ax]->goTo(TWO);
	            break;
	        }
	        default:
	            break;
	    }
	}
}

int ax12::getLog10(const uint16_t number) {
    if(number>=10000) return 5;
    if(number>=1000) return 4;
    if(number>=100) return 3;
    if(number>=10) return 2;
    return 1;
}
/*
receive orders as String, so keep this format
store the received strings in a QueueList (test that it's working and not using too much space)
when processing, copy the String buffer in an internal buffer to avoid any conflict
best is to use a generic parser, but the parser execute orders too, how to split them ??

goal is to integrate OS48 and to compile a chuck of code with a main (not generic at first) and
generic functions to read and to write through the serial port + trigger on S order with response
 */
