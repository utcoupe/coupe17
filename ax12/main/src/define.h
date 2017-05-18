
#include <vector>
// BEGIN_ORDERS - Do not remove this comment
#define START               'S'     //no args, start the program
#define HALT                'h'    //no args, halt the program
#define PARAMETER           'p'     //servo_id(int);position(int);value(int), respond TODO, position = open or close
#define AX12_ONE            'o'     //servo_id(int), respond ack when done
#define AX12_TWO            't'     //servo_id(int), respond ack when done
#define AX12_INIT           'i'
#define PR_MODULE_DUMMY       0       //id servo controlling the arm which push the module
#define PR_MODULE_GRABBER      1       //id servo controlling the shovel
//END_ORDERS - Do not remove this comment
#define ID_DETECTION 		1




namespace vals{
    const std::vector<int> posDummy = {150, 0, 300};
    const std::vector<int> posGrabber = {150, 0, 300};
    const int NB_POS = 3;
    const int INIT = 0;
    const int ONE = 1;
    const int TWO = 2;
};
