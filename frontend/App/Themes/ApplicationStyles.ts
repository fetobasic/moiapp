import { StyleSheet } from 'react-native';
import Metrics from './Metrics';
import Colors from './Colors';
import { isAndroid } from './Platforms';

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

const ApplicationStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Metrics.baseMargin,
    paddingBottom: isAndroid ? Metrics.baseMargin : 0,
  },
  section: {
    paddingTop: Metrics.marginSection,
    marginHorizontal: Metrics.baseMargin,
  },
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  textGreen: {
    color: Colors.green,
  },
  textRed: {
    color: Colors.red,
  },
  textBlue: {
    color: Colors.blue,
  },
  textNote: {
    color: Colors.note,
  },
  divider: {
    height: 1,
    marginVertical: Metrics.halfMargin,
    backgroundColor: Colors.border,
  },
});

export default ApplicationStyles;
