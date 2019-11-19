import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ActivityIndicator,
  ToastAndroid,
  ImageBackground
} from 'react-native';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";
import ButtonMenu from '../../utils/ButtonMenu'


const styles = StyleSheet.create({
  container: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight:'bold',
    margin: 10,
  },

  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
messageEnable = 'Su bluetooth se encuentra desactivado'
messageArduino = 'No se encontró a SmartBarman'

class ConnectionScreen extends PureComponent {
  static navigationOptions = {
    headerTitle:'Detalle Estado Alcohólico',
  }
  state = {
    devices: [],
    data: '',
    connected: false,
    processing: false,
    message: '',
    isEnabled: false,
  };

  constructor(props){
    super(props)
    this.navigation = props.navigation
  }

  async componentDidMount() {
    
    this.events = this.props.events;
    this.findDevices();
    this.events.on("bluetoothEnabled", () => {
      ToastAndroid.show("Bluetooth activado.", ToastAndroid.SHORT);
      this.setState({ isEnabled: true });
    });

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
      this.setState({ isEnabled: false, connected: false });
    });

    this.events.on("connectionSuccess", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          '¡Conectado a SmartBarman!',
          ToastAndroid.SHORT
        );
      }
    });

    this.events.on("connectionFailed", ({ device }) => {
      if (device) {
        ToastAndroid.show('No se pudo conectar a SmartBarman.', ToastAndroid.SHORT);
      }
    });

    this.events.on("connectionLost", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          'Se perdió la conexión con SmartBarman',
          ToastAndroid.SHORT
        );
      }
    });
    
  }

  findDevices = async () => {
    try {
      this.setState({ processing: true, message: 'Conectando con SmartBarman' });

      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ]);

      if(isEnabled) {
        const arduinoBluetooth = devices.filter((device) => device.name === 'HC-05 ')[0];
        if(arduinoBluetooth) {
          this.setState({device: arduinoBluetooth});
          this.connect(arduinoBluetooth.id);
        } else {
          this.setState({message: 'No está conectado a SmartBarman. Revise en sus dispositivos bluethooth vinculados.',processing: false})
        }
      }else{
        this.setState({message: 'Active su Bluetooth y conectese con SmartBarman',processing: false})
      }
    } catch (e) {
      this.setState({message: e.message,processing: false});
    }
    
  }

  

  connect = async id => {


    try {
      const isConnect = await BluetoothSerial.device(id).isConnected();
      let connected = isConnect;
      if(!connected){
        connected = await BluetoothSerial.device(id).connect();
      }
      if ( connected ) {
        if(this.navigation.getParam('tragoAuto')){
          this.navigation.navigate('Home',{tragoAuto:true})
        }else{
          this.navigation.navigate('Home')
        }
        
      } else {
        ToastAndroid.show('No se pudo conectar a SmartBarman.', ToastAndroid.SHORT);
        this.setState({ processing: false, connected });
      }
    } catch (e) {
      ToastAndroid.show('Ocurrió un error al intentar conectarse a SmartBarman.', ToastAndroid.SHORT);
      this.setState({ processing: false, connected: false });
    }
  };

  // askForPermissions = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  //       {
  //         title: 'Acceso a la ubicación',
  //         message:
  //           'Para poder conectar el bluetooth necesitamos acceso a la ubicación',
  //         buttonNegative: 'No quiero conectarme',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       this.scanAndConnect();
  //     } else {
  //       console.warn('Location permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // }

  render() {
    const {processing,message } = this.state;
    return (
      
        <ImageBackground style={{
          flex:1,
          alignItems:'center',
        }}
        source={require('../../../assets/seleccion_bebida.jpg')}> 
        <View style={styles.container}>
          <View style={{flex:0.5,alignItems:'center',justifyContent:'space-between'}}>
            <Text style={styles.welcome}>{message}</Text>
          
              {
                processing && 
                <ActivityIndicator color="#efb810" size="large" />
              }    
              
              <ButtonMenu title={processing?'Recargar':'Conectar'}
              onPress={() => this.findDevices()}/>
            
          </View> 
        </View>
      </ImageBackground>
    );
  }
}



export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(ConnectionScreen);
