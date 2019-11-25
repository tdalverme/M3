# Proyecto SOA: Smart Barman
Sistema embebido que prepara tragos de forma automatizada.
## Presentación

**Materia:** *Sistemas Operativos Avanzados 2C2019*

**Integrantes:**
 - Dal Verme, Tomas (tdalverme)
 - De Arias, Axel (axeldearias)
 - Figueredo, Nicolas Leandro (nicofigueredo)
 - Quinteiro, Lucas (lucasq95)
 - Rodriguez, Maximiliano Pablo (maxiprodriguez)

 ## Descripción del Proyecto
 Este proyecto consiste en el desarrollo de un sistema embebido que prepara tragos manteniendo un perfil por cada usuario de acuerdo a sus preferencias.
 ## Objetivos del Sistema
 El trago ideal no existe, pero si existe el mejor trago para cada persona. El objetivo de Smart Barman es obtener las medidas del trago ideal del usuario y preparárselo. Para ello, el sistema contará con diferentes sensores y actuadores que le permitirá llevar a cabo sus funciones.
 El usuario contará con una aplicación Android en donde podrá elegir el trago a preparar e ingresar sus preferencias, para que el sistema pueda realizar la bebida a su gusto.
 ## Sensores y Actuadores
 Para cumplir con sus tareas, el sistema embebido poseerá los siguientes sensores y actuadores:
 ### Sensores
- **Celda de carga hasta 1kg. con amplificador HX711:** para realizar la medición de la cantidad de líquido.
- **Sensor de temperatura LM-35:** para medir si la bebida se encuentra fría o caliente.
- **Sensor de ultrasonido HC-SR04:** para sensar que haya un vaso antes de comenzar a servir la bebida.
### Actuadores
- **Bombas de agua sumergible 3-5V:** se encargarán de mover el líquido del recipiente conteniendo la bebida al vaso.
- **Módulo relé de 4 canales:** para poder encender y apagar las distintas bombas de agua.
- **Led:** para informar visualmente los distintos estados del sistema (esperando pedido, preparando trago, trago listo).
- **Buzzer:** para informar auditivamente cuando el trago esta listo. 
## Funcionamiento del sistema
El usuario deberá seleccionar en la aplicación Android el trago que desea tomar. A continuación, el sistema comenzará a preparar el trago de acuerdo a las preferencias del usuario (si es la primera vez, se hará con los valores por defecto). Una vez que el sistema terminó de preparar la bebida, avisará al usuario mediante la app y mediante el led que su trago está listo para retirar, notificándole si es necesario agregar hielo o no, de acuerdo a la temperatura de la bebida medida por el sistema. Posteriormente, en la aplicación se le realizarán al usuario distintas preguntas relacionadas a la preparación de la bebida (¿está frío?, ¿está muy fuerte/suave?, etc.). Luego de ingresadas las respuestas, el sistema actualizará las preferencias del usuario para la próxima vez y así obtener el trago perfecto para la persona.
## Diagramas de bloques
### Diagrama Funcional
![Diagrama Funcional](https://b.imge.to/2019/09/23/vTNCMH.jpg)
### Diagrama Físico
![Diagrama Físico](https://b.imge.to/2019/09/23/vTNsIH.jpg)
### Esquema Físico
#### Vista Frontal
![Vista Frontal](https://b.imge.to/2019/09/23/vTdidt.jpg)


#### Vista Lateral
![Vista Lateral](https://b.imge.to/2019/09/23/vTdDPy.jpg)
### Diagrama de Conexión
![Diagrama Físico](https://a.imge.to/2019/09/23/vTdWLx.jpg)

#### Descripción de Aplicación de Android

Para utilizar Smart Barman únicamente podrá realizarlo a través de la aplicación en Android, en la cual el usuario podrá crear su perfil, seleccionar las bebidas que desee, indicando como resulto la experiencia con cada trago y Smart Barman adecuando las próximas bebidas que pida, para así obtener el trago perfecto para cada persona. También la aplicación le informara la temperatura del trago, el nivel de alcohol en sangre, y si esta apto o no para conducir. Los sensores utilizados del Smartphone son: 
- Acelerómetro: Para solicitar la bebida con la detección de Shake en el Smartphone. 
- Huella Dactilar: Para acceder a la aplicación de Android. 
- Luz: Para encender el Led del embebido.

Para comunicarnos con Smart Barman, lo hacemos a través del Bluetooth, para solicitar una bebida e interactuar con el embebido tenemos que estar vinculados con el Bluetooth.

#### Manual de Usuario

1.	Encender el Bluetooth del Smartphone.
2.	Conectarse a través de la Aplicación de Android al Sistema Embebido: Smart Barman. 
3.	La aplicación mostrara un mensaje cuando la conexión se encuentre establecida. 
4.	Luego deberá completar su perfil con datos serán utilizados para informar la cantidad de alcohol en sangre: 
     - Nombre
     - Altura (en Centímetros)
     - Peso (en Kilogramos)    
5.	A continuación, debe autenticarse con su huella dactilar con el lector del Smartphone. 
6.	En el menú de inicio podrá seleccionar entre: 
     - Preparar un trago
     - Ver mi estado alcohólico 
     - Editar mis datos   
7.	Opción: **Preparar un trago**: 
     - Al seleccionar esta opción podrá elegir entre las bebidas disponibles. 
     - Cuando selecciona la bebida, presiona el botón “Comenzar”. 
     - Deberá colocar el vaso en la posición correspondiente. Una vez que este colocado, se comenzara a servir la bebida con las graduaciones por defecto. 
     - A través del Led podrá ver los diferentes estados: 
          - Rojo: Esperando pedido. 
          - Azul: En preparación. 
          - Verde: Terminado. 
     - Una vez finalizada la bebida, podrá retirarla y beberla. 
     - En la aplicación podrá visualizar la temperatura de la bebida (en grados centígrados), y deberá indicar que le pareció la bebida, para tener en cuenta en la próxima graduación de la bebida a servir y así obtener el trago perfecto para cada persona. Las opciones son: 
          - Flojito (próxima bebida con mayor graduación alcohólica)
          - Ideal (próxima bebida con igual graduación alcohólica)
          - Fuerte (próxima bebida con menor graduación alcohólica)         
8.	Opción: **Ver mi estado alcohólico**, para consultar el historial de bebidas consumidas y el nivel de alcohol en sangre, mostrará el estado alcohólico en base a la información de las últimas 8 horas. 
9.	Opción: **Editar mis datos**, dentro de esta opción podrá editar la información del perfil (Nombre, Altura y Peso)
