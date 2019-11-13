#include "HX711.h"
#include "AsyncSonarLib.h"
#include "Input.h"

/*Config de celda de carga*/
#define PIN_BALANZA_DOUT  A1
#define PIN_BALANZA_CLK  A0
#define FACTOR_CALIBRACION -1060
/*Config de sensor de ultrasonido*/
#define PIN_ULTRASONIDO_INT 0
#define PIN_ULTRASONIDO_TRIG 4
#define PIN_ULTRASONIDO_ECHO 3
/*Config de lm35*/
#define PIN_SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 10
/*Config custom del artefacto*/
#define DISTANCIA_VASO_MAX 200
#define PESO_MAX 200
/*Estados posibles*/
#define STATE_ESPERANDO_INPUT 20
#define STATE_ESPERANDO_VASO 21
#define STATE_SIRVIENDO_BEBIDA 22
#define STATE_BEBIDA_FINALIZADA 23

int estadoActual;
int cantMediciones;
float sumadorTemp;
float temperatura;

HX711 scale;
AsyncSonar sonar(PIN_ULTRASONIDO_TRIG);

void setup()
{
  Serial.begin(9600);           //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600);               //Velocidad del puerto del módulo Bluetooth

  initBalanza(&scale, PIN_BALANZA_DOUT, PIN_BALANZA_CLK, FACTOR_CALIBRACION);

  pinMode(PIN_RELAY_FERNET, OUTPUT);
  pinMode(PIN_RELAY_COCA, OUTPUT);
  digitalWrite(PIN_RELAY_FERNET, HIGH);
  digitalWrite(PIN_RELAY_COCA, HIGH);

  estadoActual = STATE_ESPERANDO_INPUT;
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
    case STATE_ESPERANDO_INPUT:
      //Serial.print("PESO ACTUAL: ");
      //Serial.println(pesoActual);
      handleEsperandoInput();
      break;

    case STATE_ESPERANDO_VASO:
      sonar.Start();
      delay(50);
      sonar.Update();
      if(sonar.GetMeasureMM() < DISTANCIA_VASO_MAX) {
        estadoActual = STATE_SIRVIENDO_BEBIDA;
        Serial.println("En rango");
      }
      break;

    case STATE_SIRVIENDO_BEBIDA:
      handleSirviendoBebida();
      break;

    case STATE_BEBIDA_FINALIZADA:
      //handleBebidaFinalizada();
      estadoActual = STATE_ESPERANDO_INPUT;
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
    estadoActual = STATE_ESPERANDO_VASO;
    //estadoActual = STATE_SIRVIENDO_BEBIDA;
    digitalWrite(bebidaActual, LOW);
    ultrasonido.start();
  }
}

void handleEsperandoVaso() {
  if(ultrasonido.isFinished()) {
    Serial.println("FINISHED");
    if(ultrasonido.getRange() < DISTANCIA_VASO_MAX) {
      estadoActual = STATE_SIRVIENDO_BEBIDA;
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
      estadoActual = STATE_BEBIDA_FINALIZADA;
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
    estadoActual = STATE_ESPERANDO_INPUT;
  }
}

void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();
  scale->set_scale(factor);
}

float getTemperatura() {
  return (5.0 * analogRead(PIN_SENSOR_TEMP) * 100.0) / 1024.0;
}
