/**
 * @format
 */

// Polyfill Intl for JSC (Android without Hermes)
if (typeof Intl === 'undefined') {
  require('intl');
  require('intl/locale-data/jsonp/en');
}

import {AppRegistry, Text, TextInput} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';
TrackPlayer.registerPlaybackService(() => require("./src/components/player/service"));
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

// Setting default props for the placeholder
TextInput.defaultProps.placeholder = TextInput.defaultProps.placeholder || '';
TextInput.defaultProps.placeholderTextColor = TextInput.defaultProps.placeholderTextColor || 'gray';

AppRegistry.registerComponent(appName, () => App);
