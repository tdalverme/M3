import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  View,
  Picker
  
} from 'react-native';
const Realm = require('realm');



let realm;
export default class RegisterScreen extends PureComponent {
  state = {
    value : 0
  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.navigation = props.navigation;
  }

  actualizarGraduacion = () =>{
    const valor = this.state.value;
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink').filter(aux=>aux.name == 'Fernet con Coca')[0];
    realm.write(() => {
      this.bebida.ingredient1Percentage = this.bebida.ingredient1Percentage + parseInt(this.state.value);
    });
    this.navigation.navigate('Menu')
  }

  render() {
    return (
        <View style={{flex:0.8,justifyItems:'center',alignContent:'center'}} >
       <View style ={{flex:0.5,justifyContent:'center',justifyItems:'center',alignItems:'center'}}>
           <Text>¿Cómo estuvo el {this.navigation.getParam('bebida')}?</Text>
           <Text>SmartBarman aprende de tu historial</Text>
       </View>
        <Picker  
            selectedValue={this.state.value|| '0'}
            onValueChange={(valor,indice) => {
              this.setState({value:valor})  
            }}>
            <Picker.Item label="Muy Suave"
            value="10" />
            <Picker.Item label="Suave"
            value="5" />
            <Picker.Item label="Excelente"
            value="0" />
            <Picker.Item label="Amargo"
            value="-5" />
            <Picker.Item label="Muy Amargo"
            value="-10" />
        </Picker>
        
        <TouchableOpacity
            style={{backgroundColor: 'green', margin: 20}}
            onPress={this.actualizarGraduacion}>
            <Text style={{color: 'white', padding: 10}}></Text>
        </TouchableOpacity>
        </View>

    );
  }
}
