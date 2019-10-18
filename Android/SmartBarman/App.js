import React from 'react';
import Navigation from './src/Navigation';

const Realm = require('realm');

const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    height: 'float',
    weight: 'float',
    alcoholLevel: 'float',
    alcoholicDrinkPercentage: 'float'
  }
};

const DrinkSchema = {
  name: 'Drink',
  properties: {
    name: 'string',
    ingredient1Percentage: 'float',
    ingredient2Percentage: 'float'
  }
};

export default class App extends React.Component {

  componentWillMount() {
    Realm.open({schema: [UserSchema, DrinkSchema]});
  }

  render() {
    return <Navigation />;
  }
}
