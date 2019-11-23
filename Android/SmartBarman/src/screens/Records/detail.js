import React, {PureComponent} from 'react';
import moment from 'moment'
import compararFechas from './compararFechas'
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  View,
  TouchableHighlight
} from 'react-native';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#393D42',
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
    color: 'white',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
    color: 'white',
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

    let r = realm.objects('Ingested').filter((aux) =>
      compararFechas(aux)
    )
    this.setState({data:r,loading:false})
  }

  render() {
    const { loading, data } = this.state;
    return (
      loading?
      <View style={styles.container}>
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
            <Text style= {styles.textLeft}>
               { item.bebida }
            </Text>
          </View>
          <View style = {styles.containerVertical}>
            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}>
                <Text  style= {styles.textLeft}>Alcohol </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  {parseFloat(item.graduacionAlc).toFixed(2)} gr
                </Text>
              </View>
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal} >
                <Text  style= {styles.textLeft}>Pureza </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                {parseFloat(item.porcentaje).toFixed(2)} %
                </Text>
              </View>
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}>
                <Text  style= {styles.textLeft}>Hora </Text>
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
    headerTitle:'Detalle Estado Alcohólico',
    headerLeft:(
      <View style={{flex:1}}>
        <TouchableHighlight onPress={()=>navigation.navigate('Records')}>
          <Text style = {{padding:20,fontSize:30,color:'#efb810'}}>{'<'}</Text>
          </TouchableHighlight>
        </View>),
      headerStyle: {
        backgroundColor: '#393D42',
    },
  })
}
