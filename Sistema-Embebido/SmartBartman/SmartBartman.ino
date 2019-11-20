#include "Input.h"

/****************************************/
int estadoActual;
/****************************************/
void setup() {
  Serial.begin(9600);       //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600);           //Velocidad del puerto del módulo Bluetooth
  initBalanza();

  pinMode(PIN_RELAY_FERNET, OUTPUT);
  pinMode(PIN_RELAY_COCA, OUTPUT);

  pinMode(PIN_BUZZER, OUTPUT);

  pinMode(PIN_ULTRASONIDO_TRIG, OUTPUT); // Sets the trigPin as an Output
  pinMode(PIN_ULTRASONIDO_ECHO, INPUT); // Sets the echoPin as an Input

  apagarRelay(PIN_RELAY_FERNET);
  apagarRelay(PIN_RELAY_COCA);

  estadoActual = STATE_ESPERANDO_INPUT;

  encenderLed1();

  Serial.println("[SETUP] Setup terminado");
  Serial.println("[ESPERANDO_INPUT] Esperando datos por bluetooth");
}

/****************************************/
Trago tragoSeleccionado;
ConfigTrago config;

/****************************************/

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

    default:
      break;
  }
}

void handleEsperandoInput() {
  if(getBluetoothMsg() == BT_MSG_OK) {
    tragoSeleccionado = parseInput(&bluetoothMsg[0]);
    bluetoothMsg = "";
    config = getConfig(tragoSeleccionado);
    estadoActual = STATE_ESPERANDO_VASO;
    encenderLed2();
  }
}

/****************************************/
unsigned long previousMillis;
/****************************************/
boolean millisPassed(long n) {
  return millis() - previousMillis >= n;
}

void resetMillis() {
  previousMillis = millis();
}

/****************************************/
int primerIncremental;
int segundoIncremental;
int incremental;
int primerTopeEnGramos;
int segundoTopeEnGramos;
boolean finished;

//200g = FERNET 30% + COCA 70%
//200g = 200g / 100 * 30 + 200g / 100 * 70
//200g = 60g + 140g

//2000 ms => 10g
//x    ms => 60g    12000 ms => 60g
//primerIncremental = 60g * 2000 / 10 = 12000s
//60g ~= 30g + 15g + 10g +10g
/****************************************/


boolean measureGlassPosition() {
  // Clears the trigPin
  digitalWrite(PIN_ULTRASONIDO_TRIG, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(PIN_ULTRASONIDO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_ULTRASONIDO_TRIG, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  long duration = pulseIn(PIN_ULTRASONIDO_ECHO, HIGH);
  // Calculating the distance
  long distance = duration * 0.034/2;
  Serial.print("[ESPERANDO_VASO] Distance: ");
  Serial.println(distance);

  return (distance <= DISTANCIA_VASO_MAX);
}

void handleEsperandoVaso() {

  if(measureGlassPosition()) {
    Serial.println("[SIRVIENDO_BEBIDA] Calculando proporciones");

    primerTopeEnGramos = (int) PESO_MAX / 100 * config.bebida1Porcentaje;
    segundoTopeEnGramos = (int ) PESO_MAX / 100 * config.bebida2Porcentaje; //Seria el PESO_MAX
    primerIncremental = (int) (primerTopeEnGramos * MINIMO_SERVIDO_TIEMPO) / MINIMO_SERVIDO_GRAMOS;
    segundoIncremental = (int) (segundoTopeEnGramos * MINIMO_SERVIDO_TIEMPO) / MINIMO_SERVIDO_GRAMOS;
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
    encenderLed3();
    previousMillis = millis();
  }
  else {
    sendMessage("detected|false");
  }
  
}

void siguienteBebida() {
  config.pinBebidaActual = config.pinBebida2;
  config.pesoObjetivo += segundoTopeEnGramos;
  incremental = segundoIncremental;
  Serial.println("[SIRVIENDO_BEBIDA][CAMBIO] Siguiente bebida");
  sendMessage("change|COCA");
}

/****************************************/
boolean done1 = false;
boolean done2 = false;
float pesoActual;
/****************************************/

void handleSirviendoBebida() {
    if(!finished) {

      if(millisPassed(incremental) && !done1) {
        apagarRelay(config.pinBebidaActual);
        log_float("[SIRVIENDO_BEBIDA][RELE_OFF] Llenado por: ", millis() - previousMillis, "ms");
        done1 = true;
      }
      if(millisPassed(2500 + incremental) && !done2) {
        log_float("[SIRVIENDO_BEBIDA][WEIGHT] Se espero hasta: ", millis() - previousMillis, "ms");
        pesoActual = getWeight();
        done2 = true;
      }
       if(millisPassed(5000 + incremental)){
        
        log_float("[SIRVIENDO_BEBIDA][RELE_ON] Time since last measure: ", millis() - previousMillis, "ms");        
        if(pesoActual >= PESO_MAX){
          finished = true;
          Serial.println("[SIRVIENDO_BEBIDA][FINISHED] Bebida lista");
        }
        else if(pesoActual >= config.pesoObjetivo)
          siguienteBebida();
        else if(incremental > MINIMO_SERVIDO_TIEMPO)
          incremental /= 2;
        done1 = false;
        done2 = false;
        resetMillis();
        if(!finished)
          encenderRelay(config.pinBebidaActual);
        
      }
    }
    else {
      estadoActual = STATE_BEBIDA_FINALIZADA;
      sendMessage("finished");
      digitalWrite(PIN_BUZZER, HIGH);
      delay(1000);
      digitalWrite(PIN_BUZZER, LOW);
    }
}

/****************************************/
int cantMediciones = 0;
float sumadorTemp = 0;
float temperatura;
/****************************************/

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
    estadoActual = STATE_ESPERANDO_INPUT;
    encenderLed1();
    Serial.println("[ESPERANDO_INPUT] Esperando datos por bluetooth");
  }
}

float getTemperatura() {
  return (5.0 * analogRead(PIN_SENSOR_TEMP) * 100.0) / 1024.0;
}

void encenderLed1() {
  analogWrite(PIN_LED_1, 0);
  analogWrite(PIN_LED_2, 255);
  analogWrite(PIN_LED_3, 255);
}

void encenderLed2() {
  analogWrite(PIN_LED_1, 255);
  analogWrite(PIN_LED_2, 0);
  analogWrite(PIN_LED_3, 255);
}

void encenderLed3() {
  analogWrite(PIN_LED_1, 255);
  analogWrite(PIN_LED_2, 255);
  analogWrite(PIN_LED_3, 0);
}
