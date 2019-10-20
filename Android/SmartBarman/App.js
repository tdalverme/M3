import React from 'react';
import Navigation from './src/Navigation';

const Realm = require('realm');

const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    height: 'float',
    weight: 'float',
    alcoholLevel: {type: 'float', optional: true},
    alcoholicDrinkPercentage: {type: 'float', optional: true}
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
    Realm.open({
      path: 'UserDatabase.realm',
      schema: [UserSchema, DrinkSchema]
    });
  }

  render() {
    return <Navigation />;
  }
}
