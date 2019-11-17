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
import Slider from "react-native-slider";
const Realm = require('realm');



let realm;
export default class RegisterScreen extends PureComponent {
  state = {
    value : 0,
    thumbTintColor: '#64B5F6'

  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.navigation = props.navigation;
  }

  actualizarGraduacion = () =>{
    const valor = -this.state.value;
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink').filter(aux=>aux.name == 'Fernet con Coca')[0];
    realm.write(() => {
      this.bebida.ingredient1Percentage = this.bebida.ingredient1Percentage + parseInt(valor);
    });
    this.navigation.navigate('Menu')
  }
  handleChange = (value) =>{
    let thumbTintColor;
    const valueAux = Math.abs(value);
    if(valueAux > 0 && valueAux < 5){
      thumbTintColor = 'orange'
    }else if(valueAux >= 5 && valueAux <= 10){
      thumbTintColor = '#cc0000'
    }else {
      thumbTintColor = '#64B5F6'
    }
    this.setState({value:value,thumbTintColor})
  }

  render() {
    return (
        <View style= {{flex:0.6,justifyContent:'space-between'}}  >
          <View style ={{flex:0.5,justifyContent:'center',justifyItems:'center',alignItems:'center'}}>
              <Text>¿Cómo estuvo el {this.navigation.getParam('bebida')}?</Text>
              <Text>SmartBarman aprende de tu historial</Text>
          </View>
            <View style={{flex:0.7,padding:50}}>
              <Slider 
                  thumbTintColor = {this.state.thumbTintColor}
                  minimumValue={-10}
                  maximumValue={10}
                  step={1}
                value={this.state.value || 0}
                onValueChange={valor=>this.handleChange(valor)}
              />
              <View style= {{flex:0.8,flexDirection:'row',justifyContent:'space-around'}}>
                <View>
                <Text>Muy Flojito</Text>
                </View>
                <View>
                <Text>Ideal</Text>
                </View>
                <View>
                <Text>Muy Fuerte</Text>
                </View>
              </View>
            </View>
          <TouchableOpacity
              style={{backgroundColor: 'green', margin: 20}}
              onPress={this.actualizarGraduacion}>
              <Text style={{color: 'white', padding: 10}}>Guardar</Text>
          </TouchableOpacity>
        </View>
    );
  }
}
