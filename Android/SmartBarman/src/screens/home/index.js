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
    temperature: '',
    porcentaje: null,
    luz : '#LED_OFF@',
    currentDrink: 0,
    bebidas: []
  };

  async componentDidMount() {

    actualizarLuz = (luz) => {
      this.setState({luz})
    }
    this.events = this.props.events;
    this.navigation = this.props.navigation;
    realm = new Realm({ path: 'UserDatabase.realm' });
    const drinks = realm.objects('Drink');

    const bebidas = drinks.map((x) => ({ ...x }));
    this.setState({bebidas});
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
      if(data.light < 50) {
        actualizarLuz('#LED_ON@')
      } else {
        actualizarLuz('#LED_OFF@')
      }
      SensorManager.stopLightSensor();
      DeviceEventEmitter.removeListener('LightSensor');
    });

    if(this.props.navigation.getParam('tragoAuto')){
      this.startFilling(bebidas[0]);
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
        this.finishFilling();
        break;
      case 'change':
        this.setState({drink: data});
        break;
      case 'detected':
        this.setState({glassDetected: data === 'true', filling: true});
        break;
      case 'temperature':
        this.setState({ temperature: data });
        break;
      case 'filling':
        this.setState({filling: data === 'true'});
        break;
      default:
    }
  }

  changeCurrentDrink = (index) => {
    this.setState({ currentDrink: index });
  }

  finishFilling = async () => {
    const { temperature, bebidas, currentDrink } = this.state;
    realm.write(() => {
      realm.create('Ingested',{
        bebida: bebidas[currentDrink].name,
        graduacionAlc : bebidas[currentDrink].graduacionAlc * (bebidas[currentDrink].ingredient1Percentage * 250 / 100) * 0.80 / 100,
        fecha : new Date(),
        porcentaje : bebidas[currentDrink].ingredient1Percentage,
        temperature
      });
    });
    await BluetoothSerial.write(this.state.luz)
    this.navigation.navigate('FeedBack', { temperature, bebida: bebidas[currentDrink].name})
  }

  startFilling = async (bebida) => {
    this.setState({filling: true, drink: bebida.ingredient1, porcentaje:30}, async () => {
      await BluetoothSerial.clear();
      await BluetoothSerial.write('#' + bebida.ingredient1 +'|'+ bebida.ingredient1Percentage+'|'+ bebida.ingredient2+'@')
    });
  }

  navigateMenuHome =  () => {
    this.navigation.navigate('Menu');
  }

  render() {
    const { glassDetected, filling, drink, currentDrink, bebidas } = this.state;
    return (
      <HOCComponent
        drink={drink}
        filling={filling}
        glassDetected={glassDetected}
        startFilling={this.startFilling}
        changeCurrentDrink={this.changeCurrentDrink}
        currentDrink={currentDrink}
        bebidas={bebidas || []}
        />
    );
  }
}

export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(Home);
