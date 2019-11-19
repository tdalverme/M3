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

const Realm = require('realm');

import HomeScreen from './HomeScreen';
import FillingGlassHOC from './FillingGlassHOC';
const HOCComponent = FillingGlassHOC(HomeScreen);


// realm.write(() => {
//   var ID = this.state.input_user_id;
//   if (
//     realm.objects('user_details').filtered('user_id =' + input_user_id)
//       .length > 0
//   ) {
//     realm.delete(
//       realm.objects('user_details').filtered('user_id =' + input_user_id)
//     );
//   }
// });

// const BDDBebida = {
//   FERNET:{
//     graduacion: 39,
//   },
//   GANCIA:{
//     graduacion: 14.8,
//   }
// }

let realm;
class Home extends Component {
  state = {
    glassDetected: false,
    filling: false,
    drink: '',
    porcentaje: null
  };

  async componentDidMount() {
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
        realm.write(() => {
          realm.create('Ingested',{
            bebida: this.bebida.name,
            graduacionAlc : this.bebida.graduacionAlc * (this.bebida.ingredient1Percentage*250/100) * 0.80 / 100,
            fecha : new Date(),
            porcentaje : this.bebida.ingredient1Percentage

          });
        });
        this.navigation.navigate('FeedBack',{bebida:this.bebida.name})
        break;
      case 'change':
        this.setState({drink: data});
        break;
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
    this.setState({filling: true, drink: this.bebida.ingredient1,porcentaje:30}, async () => {
      console.warn(this.bebida.ingredient1 +'|'+this.bebida.ingredient1Percentage+'|'+this.bebida.ingredient2+'@');
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
        startFilling={this.startFilling}
        navigateMenuHome={this.navigateMenuHome} />
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(Home);
