import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  View,
  KeyboardAvoidingView
} from 'react-native';
import ButtonMenu from '../../utils/ButtonMenu'
import InputBarman from '../../utils/InputBarman'
import TouchID from 'react-native-touch-id';
import { NavigationEvents } from 'react-navigation';

const Realm = require('realm');

const config = {
  title: 'Autenticación requerida', // Android
  imageColor: '#efb810', // Android
  imageErrorColor: '#D8000C', // Android
  sensorDescription: 'Posicione su huella en el lector', // Android
  sensorErrorDescription: 'No autorizado', // Android
  cancelText: 'Cancelar', // Android
  unifiedErrors: true, // use unified error messages (default false)
};

const authenticate = (navigation, page) => {
  TouchID.isSupported(config)
    .then((supported) => {
      if (supported) {
        TouchID.authenticate('Es necesario autenticarse para continuar', config)
          .then((success) => {
            navigation.navigate(page);
          })
          .catch(() => {
            // console.warn('Error al autenticarse');
          });
      } else {
        navigation.navigate(page);
      }
    })
    .catch((error) => {
      // Failure code
      console.log(error);
      navigation.navigate(page);
    });
};



const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#393D42',
    justifyContent: 'flex-start',
  },
  text:{
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    color: 'white',
    textAlign: 'center',
  },
  section: {
    display:'flex',
    flexWrap:'nowrap',
    justifyContent:'space-between',
    alignItems:'center',
    // margin: 30,
    flexDirection: 'row',
  },
  label: {
    flex: 0.5,
    color: 'white',
    textAlign:'center',
    fontSize: 18,
  },
  picker: {
    flex: 0.5,
    height: 40,
    alignSelf: 'center',
    fontSize: 18,
  },
});

let realm;

export default class RegisterScreen extends PureComponent {
  
  state = {
    username: '',
    height: '',
    weight: '',
    loading: true,
    huellaFail:false
  };

  constructor(props) {
    super(props);
    this.navigation = this.props.navigation
    realm = new Realm({ path: 'UserDatabase.realm' });

  }

  autentication = async (navigation)  =>{
    const user = realm.objects('User')[0];
    console.warn(navigation.getParam('editarDatos'));
    if(navigation.getParam('editarDatos')) {
      //Vengo de la pantalla Menú para editar datos ya cargados
      this.setState(user.userName,user.weight,user.height,false)
      this.setState({loading: false});    
    }else if(user && user.username && user.weight && user.height ) {
      // los datos ya estan cargados
      authenticate(navigation, 'Menu')
      
    } else {
      this.setState({loading: false});
    }
  }

  saveInfo = () => {
    const {
      username,
      height,
      weight
    } = this.state;

    const obj = {
      username,
      height: parseFloat(height),
      weight: parseFloat(weight)
    };

    let usuario = realm.objects('User');
    if(usuario.length == 0){
      //Todavía no existe ningun usuario(creo)
      realm.write(() => {
        realm.create('User', obj);
      });
    }else{
      //Si existe un usuario (Actualizo)
      realm.write(() => {
        // usuario.userName= obj.username
        // usuario.weight = obj.weight
        // usuario.height = obj.height
        usuario = obj
      });
    }
 }

  validInfo = () => {
    const {username, height, weight} = this.state;
    return (username && height && weight);
  }

  submit = () => {
    const { navigation } = this.props;
    if(this.validInfo()) {
      this.saveInfo();
      authenticate(navigation, 'Menu')
    } else {
      ToastAndroid.show('Debe completar todos los campos para continuar', ToastAndroid.SHORT);
    }
  }

  render() {
    const { username, height, weight, loading } = this.state;

    return(
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={()=>this.autentication(this.navigation)}
        />
          {
          loading ? 
            <View style={{ flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size="large" color="#0000ff" />
                <ButtonMenu title={'Ingresar Huella'}
                onPress={() =>  authenticate(this.props.navigation, 'Menu')}/>
            </View>
    
          : //sino esta cargando
            <View>
            <View style={{ flex: 0.2,justifyContent:'center'}}>
              <Text style={styles.title}>¡Bienvenido!</Text>
            </View>
            <View style ={{flex:0.6,justifyContent:'space-between'}}>
            <InputBarman 
                title={'Nombre'} 
                onChangeText={value => this.setState({username: value})}
                value={username}
                keyboardType={'default'}
            />
            <InputBarman 
                title={'Altura'} 
                onChangeText={value => this.setState({height: value})}
                value={height}
                keyboardType={'numeric'}
            />
            <InputBarman
                title={'Peso'} 
                onChangeText={value => this.setState({weight: value})}
                value={weight}
                keyboardType={'numeric'}
            />
            <View>
              <Text style={{alignSelf: 'center', textAlign: 'center', fontSize: 14, fontStyle: 'italic',color:'white',padding:5}}>
                Necesitamos su altura y peso para realizar cálculos</Text>
            </View>
           
            <View style={{flex:0.3,justifyContent:'center'}}>
                <ButtonMenu title={'Continuar'}
                onPress={() =>  this.submit()}/>
            </View>
            </View>
            </View>
          }
          </View>

    )
  }
}
