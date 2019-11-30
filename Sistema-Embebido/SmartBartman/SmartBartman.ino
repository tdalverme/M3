#include "Input.h"
#include <SoftwareSerial.h>
#include "HX711.h"

/****************************************/
SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);
HX711 scale;

int estadoActual;
String bluetoothMsg;
unsigned long previousMillis;
unsigned long previousMicros;
Trago tragoSeleccionado;
ConfigTrago config;
int primerIncremental;
int segundoIncremental;
int incremental;
int primerTopeEnGramos;
int segundoTopeEnGramos;
boolean finished;
int estadoSirviendoBebida;
float pesoActual;
int cantMediciones;
float sumadorTemp;
float temperatura;
boolean msgStarted;
int isCloseEnough;
boolean ledOn;
/****************************************/

void setup() {
  Serial.begin(9600);       //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600);           //Velocidad del puerto del módulo Bluetooth
  initBalanza();

  pinMode(PIN_RELAY_FERNET, OUTPUT);
  pinMode(PIN_RELAY_COCA, OUTPUT);
  pinMode(PIN_RELAY_RON, OUTPUT);
  apagarRelay(PIN_RELAY_FERNET);
  apagarRelay(PIN_RELAY_COCA);
  apagarRelay(PIN_RELAY_RON);

  pinMode(PIN_BUZZER, OUTPUT);

  pinMode(PIN_ULTRASONIDO_TRIG, OUTPUT);
  pinMode(PIN_ULTRASONIDO_ECHO, INPUT);

  estadoActual = STATE_ESPERANDO_INPUT;
  estadoSirviendoBebida = STATE_RELAY_OFF;
  
  cantMediciones = 0;
  sumadorTemp = 0;
  msgStarted = false;
  isCloseEnough = MEASURE_NOT_READY;
  ledOn = true;
  encenderLed(COLOR_ROJO);


  Serial.println("[SETUP] Setup terminado");
  Serial.println("[ESPERANDO_INPUT] Esperando datos por bluetooth");
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

    case STATE_NOTIFICAR_BEBIDA_LISTA:
      handleNotificarBebidaLista();
      break;

    default:
      break;
  }
}

void handleEsperandoInput() {
  if(getBluetoothMsg() == BT_MSG_OK) {
    if(bluetoothMsg.equals("LED_ON")){
      ledOn = true;
      encenderLed(COLOR_ROJO);
    }
    else if(bluetoothMsg.equals("LED_OFF")){
      encenderLed(COLOR_APAGADO);
      ledOn = false;
    }
    else {
      tragoSeleccionado = parseInput(&bluetoothMsg[0]);    
      config = getConfig(tragoSeleccionado);
      estadoActual = STATE_ESPERANDO_VASO;
      encenderLed(COLOR_AZUL);
      resetMillis();
    }
    bluetoothMsg = "";  
  }
}

/****************************************/
//200g = FERNET 30% + COCA 70%
//200g = 200g / 100 * 30 + 200g / 100 * 70
//200g = 60g + 140g

//2000 ms => 10g
//x    ms => 60g    12000 ms => 60g
//primerIncremental = (60g * 2000 / 10) / 2 = (12000ms) / 2 = 6000ms
//60g ~= 30g + 15g + 10g +10g
/****************************************/

void handleEsperandoVaso() {

  if(millisPassed(TIEMPO_ENTRE_MEDICIONES_ULTRASONIDO)) {
    isCloseEnough = glassIsCloseEnough();

    if(isCloseEnough == GLASS_IS_CLOSE) {
      sendMessage("detected|true");
      Serial.println("[ESPERANDO_VASO] Vaso detectado");
      resetMillis();
    }
    else if(isCloseEnough == GLASS_NOT_CLOSE) {
      sendMessage("detected|false");
      Serial.println("[ESPERANDO_VASO] Vaso no detectado");
      resetMillis();
    } else if(isCloseEnough == MEASURE_NOT_READY) {
      sendMessage("detected|false");
      Serial.println("[ESPERANDO_VASO] La medicion no esta lista");
    }
  }
  if(millisPassed(TIEMPO_DETECTANDO_VASO) && isCloseEnough) {
    isCloseEnough = false;
    Serial.println("[SIRVIENDO_BEBIDA] Calculando proporciones");
    primerTopeEnGramos = (int) PESO_MAX / 100 * config.bebida1Porcentaje;
    segundoTopeEnGramos = (int ) PESO_MAX / 100 * config.bebida2Porcentaje; //Seria el PESO_MAX
    primerIncremental = (int) ((primerTopeEnGramos * MINIMO_SERVIDO_TIEMPO) / MINIMO_SERVIDO_GRAMOS) / 2;
    segundoIncremental = (int) ((segundoTopeEnGramos * MINIMO_SERVIDO_TIEMPO) / MINIMO_SERVIDO_GRAMOS) / 2;
    incremental = primerIncremental;
    finished = false;

    Serial.print("\tPrimer tope: ");
    Serial.print(primerTopeEnGramos);
    Serial.print("\tPrimer incremental: ");
    Serial.println(primerIncremental);
    Serial.print("\tSegundo tope: ");
    Serial.print(segundoTopeEnGramos);
    Serial.print("\tSegundo incremental: ");
    Serial.println(segundoIncremental);

    Serial.println("[SIRVIENDO_BEBIDA] Sirviendo");
    Serial.println("[SIRVIENDO_BEBIDA][RELE_ON] Sirviendo...");
    sendMessage("detected|true");
    sendMessage("change|FERNET");      
    encenderRelay(config.pinBebidaActual);
    estadoActual = STATE_SIRVIENDO_BEBIDA;
    encenderLed(COLOR_VERDE);
    resetMillis();
  }
}



void handleSirviendoBebida() {
    if(!finished) {
      switch(estadoSirviendoBebida) {
        case STATE_RELAY_OFF:
          if(millisPassed(incremental)){
            apagarRelay(config.pinBebidaActual);
            log_float("[SIRVIENDO_BEBIDA][RELE_OFF] Llenado por: ", millis() - previousMillis, "ms");
            estadoSirviendoBebida = STATE_GETTING_WEIGHT;
          }
          break;
        case STATE_GETTING_WEIGHT:
          if(millisPassed(TIEMPO_RESET_BALANZA + incremental)) {
            log_float("[SIRVIENDO_BEBIDA][WEIGHT] Se espero hasta: ", millis() - previousMillis, "ms");
            pesoActual = getWeight();
            estadoSirviendoBebida = STATE_RELAY_ON;
          }
          break;
        case STATE_RELAY_ON:
          if(millisPassed(TIEMPO_RESET_RELE + incremental)){
            log_float("[SIRVIENDO_BEBIDA][RELE_ON] Time since last measure: ", millis() - previousMillis, "ms");
            if(pesoActual >= PESO_MAX){
              finished = true;
              Serial.println("[SIRVIENDO_BEBIDA][FINISHED] Bebida lista");
            }
            else if(pesoActual >= config.pesoObjetivo)
              siguienteBebida();
            else if(incremental > MINIMO_SERVIDO_TIEMPO){
              if(incremental / 2 > MINIMO_SERVIDO_TIEMPO)
                incremental /= 2;
              else
                incremental = MINIMO_SERVIDO_TIEMPO;
            }
            estadoSirviendoBebida = STATE_RELAY_OFF;
            resetMillis();
            if(!finished)
              encenderRelay(config.pinBebidaActual);
            }
            break;
          }
        }
    else {
      estadoActual = STATE_BEBIDA_FINALIZADA;
    }
}

void handleBebidaFinalizada() {
  if(cantMediciones < CANT_MEDICIONES_TEMP) {
    sumadorTemp += getTemperatura();
    cantMediciones++;
  }
  else {
    temperatura = sumadorTemp / CANT_MEDICIONES_TEMP;
    cantMediciones = 0;
    sumadorTemp = 0;
    Serial.print("[BEBIDA_FINALIZADA] Temperatura de trago: ");
    Serial.print(temperatura);
    Serial.println("°C");
    estadoActual = STATE_NOTIFICAR_BEBIDA_LISTA;
    resetMillis();
    digitalWrite(PIN_BUZZER, HIGH);
  }
}



void handleNotificarBebidaLista() {
  if(millisPassed(1000)) {
    digitalWrite(PIN_BUZZER, LOW);
    String logTemperature = "temperature|" + String(temperatura);
    sendMessage(logTemperature);
    sendMessage("finished");
    estadoActual = STATE_ESPERANDO_INPUT;
    encenderLed(COLOR_ROJO);
    resetMillis();
    Serial.println("[ESPERANDO_INPUT] Esperando datos por bluetooth");
  }
}


                /*UTILS*/
/****************************************/
void encenderRelay(int pin) {
  digitalWrite(pin, LOW);
}

void apagarRelay(int pin) {
  digitalWrite(pin, HIGH);
}

void siguienteBebida() {
  config.pinBebidaActual = config.pinBebida2;
  config.pesoObjetivo += segundoTopeEnGramos;
  incremental = segundoIncremental;
  Serial.println("[SIRVIENDO_BEBIDA][CAMBIO] Siguiente bebida");
  sendMessage("change|COCA");
}

void log_float(String msg, float n, String unit) {
  Serial.print(msg);
  Serial.print(n);
  Serial.println(unit);
}

float getWeight() {
  float pesoActual;
  for(int i = 0; i < CANT_MEDICIONES_BALANZA; i++){
    pesoActual = scale.get_units(3);
    if(pesoActual >= 0)
      break;
    else
      pesoActual = ERROR_PESO;
  }
  log_float("\t\tPeso actual: ", pesoActual, "g");
  return pesoActual;
}

int glassIsCloseEnough() {
  // Clears the trigPin
  digitalWrite(PIN_ULTRASONIDO_TRIG, LOW);
  if(microsPassed(TIEMPO_RESET_ULTRASONIDO)) {
    // Sets the trigPin on HIGH state for 10 micro seconds
    digitalWrite(PIN_ULTRASONIDO_TRIG, HIGH);

    if(microsPassed(TIEMPO_TRIGGER_ULTRASONIDO)) {
      digitalWrite(PIN_ULTRASONIDO_TRIG, LOW);
      // Reads the echoPin, returns the sound wave travel time in microseconds
      long duration = pulseIn(PIN_ULTRASONIDO_ECHO, HIGH);
      // Calculating the distance
      long distance = duration * VELOCIDAD_SONIDO / 2;
      Serial.print("[ESPERANDO_VASO] Distance: ");
      Serial.println(distance);
      resetMicros();
      return (distance <= DISTANCIA_VASO_MAX) ? GLASS_IS_CLOSE : GLASS_NOT_CLOSE;
    }
    else {
      return MEASURE_NOT_READY;
    }
  }

  return MEASURE_NOT_READY;;
}


boolean millisPassed(long n) {
  return millis() - previousMillis >= n;
}

void resetMillis() {
  previousMillis = millis();
}

boolean microsPassed(long n) {
  return micros() - previousMicros >= n;
}

void resetMicros() {
  previousMicros = micros();
}

void encenderLed(int color) {
  if(ledOn) {
    switch(color) {
      case COLOR_AZUL:
        analogWrite(PIN_LED_1, 255);
        analogWrite(PIN_LED_2, 000);
        analogWrite(PIN_LED_3, 000);
        break;
      case COLOR_VERDE:
        analogWrite(PIN_LED_1, 000);
        analogWrite(PIN_LED_2, 255);
        analogWrite(PIN_LED_3, 000);
        break;
      case COLOR_ROJO:
        analogWrite(PIN_LED_1, 000);
        analogWrite(PIN_LED_2, 000);
        analogWrite(PIN_LED_3, 255);
        break;
      case COLOR_APAGADO:
        analogWrite(PIN_LED_1, 0);
        analogWrite(PIN_LED_2, 0);
        analogWrite(PIN_LED_3, 0);
        break;
    } 
  }
}

void initBalanza() {
  scale.begin(PIN_BALANZA_DOUT, PIN_BALANZA_CLK);
  scale.set_scale();
  scale.tare();
  scale.set_scale(FACTOR_CALIBRACION);
}

void btFlush(){
  while(BT.available() > 0) {
    char t = BT.read();
  }
}

int getBluetoothMsg() {
  if(BT.available() && millisPassed(TIEMPO_ENTRE_CARACTERES)) {
    resetMillis();
    char c = BT.read();

    if(c == '#'){
      msgStarted = true;
      return BT_MSG_PENDING;
    }
    if(msgStarted) {
      if (c != '@') {
        bluetoothMsg += c;
        return BT_MSG_PENDING;
      }
      else {
        Serial.print("[ESPERANDO_INPUT][MSG] ");
        Serial.println(bluetoothMsg);
        Serial.print("[ESPERANDO_INPUT][BYTES_READ] ");
        Serial.println(bluetoothMsg.length());
        btFlush();
        msgStarted = false;
        return BT_MSG_OK;
      }
    }
    return BT_MSG_PENDING;
  }
  return BT_MSG_NOT_AVAILABLE;
}

void sendMessage(String message) {
  BT.println(message);
  btFlush();
}

Trago parseInput(String bluetoothMsg) {
  char* tokens[3];
  Trago tragoRecibido;

  char _bluetoothMsg[bluetoothMsg.length() + 1];
  bluetoothMsg.toCharArray(_bluetoothMsg, bluetoothMsg.length() + 1);

  tokens[0] = strtok(_bluetoothMsg,"|");
  for(int i = 1; i < 3; i++) {
    tokens[i] = strtok(NULL,"|");
  }

  strcpy(tragoRecibido.bebida1, tokens[0]);
  tragoRecibido.bebida1Porcentaje = atoi(tokens[1]);
  strcpy(tragoRecibido.bebida2, tokens[2]);
  tragoRecibido.bebida2Porcentaje = 100 - tragoRecibido.bebida1Porcentaje;

  Serial.println("[ESPERANDO_INPUT] Mensaje parseado");
  Serial.print("\tBebida1: ");
  Serial.print(tragoRecibido.bebida1);
  Serial.print(" Porcentaje: ");
  Serial.println(tragoRecibido.bebida1Porcentaje);
  Serial.print("\tBebida2: ");
  Serial.print(tragoRecibido.bebida2);
  Serial.print(" Porcentaje: ");
  Serial.println(tragoRecibido.bebida2Porcentaje);

  return tragoRecibido;
}

//Obtiene el pin que corresponde a esa bebida
int getPin(char* bebida) {
  if(strcmp(bebida, "FERNET") == 0)
  return PIN_RELAY_FERNET;
  else if(strcmp(bebida, "COCA") == 0)
  return PIN_RELAY_COCA;
  else if(strcmp(bebida, "RON") == 0)
  return PIN_RELAY_RON;
}

//Setea pines x bebida y porcentajes de cada una
ConfigTrago getConfig(Trago trago) {
  ConfigTrago config;
  config.pinBebida1 = getPin(trago.bebida1);
  config.bebida1Porcentaje = trago.bebida1Porcentaje;
  config.pinBebida2 = getPin(trago.bebida2);
  config.bebida2Porcentaje = trago.bebida2Porcentaje;
  config.pesoObjetivo = PESO_MAX * trago.bebida1Porcentaje / 100;
  config.pinBebidaActual = config.pinBebida1;

  Serial.println("[ESPERANDO_INPUT] Config seteada");
  Serial.print("\tPin Bebida1: ");
  Serial.print(config.pinBebida1);
  Serial.print(" Porcentaje: ");
  Serial.println(config.bebida1Porcentaje);
  Serial.print("\tPin Bebida2: ");
  Serial.print(config.pinBebida2);
  Serial.print(" Porcentaje: ");
  Serial.println(config.bebida2Porcentaje);
  Serial.print("\tPeso objetivo: ");
  Serial.println(config.pesoObjetivo);
  Serial.print("\tPin bebida actual: ");
  Serial.println(config.pinBebidaActual);

  return config;
}

float getTemperatura() {
  return (MILIVOLTS_A_CELSIUS * analogRead(PIN_SENSOR_TEMP) * 100.0);
}
