import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import HomeScreen from './screens/home';
import ConnectionScreen from './screens/connection/ConnectionScreen';
import RegisterScreen from './screens/register';

const Stack = createStackNavigator({
  Home: HomeScreen,
  Connection: ConnectionScreen,
  Register: RegisterScreen,
}, {
  initialRouteName: 'Connection'
});

const App = createAppContainer(Stack);

export default App;
