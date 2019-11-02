#include "HX711.h"
#include "HC_SR04.h"
#include "Input.h"

/*Aqui se configuran los pines donde debemos conectar el sensor*/
#define BALANZA_DOUT  A1
#define BALANZA_CLK  A0
#define FACTOR_CALIBRACION -1060

#define ULTRASONIDO_INT 0
#define ULTRASONIDO_TRIG 4
#define ULTRASONIDO_ECHO 3

#define SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 10

#define DISTANCIA_VASO_MAX 20
#define PESO_MAX 200

#define ESPERANDO_INPUT 20
#define ESPERANDO_VASO 21
#define SIRVIENDO_BEBIDA 22
#define BEBIDA_FINALIZADA 23

int estadoActual;
int cantMediciones;
float sumadorTemp;
float temperatura;

HX711 scale;
HC_SR04 ultrasonido(ULTRASONIDO_TRIG, ULTRASONIDO_ECHO, ULTRASONIDO_INT);

void setup()
{
  Serial.begin(9600); //Abrimos la comunicación serie con el PC y establecemos velocidad

  initBalanza(&scale, BALANZA_DOUT, BALANZA_CLK, FACTOR_CALIBRACION);

  /**
  scale.begin(BALANZA_DOUT, BALANZA_CLK);
  scale.set_scale();
  scale.tare();

  scale.set_scale(-1060);
  **/

  pinMode(RELAY_PIN_1, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  digitalWrite(RELAY_PIN_1, HIGH);
  digitalWrite(RELAY_PIN_2, HIGH);
  
  estadoActual = ESPERANDO_INPUT;
  cantMediciones = 0;
  sumadorTemp = 0;
}

//String input;
Trago tragoSeleccionado;
int bebida1;
int bebida2;
int porcentajeBebida1;
int porcentajeBebida2;

int bebidaActual;
float pesoObjetivo;
float pesoActual;

void loop() {
  switch(estadoActual) {
    case ESPERANDO_INPUT:
      //Serial.print("PESO ACTUAL: ");
      //Serial.println(pesoActual);
      handleEsperandoInput();
      break;

    case ESPERANDO_VASO:
      handleEsperandoVaso();
      break;
      
    case SIRVIENDO_BEBIDA:
      handleSirviendoBebida();
      break;
      
    case BEBIDA_FINALIZADA:
      //handleBebidaFinalizada();
      Serial.println("FINALIZADA.");
      break;

    default:
      break;
  }
}

void handleEsperandoInput() {
  if(getInput() == 1) {
    tragoSeleccionado = parseInput();
    bebidaActual = tragoSeleccionado.bebida1;
    pesoObjetivo = PESO_MAX * tragoSeleccionado.porcentajeBebida1 / 100; 
    //estadoActual = ESPERANDO_VASO;
    estadoActual = SIRVIENDO_BEBIDA;
    digitalWrite(bebidaActual, LOW);
    ultrasonido.start();
    Serial.println("TRIG");
  }
}

void handleEsperandoVaso() {
  if(ultrasonido.isFinished()) {
    Serial.println("FINISHED");
    if(ultrasonido.getRange() < DISTANCIA_VASO_MAX) {
      estadoActual = SIRVIENDO_BEBIDA;  
    }

    ultrasonido.start();
  }
}

void handleSirviendoBebida() {
  pesoActual = scale.get_units(10);

  Serial.print("PESO ACTUAL: ");
  Serial.println(pesoActual);

  Serial.print("BOMBA: ");
  Serial.println(bebidaActual);
  
  if(pesoActual >= pesoObjetivo) {
    if(bebidaActual == bebida2) {
      estadoActual = BEBIDA_FINALIZADA;
      digitalWrite(bebidaActual, HIGH);
    }
    else {
      digitalWrite(bebidaActual, HIGH);
      bebidaActual = bebida2;
      pesoObjetivo = PESO_MAX - pesoActual;
    }
  }
  else {
    //digitalWrite(bebidaActual, LOW);
  }
}

void handleBebidaFinalizada() {
  if(cantMediciones < CANT_MEDICIONES_TEMP) {
    sumadorTemp = getTemperatura();
    cantMediciones++;
  }
  else {
    temperatura = sumadorTemp / CANT_MEDICIONES_TEMP;
    cantMediciones = 0;
    sumadorTemp = 0;
    Serial.print("TEMPERATURA DE TRAGO: ");
    Serial.print(temperatura, 1);
    Serial.println("°C");
    estadoActual = ESPERANDO_INPUT;
  }
}

/**
int getInput() {
  if (Serial.available() > 0) {
    char caracter = Serial.read();
    
    if (caracter != '\n') {
      input += caracter;
      return 0;
    }
    else {
      //estadoActual = SIRVIENDO_BEBIDA;
      return 1;
    }
  }
}

void parseInput() {
  char aux[input.length() + 1];
  input.toCharArray(aux, input.length()+ 1);
  
  char *token = strtok(aux, "|");

  if(strcmp(token, "FERNET")) {
    bebida1 = RELAY_PIN_1;
  }
  else if(strcmp(token, "COCA")) {
    bebida1 = RELAY_PIN_2;
  }
  
   
  for(int i = 0; i < 2; i++) {
    token = strtok(NULL, "|");
     
    if(i == 0) {
      porcentajeBebida1 = atoi(token);
    }
    else if(i == 1) {
      if(strcmp(token, "FERNET")) {
        bebida2 = RELAY_PIN_1;
      }
      else if(strcmp(token, "COCA")) {
        bebida2 = RELAY_PIN_2;
      }
    }
  }

  porcentajeBebida2 = 100 - porcentajeBebida1;
}
**/

void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();

  scale->set_scale(factor);  
}

float getTemperatura() {
  return (5.0 * analogRead(SENSOR_TEMP) * 100.0) / 1024.0;
}
