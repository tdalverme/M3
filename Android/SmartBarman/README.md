# Smart Bartman

## Configuración del entorno

En este [link](https://facebook.github.io/react-native/docs/getting-started) está toda la documentación necesaria para configurar el entorno.

## Instalación

1. La primera vez que vayamos a correr la app hay que hacer antes `npm install` asi se instalan las dependencias definidas en el package.json.
Luego de esto se va a crear la carpeta node_modules.

2. Hay que pararse en el directorio root del proyecto (generalmente es a la altura del package.json) y en la consola tirar:
`react-native run-android`. Fijarse que antes tener el celu conectado y configurado en modo desarrollador.

3. En el caso de que tire `"Cannot connect to development server."` o `"Unable to load script."`, volver a la consola y hacer `npm start`.
A veces el servidor para debuggear se levanta solo y otras veces hay que levantarlo a mano.
