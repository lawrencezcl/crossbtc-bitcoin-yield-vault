import React from 'react';
import { AppRegistry } from 'react-native';
import App from '../App';
import { name as appName } from '../app.json';

// Import react-native-web
import { getStyleRegistry } from 'react-native-web/dist/exports/StyleSheet/getStyleRegistry';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);

// For web rendering
const rootTag = document.getElementById('root');

if (rootTag) {
  AppRegistry.runApplication(appName, {
    rootTag,
  });
}

// Enable hot module replacement
if (module.hot) {
  module.hot.accept();
}