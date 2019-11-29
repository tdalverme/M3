//Config pines relay
#define PIN_RELAY_FERNET 8
#define PIN_RELAY_COCA 7
#define PIN_RELAY_RON 2
#define MINIMO_SERVIDO_TIEMPO 2000
#define MINIMO_SERVIDO_GRAMOS 10
#define PESO_MAX 100

//Config pines bluetooth
#define PIN_BT_RX 10
#define PIN_BT_TX 11
#define BT_MSG_OK 1
#define BT_MSG_NOT_AVAILABLE 0
#define BT_MSG_PENDING 2

//Config celda de carga
#define PIN_BALANZA_DOUT  A1
#define PIN_BALANZA_CLK  A0
#define FACTOR_CALIBRACION -1060
#define CANT_MEDICIONES_BALANZA 10
#define ERROR_PESO -999

//Config sensor de ultrasonido
#define PIN_ULTRASONIDO_TRIG 4
#define PIN_ULTRASONIDO_ECHO 3
#define DISTANCIA_VASO_MAX 20
#define MEASURE_NOT_READY 25
#define GLASS_IS_CLOSE 26
#define GLASS_NOT_CLOSE 27
#define VELOCIDAD_SONIDO 0.034

//Config sensor de temperatura
#define PIN_SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 10
#define MILIVOLTS_A_CELSIUS 0.0048828125

//Config buzzer
#define PIN_BUZZER 12

//Config leds
#define PIN_LED_1 5
#define PIN_LED_2 6
#define PIN_LED_3 9
#define COLOR_ROJO 30
#define COLOR_AZUL 31
#define COLOR_VERDE 32
#define COLOR_APAGADO 33

//Estados posibles
#define STATE_ESPERANDO_INPUT 20
#define STATE_ESPERANDO_VASO 21
#define STATE_SIRVIENDO_BEBIDA 22
#define STATE_BEBIDA_FINALIZADA 23
#define STATE_NOTIFICAR_BEBIDA_LISTA 24

#define STATE_RELAY_OFF 40
#define STATE_GETTING_WEIGHT 41
#define STATE_RELAY_ON 42

// Tiempos
#define TIEMPO_ENTRE_MEDICIONES_ULTRASONIDO 500
#define TIEMPO_DETECTANDO_VASO 2500
#define TIEMPO_RESET_BALANZA 2500
#define TIEMPO_RESET_RELE 5000
#define TIEMPO_RESET_ULTRASONIDO 2
#define TIEMPO_TRIGGER_ULTRASONIDO 12
#define TIEMPO_ENTRE_CARACTERES 50

typedef struct {
  char bebida1[21];
  char bebida2[21];
  int bebida1Porcentaje;
  int bebida2Porcentaje;
} Trago;

typedef struct {
  int pinBebida1;
  int pinBebida2;
  int bebida1Porcentaje;
  int bebida2Porcentaje;
  int pinBebidaActual;
  float pesoObjetivo;
} ConfigTrago;
