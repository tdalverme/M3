import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  FlatList,
  TouchableOpacity,
  DeviceEventEmitter 
} from 'react-native';
import { SensorManager } from 'NativeModules';
import { NavigationEvents } from 'react-navigation';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";

const Realm = require('realm');

import HomeScreen from './HomeScreen';
import FillingGlassHOC from './FillingGlassHOC';
const HOCComponent = FillingGlassHOC(HomeScreen);





let realm;
class Home extends Component {
  state = {
    glassDetected: false,
    filling: false,
    drink: '',
    porcentaje: null,
    luz : 'LED_OFF'
  };

  

  async componentDidMount() {
    
    actualizarLuz = (luz) => {
      this.setState({luz})
    }
    this.events = this.props.events;
    this.navigation = this.props.navigation;
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink')[0];

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
    });

    BluetoothSerial.read(
      (data, intervalId) => {
        const message = data.replace(/(\r\n|\n|\r)/gm, "");
        this.processData(message);
        if (intervalId) {
          clearInterval(intervalId);
        }
      },
      "\r\n"
    );

    SensorManager.startLightSensor(100);
    DeviceEventEmitter.addListener('LightSensor', function (data) {
      if(data.light < 100){
        actualizarLuz('LED_ON')
        SensorManager.stopLightSensor();
        DeviceEventEmitter.removeListener('LightSensor');
      }
    });

    if(this.props.navigation.getParam('tragoAuto')){
      this.startFilling()
    }

  }

  parseMessage = (message) => {
    const parsed = message.split("|");
    return {
      type: parsed[0],
      data: parsed[1]
    }
  }

  processData = (message) => {
    const {type, data} = this.parseMessage(message);

    switch (type) {
      case 'finished':
        this.finishFilling()
        break;
      case 'change':
        this.setState({drink: data});
        break;
      case 'detected':
        this.setState({glassDetected: data === 'true', filling: true});
        break;
      case 'filling':
        this.setState({filling: data === 'true'});
        break;
      default:
    }
  }
  finishFilling = async () => {
    realm.write(() => {
      realm.create('Ingested',{
        bebida: this.bebida.name,
        graduacionAlc : this.bebida.graduacionAlc * (this.bebida.ingredient1Percentage*250/100) * 0.80 / 100,
        fecha : new Date(),
        porcentaje : this.bebida.ingredient1Percentage

      });
    });
    await BluetoothSerial.write(this.state.luz)
    this.navigation.navigate('FeedBack',{bebida:this.bebida.name})
  }
  startFilling = async () => {

    this.setState({filling: true, drink: this.bebida.ingredient1,porcentaje:30}, async () => {
      await BluetoothSerial.clear();
      await BluetoothSerial.write('#' + this.bebida.ingredient1 +'|'+this.bebida.ingredient1Percentage+'|'+this.bebida.ingredient2+'@')
    });
  }

  navigateMenuHome =  () => {
    this.navigation.navigate('Menu');
  }

  render() {
    const { glassDetected, filling, drink } = this.state;
    return (
      <HOCComponent
        drink={drink}
        filling={filling}
        glassDetected={glassDetected}
        startFilling={this.startFilling}/>
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(Home);
