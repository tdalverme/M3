#include "header.h"

//TODO chequear que las variables sean accesibles desde Smartban.ino
//TODO cambiar los while que creo que son bloqueantes por logica no bloqueante
//TODO agregar logica al llenado para que llene distintas cantidades, al principio mas y cada vez menos
//TODO medir cuanto llena en 1 segundo o 1 segundo y medio y sacar conclusiones

              /*VARIABLES GLOBALES*/
/**************************************************/
SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);

HX711 scale;
AsyncSonar sonar(PIN_ULTRASONIDO_TRIG, sonarPingRecieved, sonarTimeOut);

int estadoActual;               //Variable que contiene el STATE actual

Trago tragoSeleccionado;
ConfigTrago config;
/**************************************************/
                /*HANDLE STATES*/
/**************************************************/
//Obtiene mensaje del bluetooth y setea el trago elegido
void handleEsperandoInput() {
  String input = getMessage();

  if(!input.equals("")) {
    tragoSeleccionado = parseInput();
    config = getConfig(tragoSeleccionado);
    estadoActual = STATE_ESPERANDO_VASO;
  }
}

//Mide hasta que se ingresa el vaso o sale por timeout
void handleEsperandoVaso() {
  sonar.Start();
  while(estadoActual == STATE_ESPERANDO_VASO)
    sonar.Update();
  sonar.Stop();
}

//Sirve la bebida
void handleSirviendoBebida() {

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

//En caso de que no se coloque el vaso cancela el trago
void handleVasoAusente() {
  Serial.println("Se cancela el trago");
  estadoActual = STATE_ESPERANDO_INPUT;
}

//Finaliza la bebida y mide la temperatura
void handleBebidaFinalizada() {
  float temperatura = getTemperatura;
  Serial.println("Bebida finalizada.");
  estadoActual = STATE_ESPERANDO_INPUT;
}
/**************************************************/
                  /*UTILS*/
/**************************************************/
//Como usamos el relay NA Normal Abierto, tenemos logica invertida, es decir, hay que mandar un LOW para que encienda
void encenderRelay(int pin) {
  digitalWrite(pin, LOW);
}

//Como usamos el relay NA Normal Abierto,  tenemos logica invertida, es decir, hay que mandar un HIGH para que apague
void apagarRelay(int pin) {
  digitalWrite(pin, HIGH);
}

//Inicializa la balanza
void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();
  scale->set_scale(factor);
}

//Setea pines x bebida y porcentajes de cada una
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

//Funcion asincronica para obtener un valor de medicion del sensor de ultrasonido
void sonarPingRecieved(AsyncSonar& sonar) {
	int distance = sonar.GetMeasureMM();
  if(distance < DISTANCIA_VASO_MAX)
    estadoActual = STATE_SIRVIENDO_BEBIDA;
  else
    Serial.println("Esperando vaso");
}

//Funcion de timeout en caso de que el sensor de ultrasonido no detecte una distancia valida
void sonarTimeOut(AsyncSonar& sonar) {
	Serial.println("No se coloco el vaso");
  estadoActual = STATE_VASO_AUSENTE;
}
/**************************************************/
                /*MESSAGE UTILS*/
/**************************************************/
String getMessage() {
  String readString = "";

  while (BT.available()) {
    delay(10);
    char c = Serial.read();
    if (c == '@') {
      break;
    }
    readString += c;
  }

  if (readString.length() > 0) {
    String log = "Recibe: " + readString;
    Serial.println(log);
    return readString;
  }
  Serial.println("Input no disponible");
  return readString;
}

void sendMessage(String message) {
  BT.println(message);
}

Trago parseInput(char* input) {
    char* tokens[3];
    Trago tragoRecibido;

    tokens[0] = strtok(input,"|");
    for(int i = 1; i < 3; i++){
        tokens[i] = strtok(NULL,"|");
    }
    strcpy(tragoRecibido.bebida1, tokens[0]);
    tragoRecibido.bebida1Porcentaje = atoi(tokens[1]);
    strcpy(tragoRecibido.bebida2, tokens[2]);
    tragoRecibido.bebida2Porcentaje = 100 - tragoRecibido.bebida1Porcentaje;

    return tragoRecibido;
}
/**************************************************/
