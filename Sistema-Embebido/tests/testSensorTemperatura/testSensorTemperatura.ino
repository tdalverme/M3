#define SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 25

void setup(){
  Serial.begin(9600);
  pinMode(SENSOR_TEMP, INPUT);
}

void loop(){
  delay(1000);
  float sumTemperatura = 0;
  
  for(int i = 0; i < CANT_MEDICIONES_TEMP; i++) {
    sumTemperatura += getTemperatura();
  }
  float temperatura = sumTemperatura / CANT_MEDICIONES_TEMP;  
  sumTemperatura = 0;
  
  Serial.print("Temperatura: ");
  Serial.print(getTemperatura());
  Serial.println(" °C");
}

float getTemperatura() {
  return (5.0 * analogRead(SENSOR_TEMP) * 100.0) / 1024.0;
}
