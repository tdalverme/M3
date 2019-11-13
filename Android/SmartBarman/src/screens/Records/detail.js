import React, {PureComponent} from 'react';
import moment from 'moment'
import compararFechas from './compararFechas'
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  View
} from 'react-native';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  containerHorizontal:{

    flex: 1,
    flexDirection : 'row',
    justifyContent: 'space-between',
    flexWrap : "nowrap",
  },
  containerVertical:{
    flex: 1,
    flexDirection : 'column',
    justifyContent: 'space-between',
    flexWrap : "nowrap",
    padding: 8,
    borderBottomWidth :1,
    borderBottomColor: '#ccc'
  },
  cargando:{
    flex: 1,
    alignItems:'center',
    justifyContent:'center'
  },
  title: {
    fontSize: 22,
    color: 'black',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },

});

let realm;

export default class DetailScreen extends PureComponent {
  state = {
    loading: true,
    data : []
  };

  async componentDidMount() {
    realm = new Realm({ path: 'UserDatabase.realm' });
 
    realm.write(() => {  
      realm.create('Ingested',{ bebida: 'Fernet de Coca',
      graduacionAlc : 0.30,
      fecha : new Date(),
      cantidad : 75
    });
      realm.create('Ingested',{ bebida: 'Fernet de Coca',
      graduacionAlc : 0.30,
      fecha : new Date(2019,9,26,10,28,0), 
      cantidad : 75
    });
    })
    let r = realm.objects('Ingested').filter((aux) =>
      compararFechas(aux)
    )//filtrar por fecha
    this.setState({data:r,loading:false})
  }

  render() {
    const { loading, data } = this.state;
    return (
      loading?
      <View style={styles.cargando}>
       <ActivityIndicator/>
      </View>
      :
      <View  style={styles.container}>
      <FlatList  
      keyExtractor = {(item, index) => index.toString()}
      data = {data} 
      renderItem = {({ item }) => (
        <View style = {styles.containerHorizontal}>
          <View style = {styles.containerVertical}>
            <Text >
               { item.bebida }
            </Text>
          </View>
          <View style = {styles.containerVertical}>
            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}> 
                <Text>Alcohol </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  {parseFloat(item.graduacionAlc).toFixed(2)}% 
                </Text> 
              </View>  
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal} >
                <Text>Cantidad </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                {parseFloat(item.cantidad).toFixed(2)} ml
                </Text>
              </View>
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}>
                <Text>Fecha </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  { moment(item.fecha).format('HH:mm:ss')
                   } 
                </Text>
              </View>
            </View>

          </View>
        </View>
      )}
      />
    </View>

    );
  }
}
DetailScreen.navigationOptions = ({navigation}) => {
  return({
    headerTitle:'Detalle Estado Alcoholico',
  })
}