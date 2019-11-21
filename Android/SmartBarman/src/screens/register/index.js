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
  static navigationOptions = {
    //quitamos el botón de atrás
    headerLeft:(
      <View >
       </View>),
  };
  state = {
    username: '',
    height: '',
    weight: '',
    loading: true,
    huellaFail:false,
    editar: true
  };

  constructor(props) {
    super(props);
    this.navigation = this.props.navigation
    realm = new Realm({ path: 'UserDatabase.realm' });

  }

  authenticate = (navigation, page,actualizar) => {
    TouchID.isSupported(config)
      .then((supported) => {
        if (supported) {
          TouchID.authenticate('Es necesario autenticarse para continuar', config)
            .then((success) => {
              if(actualizar){
                actualizar();
              }
              this.setState()
              navigation.navigate(page);
            })
            .catch(() => {
              this.setState({huellaFail:true,loading:false})
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

  iniciarPantalla = async (navigation)  =>{
    this.setState({
      loading: true,
      huellaFail:false,
      editar:true
    })
    const user = realm.objects('User')[0];
    if(this.props.navigation.getParam('editarDatos')) {
      //Vengo de la pantalla Menú para editar datos ya cargados
      this.setState({
                    username:user.username,
                    weight:parseFloat(user.weight),
                    height:parseFloat(user.height),
                    loading:false,
                    })
    }else if(user && user.username && user.weight && user.height ) {
      this.setState({loading: false,editar:false});
      this.authenticate(navigation, 'Menu')  
      
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
        usuario[0].username  = obj.username
        usuario[0].weight  = obj.weight
        usuario[0].height  = obj.height
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
      
      this.authenticate(navigation, 'Menu',this.saveInfo)
    } else {
      ToastAndroid.show('Debe completar todos los campos para continuar', ToastAndroid.SHORT);
    }
  }

  render() {
    const { username, height, weight, loading,huellaFail,editar } = this.state;

    return(
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={()=>this.iniciarPantalla(this.navigation)}
        />
          {
          loading? 
          // se esta cargando la pagina
            <View style={{ flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator color = "#efb810" size="large" color="#0000ff" />
                <ButtonMenu title={'Ingresar Huella'}
                onPress={() =>  this.authenticate(this.props.navigation, 'Menu')}/>
            </View>
    
          : huellaFail && !editar?
            // el usuario ya tenia sus datos cargados y tenía que entrar directo
            // Sin embargo, fallo o puso cancelar. Reintentar:
            <View style={{ flex:1,justifyContent:'center',alignItems:'center'}}>
            <ButtonMenu title={'Ingresar Huella'}
            onPress={() =>  this.authenticate(this.props.navigation, 'Menu')}/>
            </View>
            : 
            //Pantalla de carga y/o edición de datos
            <View style={{flex:1}}>
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
                    onChangeText={value => this.setState({height: parseFloat(value)})}
                    value={height}
                    keyboardType={'numeric'}
                />
                <InputBarman
                    title={'Peso'} 
                    onChangeText={value => this.setState({weight: parseFloat(value)})}
                    value={weight}
                    keyboardType={'numeric'}
                />
            
              <Text style={{alignSelf: 'center', textAlign: 'center', fontSize: 14, fontStyle: 'italic',color:'white',padding:5}}>
                Necesitamos su altura y peso para realizar cálculos</Text>
            </View>
           
            <View style={{flex:0.3,justifyContent:'center',alignItems:'center'}}>
                <ButtonMenu title={'Continuar'}
                onPress={() =>  this.submit()}/>
            </View>
            </View>
          }
          </View>

    )
  }
}
