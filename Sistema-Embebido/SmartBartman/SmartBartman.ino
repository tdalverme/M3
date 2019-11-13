#include "HX711.h"
#include "AsyncSonarLib.h"
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

#define DISTANCIA_VASO_MAX 200
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
AsyncSonar sonar(ULTRASONIDO_TRIG);

void setup()
{
  Serial.begin(9600); //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600); //Velocidad del puerto del módulo Bluetooth
  initBalanza(&scale, BALANZA_DOUT, BALANZA_CLK, FACTOR_CALIBRACION);

  /**
  scale.begin(BALANZA_DOUT, BALANZA_CLK);
  scale.set_scale();
  scale.tare();

  scale.set_scale(-1060);
  **/

  pinMode(FERNET, OUTPUT);
  pinMode(COCA, OUTPUT);
  digitalWrite(FERNET, HIGH);
  digitalWrite(COCA, HIGH);
  
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
      sonar.Start();
      delay(50);
      sonar.Update();
      if(sonar.GetMeasureMM() < DISTANCIA_VASO_MAX) {
        estadoActual = SIRVIENDO_BEBIDA;
        Serial.println("En rango");
      }
      break;
      
    case SIRVIENDO_BEBIDA:
      handleSirviendoBebida();
      break;
      
    case BEBIDA_FINALIZADA:
      //handleBebidaFinalizada();
      estadoActual = ESPERANDO_INPUT;
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
    bebida2 = tragoSeleccionado.bebida2;
    porcentajeBebida1 = tragoSeleccionado.porcentajeBebida1;
    porcentajeBebida2 = tragoSeleccionado.porcentajeBebida2;
    pesoObjetivo = PESO_MAX * tragoSeleccionado.porcentajeBebida1 / 100; 
    estadoActual = ESPERANDO_VASO;
    //estadoActual = SIRVIENDO_BEBIDA;
    digitalWrite(bebidaActual, LOW);
    ultrasonido.start();
  }
}

void handleEsperandoVaso() {
  if(ultrasonido.isFinished()) {
    Serial.println("FINISHED");
    if(ultrasonido.getRange() < DISTANCIA_VASO_MAX) {
      estadoActual = SIRVIENDO_BEBIDA;
      Serial.println("En rango");
    }

    ultrasonido.start();
  }
}

void handleSirviendoBebida() {
  digitalWrite(bebidaActual, HIGH);
  delay(500);
  pesoActual = scale.get_units(3);
  
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
      sendMessage("change|COCA");
      digitalWrite(bebidaActual, HIGH);
      sendMessage("change|COCA");
      bebidaActual = bebida2;
      pesoObjetivo = PESO_MAX - pesoActual;
    }
  }
  else {
    
    digitalWrite(bebidaActual, LOW);
    delay(500);
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

void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();

  scale->set_scale(factor);  
}

float getTemperatura() {
  return (5.0 * analogRead(SENSOR_TEMP) * 100.0) / 1024.0;
}
