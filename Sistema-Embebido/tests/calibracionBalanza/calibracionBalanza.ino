#include "HX711.h"

#define DOUT  2
#define CLK  3

HX711 scale;

float calibration_factor = -1110; //-7050 worked for my 440lb max scale setup

void setup() {
  Serial.begin(9600);
  Serial.println("HX711 calibration sketch");
  Serial.println("Remove all weight from scale");
  Serial.println("After readings begin, place known weight on scale");
  Serial.println("Press + or a to increase calibration factor");
  Serial.println("Press - or z to decrease calibration factor");
  
  scale.begin(DOUT, CLK);
  scale.set_scale();
  scale.tare(); //Reset the scale to 0
  
  scale.set_scale(calibration_factor); //Adjust to this calibration factor
}

void loop() {
  Serial.print("Reading: ");
  Serial.print(scale.get_units(10), 1);
  Serial.print(" gr");
  Serial.print(" calibration_factor: ");
  Serial.print(calibration_factor);
  Serial.println();

  scale.set_scale(calibration_factor);
  
  if(Serial.available())
  {
    char temp = Serial.read();
    if(temp == '+' || temp == 'a')
      calibration_factor += 10;
    else if(temp == '-' || temp == 'z')
      calibration_factor -= 10;
  }

   if (scale.is_ready()) {
     Serial.print("HX711 reading: ");
     Serial.println(scale.get_units(10));
   } else {
     Serial.println("HX711 not found.");
   }

   delay(500);
}
