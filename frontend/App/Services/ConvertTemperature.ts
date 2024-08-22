import { TemperatureUnits } from 'App/Types/Units';

export const celsiusToFahrenheit = (celsius: number): number => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  return Math.round(fahrenheit);
};

export const convertTemperature = (
  temperatureType: TemperatureUnits,
  value: number = 20,
  isDisabled: boolean = false,
  withSpace: boolean = false,
): string => {
  // from the Backend we always get celsius
  const convertedValue = temperatureType === TemperatureUnits.celsius ? Math.round(value) : celsiusToFahrenheit(value);

  const convertedFormat = temperatureType === TemperatureUnits.celsius ? '˚C' : '˚F';

  return `${isDisabled ? '--' : convertedValue}${withSpace ? ' ' : ''}${convertedFormat}`;
};
