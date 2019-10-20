import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  View
} from 'react-native';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  title: {
    fontSize: 22,
    color: 'black',
    textAlign: 'center',
  },
  section: {
    flex: 0.2,
    margin: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    flex: 0.5,
    color: 'black',
    fontSize: 18,
  },
  picker: {
    flex: 0.5,
    height: 40,
    width: '100%',
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
  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });

  }

  async componentDidMount() {
    const { navigation } = this.props;
    const user = realm.objects('User')[0];
    if(user && user.username && user.weight && user.height) {
      navigation.navigate('Home');
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
    realm.write(() => {
      realm.create('User', obj);
    });
  }

  validInfo = () => {
    const {username, height, weight} = this.state;
    return (username && height && weight);
  }

  submit = () => {
    const { navigation } = this.props;
    if(this.validInfo()) {
      this.saveInfo();
      navigation.navigate('Home');
    } else {
      ToastAndroid.show('Debe completar todos los campos para continuar', ToastAndroid.SHORT);
    }
  }

  render() {
    const { username, height, weight, loading } = this.state;
    if(loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
    return (
        <View style={styles.container}>
          <View style={{ flex: 0.2 }}>
            <Text style={styles.title}>Bienvenido!</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              underlineColorAndroid={'grey'}
              style={styles.picker}
              onChangeText={value => this.setState({username: value})}
              value={username}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Altura</Text>
            <TextInput
              underlineColorAndroid={'grey'}
              style={styles.picker}
              keyboardType={'numeric'}
              onChangeText={value => this.setState({height: value})}
              value={height}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Peso</Text>
            <TextInput
              underlineColorAndroid={'grey'}
              style={styles.picker}
              keyboardType={'numeric'}
              onChangeText={value => this.setState({weight: value})}
              value={weight}
            />
          </View>

          <View style={{ flex: 0.1 }}>
            <Text style={{alignSelf: 'center', textAlign: 'center', fontSize: 14, fontStyle: 'italic'}}>Necesitamos su altura y peso para realizar cálculos</Text>
          </View>
          <TouchableOpacity
            style={{backgroundColor: 'green', margin: 20}}
            onPress={() => this.submit()}>
            <Text style={{color: 'white', padding: 10}}> CONTINUAR </Text>
          </TouchableOpacity>
        </View>

    );
  }
}
