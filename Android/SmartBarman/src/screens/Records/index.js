import React, {PureComponent} from 'react';
import compararFechas from './compararFechas'
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Image,
  Button
} from 'react-native';

const Realm = require('realm');

const estadoSobrio = 0
const estadoModerado = 1
const estadoEbrio = 2
const propEstado = new Array()

propEstado[estadoSobrio] = {
  estado: 'sobrio',
  imagen: require('../../../assets/sobrio.jpg'),
  mensaje: 'Estás habilitado para conducir',
}
propEstado[estadoModerado] = {
  estado: 'moderado',
  imagen: require('../../../assets/moderado.png'),
  mensaje: 'Estás habilitado para conducir',
}
propEstado[estadoEbrio] = {
  estado: 'ebrio',
  imagen: require('../../../assets/ebrio.jpg'),
  mensaje: <Text style={{fontWeight:'bold',fontSize:20}}>NO podés conducir</Text>
}
const limitSobrio = 0.0
const limitAuto = 0.5


const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: 'space-between',

    backgroundColor: 'white',
    padding: 10,
  },
  

});

let realm;

export default class Records extends PureComponent {
  state = {
    loading: true,
    graduacionAlc : null,
    estadoAlc : null
  };
  

  async componentDidMount() {
    realm = new Realm({ path: 'UserDatabase.realm' });
    //Auto Genera lote de prueba
    realm.write(() => {  
      
    
    realm.create('User',{ 
      username: 'Axel',
      height: 170,
      weight: 70
    });

      
    });
    // for (let index = 0; index < 100; index++) {
    //   realm.write(() => {        
    //     realm.create('Ingested',{ bebida: 'fernet con coca',
    //                              graduacionAlc : 0.10,
    //                              fecha : '10/10/2019',
    //                              cantidad : 7
    //                            });
    //   });
    // }
    //fin lote de prueba

    let userConnect = realm.objects('User')[0];let a;let b;
    let tragos = realm.objects('Ingested').filter(aux=>
      compararFechas(aux)
    )
    let aux = 0 ;
    tragos.forEach(t0 => {
      aux += t0.graduacionAlc * t0.cantidad      
    });
    aux /= userConnect.weight
    if(aux == limitSobrio){
      this.setState({graduacionAlc:aux,estadoAlc:estadoSobrio,loading:false})
    }else if(aux < limitAuto){
      this.setState({graduacionAlc:aux,estadoAlc:estadoModerado,loading:false})
    }else{
      this.setState({graduacionAlc:aux,estadoAlc:estadoEbrio,loading:false})
    }
    



  }

  render() {
    const { loading, graduacionAlc, estadoAlc } = this.state;
    
    if(estadoAlc !== null){
      imagen = propEstado[estadoAlc].imagen;
    }else{
      imagen = null;
    }
    
    return (
      loading || imagen == null? 
      <View style={styles.cargando}>
       <ActivityIndicator/>
      </View>
      :
      <View style={styles.container}>
        <View style={{paddingTop:10}}>  
          <Text>Tu nivel de alcohol en sangre es de {parseFloat(graduacionAlc).toFixed(2)} G/l</Text>
          <Text>Tu nivel es <Text style={{fontWeight:'bold'}}>{propEstado[estadoAlc].estado}</Text></Text>
          <Text>{propEstado[estadoAlc].mensaje}</Text>
        </View>
        <View style={{flex:0.8}}>
          <Image style= {{height: '100%',width:'100%'}}
            source ={imagen} /> 
        </View>
        <View>
          <Button title="Ver Detalle"  
          onPress={({navigation})=>{this.props.navigation.navigate('RecordsDetail');}}/>
        </View>
      </View>

    );
  }
}
Records.navigationOptions = ({navigation}) => {
  return({
    headerTitle:'Estado Alcohólico',
  })
}
