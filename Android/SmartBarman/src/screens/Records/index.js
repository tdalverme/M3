import React, {PureComponent} from 'react';
import compararFechas from './compararFechas'
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Image,
  ImageBackground,
  TouchableHighlight
} from 'react-native';
import ButtonMenu from '../../utils/ButtonMenu'
import ButtonSlider from '../../utils/ButtonSlider'

const Realm = require('realm');

propEstado = {
  estadoSobrio :{
    estado: 'Sobrio',
    imagen: require('../../../assets/sobrio.jpg'),
    mensaje: 'Estás habilitado para conducir',
  },
  estadoModerado:{
    estado: 'Moderado',
    imagen: require('../../../assets/moderado.png'),
    mensaje: 'Estás habilitado para conducir',
  },
  estadoEbrio : {
    estado: 'Ebrio',
    imagen: require('../../../assets/ebrio.jpg'),
    mensaje: <Text style={{fontWeight:'bold',fontSize:20}}>NO podés conducir</Text>
  }
}

const limitSobrio = 0.0
const limitAuto = 0.5


const styles = StyleSheet.create({
 
  fondo:{
    flex:1,
    justifyContent: 'space-around',
  },
  text2:{
    textAlign:'center',
    color:'black',
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
      <ImageBackground style={{
        flex:1,
        alignItems:'center'
      }} 
        source={require('../../../assets/estado_alcoho.jpg')}>
        {loading || imagen == null? 
        
        <ActivityIndicator/>
        
        :
        <View style={styles.fondo}>
          <View style={{flex:0.15,justifyContent:'space-around'}}>  
          <Text style={{color:'black',fontSize:26,fontWeight:'bold',textAlign:'center'}}>{propEstado[estadoAlc].estado}</Text>
            <View>
              <Text style={styles.text2}>Tu nivel de alcohol en sangre es de {parseFloat(graduacionAlc).toFixed(2)} G/l</Text>
              
              <Text style={styles.text2}>{propEstado[estadoAlc].mensaje}</Text>
            </View>
          </View>
          <View style={{flex:0.5}}>
            <Image style= {{height: '100%',width:'100%'}}
              source ={imagen} /> 
          </View>
          <View style={{flex:0.35,alignItems:'center'}}>
          
            <View style={{flex:1,justifyContent:'center'}}>
            {
              graduacionAlc != 0 &&
              <ButtonMenu title="Ver Detalle"  
              onPress={({navigation})=>{this.props.navigation.navigate('RecordsDetail');}}/>
              }
              
            </View>
          </View>
        </View>}
      </ImageBackground>

    );
  }
}
Records.navigationOptions = ({navigation}) => {
  return{
    headerLeft:(
    <View style={{flex:1}}>
     <TouchableHighlight onPress={()=>navigation.navigate('Menu')}>
        <Text style = {{padding:20,fontSize:30,color:'#efb810'}}>{'<'}</Text>
        </TouchableHighlight>
     </View>),
    headerStyle: {
      backgroundColor: '#393D42',
    },
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