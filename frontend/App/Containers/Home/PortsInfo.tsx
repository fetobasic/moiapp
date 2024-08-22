import React from 'react';
import { useSelector } from 'react-redux';
import { View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderSimple as Header, Info } from 'App/Components';

import { ApplicationStyles, Colors } from 'App/Themes';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import renderElement from 'App/Services/RenderElement';
import { getCurrentDevice } from 'App/Store/Devices/selectors';

import InputIcon from 'App/Images/Icons/input.svg';
import OutputIcon from 'App/Images/Icons/output.svg';

import SocketIcon from 'App/Images/Icons/portInSocket.svg';
import SunIcon from 'App/Images/Icons/portInSun.svg';
import AuxIcon from 'App/Images/Icons/portInAux.svg';

import AcIcon from 'App/Images/Icons/portOutAc.svg';
import V12Icon from 'App/Images/Icons/portOut12v.svg';
import UsbIcon from 'App/Images/Icons/portOutUsb.svg';
import { YetiState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<HomeStackParamList, 'PortsInfo'>;

function PortsInfo({ route }: Props) {
  const device = useSelector(getCurrentDevice(route.params.device.thingName || '')) as YetiState;

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Ports" />
      <ScrollView>
        {/* Input */}
        <Info
          isFirst
          icon={renderElement(<InputIcon />)}
          title={`${device.wattsIn} W`}
          description="Input"
          titleColor={Colors.blue}
        />
        <Info
          icon={renderElement(<SocketIcon />)}
          title="From the wall"
          description="Fully recharges in 14 hours using the included 120W Power Supply AC Wall Charger."
        />
        <Info
          icon={renderElement(<SunIcon />)}
          title="From the sun"
          description="Recharge from the sun by connecting a compatible solar panel. Charge times are dependent on the size of the solar panel."
        />
        <Info
          icon={renderElement(<AuxIcon />)}
          title="From the car"
          description="The Goal Zero Yeti 1400 can be charged by plugging into your 12V adapter using the Goal Zero Yeti Lithium 12V Car Charging Cable."
        />

        {/* Output */}
        <Info
          isFirst
          icon={renderElement(<OutputIcon />)}
          title={`${device.wattsOut} W`}
          description="Output"
          titleColor={Colors.green}
        />
        <Info
          icon={renderElement(<AcIcon />)}
          title="Take your wall outlet anywhere"
          description="Allows you to run power-hungry devices and appliances with confidence."
        />
        <Info
          icon={renderElement(<V12Icon />)}
          title="Versatile port options"
          description="Power a wide range of devices with seven different port options including fast-charging 60W USB-C Power Delivery, multiple USB-A ports, regulated 12V, and two 120V AC ports."
        />
        <Info icon={renderElement(<UsbIcon />)} title="Connection USB and USB-C" />
      </ScrollView>
    </View>
  );
}

export default PortsInfo;
