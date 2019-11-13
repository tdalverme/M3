import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  FlatList,
  TouchableOpacity
} from 'react-native';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";

import HomeScreen from './HomeScreen';
import FillingGlassHOC from './FillingGlassHOC';


const HOCComponent = FillingGlassHOC(HomeScreen);

class Home extends Component {
  state = {
    glassDetected: false,
    filling: false,
    drink: ''
  };

  async componentDidMount() {
    this.events = this.props.events;

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
    });

    BluetoothSerial.read(
      (data, intervalId) => {
        console.warn('entro al read');
        const message = data.replace(/(\r\n|\n|\r)/gm, "");
        this.processData(message);
        if (intervalId) {
          clearInterval(intervalId);
        }
      },
      "\r\n"
    );
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
        this.state({filling: false})
      case 'change':
        this.setState({drink: data});
      case 'detected':
        this.setState({glassDetected: data === 'true'});
        break;
      case 'filling':
        this.setState({filling: data === 'true'});
        break;
      default:
    }
  }

  startFilling = async () => {
    await BluetoothSerial.clear();
    //aca habria que consultar el nivel de alcohol que hay guardado en realm
    this.setState({filling: true, drink: 'FERNET'}, async () => {
      await BluetoothSerial.write("FERNET|30|COCA@");
    });
  }

  render() {
    const { glassDetected, filling, drink } = this.state;
    return (
      <HOCComponent
        drink={drink}
        filling={filling}
        glassDetected={glassDetected}
        startFilling={this.startFilling} />
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: false,
})(Home);
