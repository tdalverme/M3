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
import ButtonMenu from '../../utils/ButtonMenu'

const Realm = require('realm');

propEstado = {
  estadoSobrio :{
    estado: 'sobrio',
    imagen: require('../../../assets/sobrio.jpg'),
    mensaje: 'Estás habilitado para conducir',
  },
  estadoModerado:{
    estado: 'moderado',
    imagen: require('../../../assets/moderado.png'),
    mensaje: 'Estás habilitado para conducir',
  },
  estadoEbrio : {
    estado: 'ebrio',
    imagen: require('../../../assets/ebrio.jpg'),
    mensaje: <Text style={{fontWeight:'bold',fontSize:20}}>NO podés conducir</Text>
  }
}

const limitSobrio = 0.0
const limitAuto = 0.5


const styles = StyleSheet.create({
 
  fondo:{
    flex:1,
    backgroundColor:'#393D42',
    justifyContent: 'space-around',
  },
  text2:{
    textAlign:'center',
    color:'white',
    fontWeight:'bold',
    fontSize:16
  }

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

    let userConnect = realm.objects('User')[0];let a;let b;
    let tragos = realm.objects('Ingested').filter(aux=>
      compararFechas(aux)
    )
    let graduacionAlc = 0 ;
    tragos.forEach(t0 => {
      graduacionAlc += t0.graduacionAlc  
    });
    graduacionAlc /= userConnect.weight
    if(graduacionAlc == limitSobrio){
      this.setState({graduacionAlc,estadoAlc:'estadoSobrio',loading:false})
    }else if(graduacionAlc < limitAuto){
      this.setState({graduacionAlc,estadoAlc:'estadoModerado',loading:false})
    }else{
      this.setState({graduacionAlc,estadoAlc:'estadoEbrio',loading:false})
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
      <View style={styles.fondo}>
       <ActivityIndicator/>
      </View>
      :
      <View style={styles.fondo}>
        <View style={{flex:0.2,justifyContent:'center'}}>  
          <Text style={styles.text2}>Tu nivel de alcohol en sangre es de {parseFloat(graduacionAlc).toFixed(2)} G/l</Text>
          <Text style={styles.text2}>Tu nivel es <Text style={{color:'#efb810',fontSize:20,fontWeight:'bold'}}>{propEstado[estadoAlc].estado}</Text></Text>
          <Text style={styles.text2}>{propEstado[estadoAlc].mensaje}</Text>
        </View>
        <View style={{flex:0.5}}>
          <Image style= {{height: '100%',width:'100%'}}
            source ={imagen} /> 
        </View>
        <View style={{flex:0.3,alignItems:'center'}}>
        
          <View style={{flex:1,justifyContent:'center'}}>
          {
            graduacionAlc != 0 &&
            <ButtonMenu title="Ver Detalle"  
            onPress={({navigation})=>{this.props.navigation.navigate('RecordsDetail');}}/>
            }
            <ButtonMenu title="Volver al menú"  
            onPress={({navigation})=>{this.props.navigation.navigate('Menu');}}/>
          </View>
        </View>
      </View>

    );
  }
}
Records.navigationOptions = ({navigation}) => {
  return{
    headerLeft:(<View></View>),
    headerTitle: <View style={{flex:0.85}}>
    <Text style={{textAlign:'center',
                  fontSize:22,
                  color:'white',
                  fontWeight:'bold'}}>
      Estado Alcohólico
    </Text>
  </View>,
  }
}