import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from 'App/Themes';

const lineColor = {
  min: Colors.portError,
  re: Colors.blue,
  max: Colors.green,
};

type Props = {
  min: number;
  re: number;
  max: number;
};

function Battery(props: Props) {
  const renderLine = (name: 'min' | 're' | 'max') => {
    const fill = {
      backgroundColor: lineColor[name],
    };
    const pos: ViewProps['style'] = {
      left: `${props[name]}%`,
    };

    return (
      <View style={[styles.lineContainer, pos]} key={name}>
        <View style={[styles.lineTip, styles.topTip, fill]} />
        <View style={[styles.line, fill]} />
        <View style={[styles.lineTip, styles.bottomTip, fill]} />
      </View>
    );
  };

  return (
    <View style={styles.container} testID="battery">
      <View style={styles.body} />
      <View style={styles.tip} />

      {['min', 're', 'max'].map((val) => renderLine(val as 'min' | 're' | 'max'))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: 122,
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    position: 'absolute',
    width: 125,
    height: 50,
    left: 0,
    zIndex: 1,
    elevation: 1,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  tip: {
    position: 'absolute',
    left: 123,
    width: 7,
    height: 20,
    padding: 0,
    zIndex: 2,
    elevation: 2,
    borderTopColor: Colors.white,
    borderRightColor: Colors.white,
    borderBottomColor: Colors.white,
    borderLeftColor: Colors.transparent,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  lineContainer: {
    position: 'absolute',
    height: 60,
    top: -5,
    width: 4,
    zIndex: 3,
    elevation: 3,
    borderWidth: 0,
  },
  line: {
    position: 'absolute',
    width: 2,
    height: 60,
    top: 0,
    left: 1,
  },
  lineTip: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  topTip: {
    top: 0,
  },
  bottomTip: {
    bottom: 0,
  },
});

export default Battery;
