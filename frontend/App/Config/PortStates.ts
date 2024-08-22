export default {
  disabled: 0,
  enabled: 1,
  portFault: 2,
  lowVoltage: 3,
  lowVoltageWarning: 4,
};

export const appPort12VOutStates = {
  APP_PORT_12V_OUT_OFF: 0,
  APP_PORT_12V_OUT_ON: 1,
  APP_PORT_12V_OUT_DISCHARGING: 2,
  APP_PORT_12V_OUT_WARNING: 3, // Currently unused
  APP_PORT_12V_OUT_24V_AUX_ON: 4,
  APP_PORT_12V_OUT_FAULT: 5,
};

export const appPortAcOutStates = {
  APP_PORT_AC_OUT_OFF: 0,
  APP_PORT_AC_OUT_BATTERY_SOURCE: 1,
  APP_PORT_AC_OUT_INVERTER_SOURCE: 2,
  APP_PORT_AC_OUT_FAULT: 3,
};
