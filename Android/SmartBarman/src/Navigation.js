import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import HomeScreen from './screens/home';
import ConnectionScreen from './screens/connection/ConnectionScreen';
import RegisterScreen from './screens/register';
import Records from  './screens/Records';

const Stack = createStackNavigator({
  Records: Records ,
  Home: HomeScreen,
  Connection: ConnectionScreen,
  Register: RegisterScreen,
}, {
  initialRouteName: 'Records'
});

const App = createAppContainer(Stack);

export default App;
