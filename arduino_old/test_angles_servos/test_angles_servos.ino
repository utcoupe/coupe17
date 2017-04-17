#include <Servo.h>
#include <stdio.h>


Servo H_servo1; //vue de face ==> gauche 
Servo H_servo2; //vue de face ==> droite
Servo M_servo1; //vue de face ==> gauche
Servo M_servo2; //vue de face ==> droite
Servo G_servo;
Servo C_servo;


int i=0;
char maChaine[64];

void annalyse_chaine(); 

void setup() 
{  
  Serial.begin(57600);
  Serial.write('O');

  H_servo1.attach(2);  //2 5 6 9 10  OK
  H_servo2.attach(5);  //13=led BOF BOF
  M_servo1.attach(6);  //3 4=vibre 7 8 11 12 !OK
  M_servo2.attach(9);
  G_servo.attach(10);
  C_servo.attach(13);
} 


void loop() 
{ 
  if (Serial.available()) {
    maChaine[i]= Serial.read(); 

    if (maChaine[i]=='\n' || maChaine[i]=='\r'){
      maChaine[i]='\0';
      annalyse_chaine();
      i=0;
    }
    else{
      i = ++i % 64;
    }
  }
  delay(10);
}


void annalyse_chaine(){
  switch(maChaine[0])
  {
  case '2':
    {
      int angle;
      sscanf(maChaine,"2;%d",&angle);
      H_servo1.write(angle);
    }
    break;  
  case '5':
    {
      int angle;
      sscanf(maChaine,"5;%d",&angle);
      H_servo2.write(angle);
    }
    break;  
  case '6':
    {
      int angle;
      sscanf(maChaine,"6;%d",&angle);
      M_servo1.write(angle);
    }
    break;  
  case '9':
    {
      int angle;
      sscanf(maChaine,"9;%d",&angle);
      M_servo2.write(angle);
    }
    break;  
  case '0':
    {
      int angle;
      sscanf(maChaine,"0;%d",&angle);
      G_servo.write(angle);
    }
    break;  
  case '3':
    {
      int angle;
      sscanf(maChaine,"3;%d",&angle);
      C_servo.write(angle);
    }
  }
}







