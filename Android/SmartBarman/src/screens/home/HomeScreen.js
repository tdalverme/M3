import React, { PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  FlatList,
  TouchableOpacity,
  Picker
} from 'react-native';
const Realm = require('realm');

import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

const GlassDetectedMessage = ({ detected }) => {
  if (detected) {
    return (
      <View style={{
        width: '100%', backgroundColor: 'green', flex: 0.1, selfAlign: 'flex-start', alignItems: 'center', justifyContent: 'center',
      }}
      >
        <Text style={{ color: 'white', padding: 10 }}> El vaso está en posición </Text>
      </View>
    );
  }
  return (
    <View style={{
      width: '100%', backgroundColor: 'red', flex: 0.1, selfAlign: 'flex-start', alignItems: 'center', justifyContent: 'center',
    }}
    >
      <Text style={{ color: 'white', padding: 10 }}> Posicione el vaso para comenzar </Text>
    </View>
  );
};
let realm;
class HomeScreen extends PureComponent {
  
  state = {
  
  };
  constructor(props){
    super(props)
    this.glassDetected = this.props.glassDetected
    this.startFilling = this.props.startFilling
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink')
   
  }
  
  render(){
    let serviceBebida = this.bebida.map( (s, i) => {
      return <Picker.Item key={s.name} value={s.name} label={s.name} />
    });

    return(   
      <View style={styles.container}>
        <GlassDetectedMessage detected={this.glassDetected} />

        <Picker  
          selectedValue={this.state.value|| '0'}
          items={this.bebida}
          onValueChange={(valor,indice) => {
            this.setState({bebida:valor.name})  
          }}>
            {serviceBebida}
        </Picker>

        <TouchableOpacity
          style={{
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'green', margin: 20,
          }}
          onPress={this.startFilling}
        >
          <Text style={{ color: 'white', padding: 20 }}>Empezar a llenar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

HomeScreen.navigationOptions = ({navigation}) => {
  return{
    headerTitle: 'Estado Alcohólico',
    headerLeft:(<View></View>)
  }
}
export default HomeScreen;
