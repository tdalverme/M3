#include "HX711.h"
#include "AsyncSonarLib.h"
#include "Input.h"

/**************************************************/
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
#define STATE_VASO_AUSENTE 22
#define STATE_SIRVIENDO_BEBIDA 23
#define STATE_BEBIDA_FINALIZADA 24

typedef struct {
  int pinBebida1;
  int pinBebida2;
  int bebida1Porcentaje;
  int bebida2Porcentaje;
  int pinBebidaActual;
  float pesoObjetivo1;
} ConfigTrago;
/**************************************************/

              /*VARIABLES GLOBALES*/
/**************************************************/
HX711 scale;
AsyncSonar sonar(PIN_ULTRASONIDO_TRIG, sonarPingRecieved, sonarTimeOut);

int estadoActual;               //Variable que contiene el STATE actual

Trago tragoSeleccionado;
ConfigTrago config;
/**************************************************/

void setup() {
  Serial.begin(9600);           //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600);               //Velocidad del puerto del módulo Bluetooth

  initBalanza(&scale, PIN_BALANZA_DOUT, PIN_BALANZA_CLK, FACTOR_CALIBRACION);
  pinMode(PIN_RELAY_FERNET, OUTPUT);
  pinMode(PIN_RELAY_COCA, OUTPUT);
  digitalWrite(PIN_RELAY_FERNET, HIGH);
  digitalWrite(PIN_RELAY_COCA, HIGH);

  estadoActual = STATE_ESPERANDO_INPUT;
}


void loop() {
  switch(estadoActual) {
    case STATE_ESPERANDO_INPUT:
      handleEsperandoInput();
      break;

    case STATE_ESPERANDO_VASO:
      handleEsperandoVaso();
      break;

    case STATE_SIRVIENDO_BEBIDA:
      handleSirviendoBebida();
      break;

    case STATE_BEBIDA_FINALIZADA:
      handleBebidaFinalizada();
      break;

    case STATE_VASO_AUSENTE:
      handleVasoAusente();
      break;

    default:
      break;
  }
}

//Como usamos el relay NA Normal Abierto, tenemos logica invertida, es decir, hay que mandar un LOW para que encienda
void encenderRelay(int pin){
  digitalWrite(pin, LOW);
}

//Como usamos el relay NA Normal Abierto,  tenemos logica invertida, es decir, hay que mandar un HIGH para que apague
void apagarRelay(int pin){
  digitalWrite(pin, HIGH);
}

//Obtiene mensaje del bluetooth y setea el trago elegido
void handleEsperandoInput() {
  String input = getMessage();

  if(!input.equals("")) {
    tragoSeleccionado = parseInput();
    config = getConfig(tragoSeleccionado);
    estadoActual = STATE_ESPERANDO_VASO;
  }
}

//Setea pines x bebida y porcentaje de cada una
ConfigTrago getConfig(Trago trago) {
  ConfigTrago config;
  config.pinBebida1 = getPin(trago.bebida1);
  config.bebida1Porcentaje = trago.bebida1Porcentaje;
  config.pinBebida2 = getPin(trago.bebida2);
  config.bebida2Porcentaje = trago.bebida2Porcentaje;
  config.pesoObjetivo1 = PESO_MAX * tragoSeleccionado.porcentajeBebida1 / 100;
  config.bebidaActual = config.pinBebida1;
  return config;
}

//Obtiene el pin que corresponde a esa bebida
int getPin(char* bebida) {
  if(strcmp(bebida, "FERNET") == 0)
    return PIN_RELAY_FERNET;
  else if(strcmp(bebida, "COCA") == 0)
    return PIN_RELAY_COCA;
}

//Funcion asincronica para obtener un valor de medicion del sensor de ultrasonido
void sonarPingRecieved(AsyncSonar& sonar){
	int distance = sonar.GetMeasureMM();
  if(distance < DISTANCIA_VASO_MAX)
    estadoActual = STATE_SIRVIENDO_BEBIDA;
  else
    Serial.println("Esperando vaso");
}

//Funcion de timeout en caso de que el sensor de ultrasonido no detecte una distancia valida
void sonarTimeOut(AsyncSonar& sonar){
	Serial.println("No se coloco el vaso");
  estadoActual = STATE_VASO_AUSENTE;
}

//Mide hasta que se ingresa el vaso o sale por timeout
void handleEsperandoVaso() {
  sonar.Start();
  while(estadoActual == STATE_ESPERANDO_VASO)
    sonar.Update();
  sonar.Stop();
}

//En caso de que no se coloque el vaso cancela el trago
void handleVasoAusente(){
  Serial.println("Se cancela el trago");
  estadoActual = STATE_ESPERANDO_INPUT;
}

//Sirve la bebida
void handleSirviendoBebida() {    //Chequear estos while, creo que hay que cambiarlos pero ahora me da paja

  Serial.println("Sirviendo bebida");

  encenderRelay(config.bebidaActual);
  float pesoActual = scale.get_units(3);

  while(pesoactual <= pesoObjetivo1) {
    String log = "Peso actual: " + pesoActual + " Bomba: " + config.bebidaActual;
    Serial.println(log);
    pesoActual = scale.get_units(3);
  }

  apagarRelay(config.bebidaActual);
  String msg = "change|" + tragoSeleccionado.bebida1;
  sendMessage(msg);

  config.bebidaActual = config.bebida2;
  encenderRelay(config.bebidaActual);
  pesoActual = scale.get_units(3);

  while(pesoActual <= PESO_MAX) {
    String log = "Peso actual: " + pesoActual + " Bomba: " + config.bebidaActual;
    Serial.println(log);
    pesoActual = scale.get_units(3);
  }

  apagarRelay(bebidaActual);
  String msg = "change|" + tragoSeleccionado.bebida2;
  sendMessage(msg);

  Serial.println("Bebida servida");
  estadoActual = STATE_ESPERANDO_INPUT;
}

//Finaliza la bebida y mide la temperatura
void handleBebidaFinalizada() {
  float temperatura = getTemperatura;
  Serial.println("Bebida finalizada.");
  estadoActual = STATE_ESPERANDO_INPUT;
}

//Obtiene el valor de la temperatura
float getTemperatura() {
  int cantMediciones = 0;
  float sumadorTemp = 0.0;
  while(cantMediciones < CANT_MEDICIONES_TEMP){
    sumadorTemp += getTemperaturaDelSensor();
    cantMediciones++;
  }
  float temperatura = sumadorTemp / CANT_MEDICIONES_TEMP;
  String log = "Temperatura del trago: " + temperatura";
  Serial.println(log);
  return temperatura;
}

//Obtiene el valor de temperatura que da el sensor y lo devuelve de una manera utilizable
float getTemperaturaDelSensor() {
  return (5.0 * analogRead(PIN_SENSOR_TEMP) * 100.0) / 1024.0;
}

//Inicializa la balanza
void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();
  scale->set_scale(factor);
}
