import { AppRegistry, Text, TextInput, LogBox } from 'react-native';
import 'react-native-gesture-handler';

// Set limits to how much users can scale the text throughout the app
// In the future, it would be nice to have a more flexible layout to accommodate a11y users
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.25;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.25;

// disable fontScaling for app
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;

// Ignore all warnings
LogBox.ignoreAllLogs();

import './aws';
import './App/Config/ReactotronConfig';
import './App/Config/Sentry';

import App from './App/Containers/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
