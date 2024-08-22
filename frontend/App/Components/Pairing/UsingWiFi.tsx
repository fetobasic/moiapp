import React from 'react';
import { Animated } from 'react-native';

import Row from './InfoRow';
import WiFiIcon from 'App/Images/Icons/wifi.svg';
import renderElement from 'App/Services/RenderElement';

function UsingWiFi() {
  return (
    <Animated.View testID="usingWiFi">
      <Row
        title="Pair Using Device WiFi"
        withBorder={false}
        subTitle="If you're having trouble, you can try pairing with the device WiFi instead."
        icon={renderElement(<WiFiIcon />)}
      />
    </Animated.View>
  );
}

export default UsingWiFi;
